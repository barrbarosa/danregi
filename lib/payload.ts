import type { Inquiry } from "@/lib/inquiry-schema";
import { siteConfig } from "@/lib/site-config";

/** מבנה ה-JSON המועבר ליעד החיצוני, לפי חוזה ה-PRD. */
export type InquiryPayload = {
  schemaVersion: "1.0";
  submissionId: string;
  submittedAt: string;
  service: "land-consultation";
  contact: {
    fullName: string;
    phone: string;
    email: string;
  };
  inquiry: {
    type: Inquiry["inquiryType"];
    block: string;
    parcel: string;
    locality: string;
    askingPrice: number | null;
    currency: "ILS";
    details: string;
  };
  offer: {
    priceIls: number;
    vatIncluded: boolean;
  };
};

/**
 * בונה את ה-payload מתוך פנייה שעברה ולידציה.
 *
 * submittedAt נוצר בשרת בלבד. המחיר ב-payload מתאר את ההצעה ואינו אישור
 * תשלום. שדה ה-honeypot לעולם אינו נכנס ל-payload.
 */
export function buildPayload(params: {
  inquiry: Inquiry;
  submissionId: string;
  normalizedPhone: string;
  submittedAt: string;
}): InquiryPayload {
  const { inquiry, submissionId, normalizedPhone, submittedAt } = params;

  return {
    schemaVersion: "1.0",
    submissionId,
    submittedAt,
    service: "land-consultation",
    contact: {
      fullName: inquiry.fullName,
      phone: normalizedPhone,
      email: inquiry.email,
    },
    inquiry: {
      type: inquiry.inquiryType,
      block: inquiry.block,
      parcel: inquiry.parcel,
      locality: inquiry.locality,
      askingPrice: inquiry.askingPrice === "" ? null : Number(inquiry.askingPrice),
      currency: "ILS",
      details: inquiry.details,
    },
    offer: {
      priceIls: siteConfig.priceIls,
      vatIncluded: siteConfig.vatIncluded,
    },
  };
}
