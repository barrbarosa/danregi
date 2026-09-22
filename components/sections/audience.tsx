import { Reveal } from "@/components/reveal";
import { Section, SectionLead, SectionTitle } from "@/components/section";
import { audience } from "@/content/he";

export function Audience() {
  return (
    <Section id="kahal" muted>
      <SectionTitle>{audience.title}</SectionTitle>
      <SectionLead>{audience.lead}</SectionLead>

      <div className="mt-10 grid gap-10 sm:grid-cols-3">
        {audience.cards.map((card, index) => (
          <Reveal key={card.id} delay={index * 0.05}>
            <div>
              <h3 className="font-heading text-xl font-bold leading-snug">
                {card.title}
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {card.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
