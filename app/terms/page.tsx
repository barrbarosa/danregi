import type { Metadata } from "next";

import { Section, SectionTitle } from "@/components/section";

export const metadata: Metadata = {
  title: "תנאי שירות",
  // הדף אינו מאונדקס כל עוד הנוסח לא אושר לפרסום.
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <main>
      <Section>
        <SectionTitle>תנאי שירות</SectionTitle>
        {/* TODO (לפני פרסום): להחליף בנוסח תנאי השירות והביטול שאושר. */}
        <p className="text-muted-foreground mt-4 leading-relaxed">
          נוסח תנאי השירות והביטול טרם אושר לפרסום.
        </p>
      </Section>
    </main>
  );
}
