/**
 * מקור אמת יחיד לפרטי העסק, המחיר והמיתוג.
 *
 * כל ערך שהוא null טרם נמסר על ידי בעל השירות. רכיבי הדף בודקים null
 * ומשמיטים את האזור במקום להציג פרט ריק או מומצא.
 *
 * TODO (לפני פרסום): להשלים phone, email, businessName, businessId, domain.
 * TODO (לפני פרסום): להוסיף logo ו-portrait אם יסופקו.
 */
export const siteConfig = {
  /** שם נותן השירות. אושר להצגה. */
  advisorName: "דן רג׳יניאנו",
  /** תואר מקצועי. התואר "שמאי מכריע" לא נבחר להצגה בדף. */
  advisorTitle: "שמאי מקרקעין",

  /** TODO: מספר טלפון ליצירת קשר. */
  phone: null as string | null,
  /** TODO: כתובת דוא״ל ליצירת קשר. */
  email: null as string | null,
  /** TODO: שם העסק הרשום ומספר עוסק/ח.פ. לתחתית הדף. */
  businessName: null as string | null,
  businessId: null as string | null,
  /** TODO: דומיין הפרודקשן. משמש ל-metadataBase ולתצוגה מקדימה בשיתוף. */
  domain: null as string | null,

  /** TODO: נתיב ללוגו אם יסופק. */
  logoSrc: null as string | null,
  /** TODO: נתיב לתמונת פורטרט לסקשן "מי אני" אם תסופק. */
  portraitSrc: null as string | null,

  /** מחיר השירות. סוכם ואושר. */
  priceIls: 1190,
  vatIncluded: true,

  /**
   * סליקה טרם הוגדרה. כל עוד הערך false, לא מוצג בדף שום כפתור תשלום
   * ואין להציג את הפנייה כרכישה שהושלמה.
   */
  paymentEnabled: false,
} as const;

/** "1,190 ₪" בפורמט עברי. */
export const formattedPrice = new Intl.NumberFormat("he-IL").format(
  siteConfig.priceIls,
);

export const hasContactDetails = Boolean(siteConfig.phone || siteConfig.email);
