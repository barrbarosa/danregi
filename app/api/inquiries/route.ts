import { NextResponse } from "next/server";

import { inquirySchema, type SubmitResponse } from "@/lib/inquiry-schema";
import { buildPayload } from "@/lib/payload";
import { normalizePhone } from "@/lib/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** זמן המתנה מרבי לתגובת היעד. מעבר לכך התוצאה אינה ידועה. */
const TARGET_TIMEOUT_MS = 10_000;

/** גוף בקשה גדול מזה נדחה לפני פרסינג. */
const MAX_BODY_BYTES = 32 * 1024;

/**
 * קודי שגיאת רשת שמעידים שהבקשה מעולם לא הגיעה ליעד, ולכן מדובר
 * בכשל ודאי שאפשר להציע עליו ניסיון חוזר.
 */
const NEVER_REACHED_CODES = new Set([
  "ENOTFOUND",
  "ECONNREFUSED",
  "EAI_AGAIN",
]);

function json(body: SubmitResponse, status: number) {
  return NextResponse.json(body, { status });
}

/** לוג תפעולי בלבד. לעולם בלי שם, טלפון, דוא״ל, גוש או חלקה. */
function logOutcome(fields: Record<string, string | number | undefined>) {
  console.info("[inquiries]", JSON.stringify(fields));
}

function errorCode(error: unknown): string | undefined {
  const cause = (error as { cause?: { code?: unknown } })?.cause;
  return typeof cause?.code === "string" ? cause.code : undefined;
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  const endpointUrl = process.env.INQUIRY_ENDPOINT_URL;
  const endpointToken = process.env.INQUIRY_ENDPOINT_TOKEN;

  // תצורה חסרה היא שגיאת שרת. לעולם לא מחזירים הצלחה מדומה.
  if (!endpointUrl) {
    console.error(
      "[inquiries] INQUIRY_ENDPOINT_URL is not configured; refusing to accept submissions.",
    );
    return json({ status: "config_error" }, 500);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ status: "invalid" }, 413);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ status: "invalid" }, 400);
  }

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key] = issue.message;
      }
    }
    return json({ status: "invalid", fieldErrors }, 400);
  }

  const inquiry = parsed.data;

  // honeypot: מאשרים לבוט בלי לשלוח ליעד ובלי לרמוז שהמלכודת זוהתה.
  if (inquiry.website !== "") {
    logOutcome({ outcome: "honeypot" });
    return json({ status: "accepted" }, 200);
  }

  const payload = buildPayload({
    inquiry,
    submissionId: inquiry.submissionId,
    normalizedPhone: normalizePhone(inquiry.phone),
    submittedAt: new Date().toISOString(),
  });

  const headers: Record<string, string> = {
    "content-type": "application/json",
    // מפתח ייחודי לפנייה הלוגית. נשמר זהה בניסיון חוזר מאותו טופס.
    "idempotency-key": inquiry.submissionId,
  };
  if (endpointToken) {
    headers.authorization = `Bearer ${endpointToken}`;
  }

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TARGET_TIMEOUT_MS),
      cache: "no-store",
    });

    logOutcome({
      submissionId: inquiry.submissionId,
      outcome: response.ok ? "accepted" : "failed",
      targetStatus: response.status,
      durationMs: Date.now() - startedAt,
    });

    // אין ניסיון חוזר אוטומטי: היעד טרם התחייב לתמיכת idempotency.
    if (!response.ok) {
      return json({ status: "failed" }, 502);
    }

    return json({ status: "accepted" }, 200);
  } catch (error) {
    const code = errorCode(error);
    const name = error instanceof Error ? error.name : "Error";
    const neverReached = code !== undefined && NEVER_REACHED_CODES.has(code);

    logOutcome({
      submissionId: inquiry.submissionId,
      outcome: neverReached ? "failed" : "unknown",
      errorName: name,
      errorCode: code,
      durationMs: Date.now() - startedAt,
    });

    // הבקשה מעולם לא יצאה אל היעד, ולכן זהו כשל ודאי.
    if (neverReached) {
      return json({ status: "failed" }, 502);
    }

    // timeout או ניתוק באמצע: לא ניתן לאמת קבלה ואסור לטעון כישלון.
    return json({ status: "unknown" }, 202);
  }
}
