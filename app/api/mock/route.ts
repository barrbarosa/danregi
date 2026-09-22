import { NextResponse } from "next/server";

/**
 * יעד בדיקה מקומי שמחליף את ה-endpoint החיצוני עד שיתקבל חוזה ממשק אמיתי.
 * חסום בפרודקשן.
 *
 * תרחישים: ?scenario=ok | slow | error | reject
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ארוך מה-timeout של נתיב הפנייה, כדי לדמות תוצאה לא ידועה. */
const SLOW_DELAY_MS = 15_000;

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const scenario =
    new URL(request.url).searchParams.get("scenario") ?? "ok";

  const body = await request.json().catch(() => null);
  console.info(
    "[mock] scenario=%s idempotency-key=%s submissionId=%s",
    scenario,
    request.headers.get("idempotency-key"),
    (body as { submissionId?: string } | null)?.submissionId,
  );

  switch (scenario) {
    case "slow":
      await new Promise((resolve) => setTimeout(resolve, SLOW_DELAY_MS));
      return NextResponse.json({ received: true });

    case "error":
      return NextResponse.json({ error: "internal" }, { status: 500 });

    case "reject":
      return NextResponse.json({ error: "rejected" }, { status: 400 });

    default:
      return NextResponse.json({ received: true });
  }
}
