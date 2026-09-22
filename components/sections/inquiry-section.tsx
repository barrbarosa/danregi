import { InquiryForm } from "@/components/inquiry-form";
import { Section, SectionLead, SectionTitle } from "@/components/section";
import { disclaimer, formSection } from "@/content/he";

export function InquirySection() {
  return (
    <Section id="pniya">
      <SectionTitle>{formSection.title}</SectionTitle>
      <SectionLead>{formSection.lead}</SectionLead>

      <InquiryForm />

      <p className="text-muted-foreground mt-8 text-sm leading-relaxed">
        {formSection.noBlockHelp}
      </p>

      {/* TODO (לפני פרסום): נוסח גבולות השירות טעון אישור בעל השירות. */}
      <div className="border-input mt-10 rounded-lg border p-6">
        <h3 className="font-medium">{disclaimer.title}</h3>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {disclaimer.body}
        </p>
      </div>
    </Section>
  );
}
