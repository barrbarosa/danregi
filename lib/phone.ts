import "server-only";

import parsePhoneNumberFromString from "libphonenumber-js";

/**
 * נרמול טלפון ל-E.164 לפני השליחה ליעד.
 *
 * הקובץ מיובא מנתיב ה-API בלבד. ייבוא "server-only" יגרום לשגיאת בנייה
 * אם מישהו יצרף אותו בטעות לרכיב לקוח, כדי שספריית הטלפונים לא תיכנס
 * ל-bundle של הדפדפן.
 */
export function normalizePhone(input: string): string {
  const parsed = parsePhoneNumberFromString(input, "IL");

  if (parsed?.isValid()) {
    return parsed.number;
  }

  // מספר שעבר ולידציה מקלה אך אינו ניתן לנרמול מועבר כפי שהוזן,
  // כדי לא לאבד פנייה בגלל פורמט לא מוכר.
  return input.trim();
}
