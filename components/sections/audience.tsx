import { Reveal } from "@/components/reveal";
import { Section, SectionLead, SectionTitle } from "@/components/section";
import { audience } from "@/content/he";

export function Audience() {
  return (
    <Section muted>
      <SectionTitle>{audience.title}</SectionTitle>
      <SectionLead>{audience.lead}</SectionLead>

      <div className="mt-8 grid gap-4">
        {audience.cards.map((card, index) => (
          <Reveal key={card.id} delay={index * 0.05}>
            <article className="bg-background border-input rounded-lg border p-6">
              <h3 className="font-heading text-lg font-semibold">
                {card.title}
              </h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {card.body}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
