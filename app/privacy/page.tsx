import type { Metadata } from "next";

import { Section, SectionTitle } from "@/components/section";

export const metadata: Metadata = {
  title: "מדיניות פרטיות",
  // הדף אינו מאונדקס כל עוד הנוסח לא אושר לפרסום.
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main>
      <Section>
        <SectionTitle>מדיניות פרטיות</SectionTitle>
        {/* TODO (לפני פרסום): להחליף בנוסח שאושר על ידי בעל השירות. */}
        <p className="text-muted-foreground mt-4 leading-relaxed">
          נוסח מדיניות הפרטיות טרם אושר לפרסום. הפרטים שנמסרים בטופס משמשים
          ליצירת קשר ולביצוע הבדיקה בלבד, ומועברים למערכת חיצונית לצורך המשך
          הטיפול בפנייה.
        </p>
      </Section>
    </main>
  );
}
