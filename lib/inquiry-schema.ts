import { z } from "zod";

/**
 * מקור האמת היחיד לצורת הפנייה. הלקוח והשרת מייבאים את אותה סכמה,
 * כך שוולידציית הלקוח וולידציית השרת לא יכולות להתפצל.
 */

export const INQUIRY_TYPES = ["buyer", "seller", "owner"] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

/** סוגי הפנייה שעבורם מוצג שדה המחיר המבוקש. */
export const TYPES_WITH_ASKING_PRICE: readonly InquiryType[] = [
  "buyer",
  "seller",
];

/**
 * ולידציה מקלה של טלפון. הנרמול המלא ל-E.164 מתבצע בשרת בלבד
 * (ראו lib/phone.ts), כדי לא לטעון ספריית טלפונים לדפדפן.
 */
const PHONE_PATTERN = /^[+()\-\s\d]{9,20}$/;
const DIGITS_ONLY = /\d/g;

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, { message })
    .optional()
    .transform((value) => value ?? "");

/** שדות הטופס עצמו, בלי מזהה הפנייה. */
const inquiryFields = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "יש להזין שם מלא" })
    .max(80, { message: "השם ארוך מדי" }),

  phone: z
    .string()
    .trim()
    .min(1, { message: "יש להזין מספר טלפון" })
    .regex(PHONE_PATTERN, { message: "מספר הטלפון אינו תקין" })
    .refine(
      (value) => {
        const digits = value.match(DIGITS_ONLY)?.length ?? 0;
        return digits >= 9 && digits <= 15;
      },
      { message: "מספר הטלפון אינו תקין" },
    ),

  email: z
    .string()
    .trim()
    .min(1, { message: "יש להזין כתובת דוא״ל" })
    .max(120, { message: "כתובת הדוא״ל ארוכה מדי" })
    .pipe(z.email({ message: "כתובת הדוא״ל אינה תקינה" })),

  inquiryType: z.enum(INQUIRY_TYPES, {
    message: "יש לבחור מה תרצו לבדוק",
  }),

  /** גוש הוא מזהה, לא ערך חשבוני. נשמר כמחרוזת כדי לא לאבד אפס מוביל. */
  block: z
    .string()
    .trim()
    .min(1, { message: "יש להזין מספר גוש" })
    .regex(/^\d{1,6}$/, { message: "גוש מורכב מספרות בלבד" }),

  parcel: z
    .string()
    .trim()
    .min(1, { message: "יש להזין מספר חלקה" })
    .regex(/^\d{1,5}$/, { message: "חלקה מורכבת מספרות בלבד" }),

  locality: optionalText(60, "שם היישוב ארוך מדי"),

  /** נשמר כמחרוזת ספרות בטופס, מומר למספר בבניית ה-payload. */
  askingPrice: z
    .string()
    .trim()
    .max(12, { message: "הסכום ארוך מדי" })
    .regex(/^\d*$/, { message: "יש להזין סכום בספרות בלבד" })
    .optional()
    .transform((value) => value ?? ""),

  details: optionalText(1500, "הטקסט ארוך מדי"),

  /**
   * honeypot. בני אדם לא רואים את השדה ולכן הוא אמור להישאר ריק,
   * אבל הסכמה מקבלת כל ערך בכוונה: הטיפול נעשה בשרת בלבד, בשקט,
   * כדי לא לחשוף לבוט שהמלכודת זוהתה ולא להיתקע על שגיאת ולידציה
   * בשדה שהמשתמש אינו רואה.
   */
  website: z.string().max(200).optional().default(""),
});

/** מחיר מבוקש רלוונטי רק לרוכש ולמוכר. */
const askingPriceRule = (
  value: { askingPrice: string; inquiryType: InquiryType },
  ctx: z.RefinementCtx,
) => {
  if (
    value.askingPrice !== "" &&
    !TYPES_WITH_ASKING_PRICE.includes(value.inquiryType)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["askingPrice"],
      message: "שדה המחיר אינו רלוונטי לסוג הפנייה שנבחר",
    });
  }
};

/**
 * הסכמה שבה משתמש הטופס בדפדפן.
 *
 * submissionId אינו חלק ממנה בכוונה: הוא נוצר בלקוח ברגע השליחה, ולכן
 * יצירתו בזמן רינדור הייתה גורמת לאי התאמה בין השרת ללקוח בהידרציה.
 */
export const inquiryFormSchema = inquiryFields.superRefine(askingPriceRule);

/** הסכמה שעוברת בחוט ונבדקת שוב בשרת. */
export const inquirySchema = inquiryFields
  .extend({
    /** נוצר בלקוח ונשמר זהה בכל ניסיון חוזר של אותה פנייה לוגית. */
    submissionId: z.uuid({ message: "מזהה פנייה אינו תקין" }),
  })
  .superRefine(askingPriceRule);

export type Inquiry = z.infer<typeof inquirySchema>;
export type InquiryFormValues = z.input<typeof inquiryFormSchema>;
export type InquiryFormOutput = z.output<typeof inquiryFormSchema>;

/** תגובת נתיב ה-API. הלקוח מבדיל בין קבלה ודאית, כשל ודאי ותוצאה לא ידועה. */
export type SubmitStatus =
  | "accepted"
  | "failed"
  | "unknown"
  | "invalid"
  | "config_error";

export type SubmitResponse = {
  status: SubmitStatus;
  fieldErrors?: Record<string, string>;
};
