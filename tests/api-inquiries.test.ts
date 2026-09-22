import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/inquiries/route";

const ENDPOINT = "https://target.example.com/inquiries";

const validBody = {
  fullName: "ישראל ישראלי",
  phone: "050-1234567",
  email: "client@example.com",
  inquiryType: "buyer",
  block: "12345",
  parcel: "67",
  locality: "מודיעין",
  askingPrice: "850000",
  details: "",
  submissionId: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  website: "",
};

function post(body: unknown) {
  return POST(
    new Request("http://localhost:3000/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

/** הקריאה האחרונה שבוצעה ליעד החיצוני. */
function lastCall() {
  const fetchMock = vi.mocked(globalThis.fetch);
  const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return {
    url,
    init,
    payload: JSON.parse(init.body as string),
    headers: init.headers as Record<string, string>,
  };
}

beforeEach(() => {
  vi.stubEnv("INQUIRY_ENDPOINT_URL", ENDPOINT);
  vi.stubEnv("INQUIRY_ENDPOINT_TOKEN", "secret-token");
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/inquiries", () => {
  it("מעביר ליעד payload בדיוק לפי חוזה ה-PRD ומחזיר accepted", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    const response = await post(validBody);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "accepted" });

    const { url, payload } = lastCall();
    expect(url).toBe(ENDPOINT);
    expect(payload).toEqual({
      schemaVersion: "1.0",
      submissionId: validBody.submissionId,
      submittedAt: expect.any(String),
      service: "land-consultation",
      contact: {
        fullName: "ישראל ישראלי",
        phone: "+972501234567",
        email: "client@example.com",
      },
      inquiry: {
        type: "buyer",
        block: "12345",
        parcel: "67",
        locality: "מודיעין",
        askingPrice: 850000,
        currency: "ILS",
        details: "",
      },
      offer: { priceIls: 1190, vatIncluded: true },
    });
    expect(new Date(payload.submittedAt).toISOString()).toBe(
      payload.submittedAt,
    );
    // ה-honeypot לעולם אינו מועבר ליעד.
    expect(payload).not.toHaveProperty("website");
  });

  it("מנרמל טלפון ישראלי ל-E.164", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(null, { status: 200 }),
    );
    await post({ ...validBody, phone: "050-1234567" });
    expect(lastCall().payload.contact.phone).toBe("+972501234567");
  });

  it("שולח Idempotency-Key זהה עבור אותו submissionId בניסיון חוזר", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    await post(validBody);
    const first = lastCall().headers["idempotency-key"];
    await post(validBody);
    const second = lastCall().headers["idempotency-key"];

    expect(first).toBe(validBody.submissionId);
    expect(second).toBe(first);
  });

  it("שולח את טוקן האימות בכותרת Authorization", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(null, { status: 200 }),
    );
    await post(validBody);
    expect(lastCall().headers.authorization).toBe("Bearer secret-token");
  });

  it("דוחה גוף לא תקין עם 400 ובלי לפנות ליעד", async () => {
    const response = await post({ ...validBody, block: "לא-מספר", email: "x" });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.status).toBe("invalid");
    expect(body.fieldErrors).toHaveProperty("block");
    expect(body.fieldErrors).toHaveProperty("email");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("מחזיר failed כשהיעד מחזיר שגיאת שרת", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response("internal", { status: 500 }),
    );

    const response = await post(validBody);
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ status: "failed" });
  });

  it("מחזיר failed כשהיעד דוחה את הפנייה", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response("rejected", { status: 400 }),
    );
    await expect((await post(validBody)).json()).resolves.toEqual({
      status: "failed",
    });
  });

  it("מחזיר unknown ולא failed כאשר היעד לא הגיב בזמן", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(
      new DOMException("The operation was aborted", "TimeoutError"),
    );

    const response = await post(validBody);
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ status: "unknown" });
  });

  it("מחזיר failed כאשר הבקשה כלל לא הגיעה ליעד", async () => {
    const error = new TypeError("fetch failed");
    (error as Error & { cause?: unknown }).cause = { code: "ECONNREFUSED" };
    vi.mocked(globalThis.fetch).mockRejectedValue(error);

    await expect((await post(validBody)).json()).resolves.toEqual({
      status: "failed",
    });
  });

  it("מחזיר שגיאת תצורה כאשר חסרה כתובת יעד, בלי הצלחה מדומה", async () => {
    vi.stubEnv("INQUIRY_ENDPOINT_URL", "");

    const response = await post(validBody);
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ status: "config_error" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("בולע פניות בוט שמילאו את ה-honeypot בלי לפנות ליעד ובלי לחשוף זאת", async () => {
    const response = await post({ ...validBody, website: "spam" });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "accepted" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("אינו רושם פרטים אישיים ללוג", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    await post(validBody);

    const logged = info.mock.calls.flat().join(" ");
    for (const secret of [
      validBody.fullName,
      validBody.email,
      validBody.block,
      validBody.parcel,
      "1234567",
    ]) {
      expect(logged).not.toContain(secret);
    }
  });
});
