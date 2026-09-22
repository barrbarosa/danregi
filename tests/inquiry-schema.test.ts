import { describe, expect, it } from "vitest";

import { inquirySchema } from "@/lib/inquiry-schema";

const valid = {
  fullName: "ישראל ישראלי",
  phone: "050-1234567",
  email: "client@example.com",
  inquiryType: "buyer",
  block: "12345",
  parcel: "67",
  locality: "מודיעין",
  askingPrice: "850000",
  details: "הקרקע הוצעה לי על ידי משווק.",
  submissionId: "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  website: "",
};

describe("inquirySchema", () => {
  it("מקבל פנייה תקינה", () => {
    const result = inquirySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("דורש שם, טלפון, דוא״ל, סוג פנייה, גוש וחלקה", () => {
    const result = inquirySchema.safeParse({
      submissionId: valid.submissionId,
    });
    expect(result.success).toBe(false);

    const fields = new Set(
      result.success ? [] : result.error.issues.map((issue) => issue.path[0]),
    );
    for (const field of [
      "fullName",
      "phone",
      "email",
      "inquiryType",
      "block",
      "parcel",
    ]) {
      expect(fields).toContain(field);
    }
  });

  it("שומר גוש כמחרוזת ולא מאבד אפס מוביל", () => {
    const result = inquirySchema.safeParse({ ...valid, block: "06421" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.block).toBe("06421");
      expect(typeof result.data.block).toBe("string");
    }
  });

  it("דוחה גוש או חלקה שאינם ספרות", () => {
    expect(inquirySchema.safeParse({ ...valid, block: "12a45" }).success).toBe(
      false,
    );
    expect(inquirySchema.safeParse({ ...valid, parcel: "67/2" }).success).toBe(
      false,
    );
  });

  it("דוחה כתובת דוא״ל לא תקינה", () => {
    expect(
      inquirySchema.safeParse({ ...valid, email: "client@" }).success,
    ).toBe(false);
  });

  it("דוחה מספר טלפון קצר מדי", () => {
    expect(inquirySchema.safeParse({ ...valid, phone: "0501" }).success).toBe(
      false,
    );
  });

  it("מקבל טלפון עם קידומת מדינה", () => {
    const result = inquirySchema.safeParse({
      ...valid,
      phone: "+972 50 123 4567",
    });
    expect(result.success).toBe(true);
  });

  it("מאפשר מחיר מבוקש לרוכש ולמוכר", () => {
    for (const inquiryType of ["buyer", "seller"]) {
      const result = inquirySchema.safeParse({ ...valid, inquiryType });
      expect(result.success).toBe(true);
    }
  });

  it("דוחה מחיר מבוקש עבור בעל קרקע", () => {
    const result = inquirySchema.safeParse({
      ...valid,
      inquiryType: "owner",
      askingPrice: "850000",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path[0]).toBe("askingPrice");
    }
  });

  it("מקבל בעל קרקע ללא מחיר מבוקש", () => {
    const result = inquirySchema.safeParse({
      ...valid,
      inquiryType: "owner",
      askingPrice: "",
    });
    expect(result.success).toBe(true);
  });

  it("דוחה מזהה פנייה שאינו UUID", () => {
    expect(
      inquirySchema.safeParse({ ...valid, submissionId: "abc" }).success,
    ).toBe(false);
  });

  it("משאיר שדות רשות כמחרוזת ריקה כשהם חסרים", () => {
    const { locality, askingPrice, details, ...rest } = valid;
    void locality;
    void askingPrice;
    void details;
    const result = inquirySchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.locality).toBe("");
      expect(result.data.details).toBe("");
      expect(result.data.askingPrice).toBe("");
    }
  });
});
