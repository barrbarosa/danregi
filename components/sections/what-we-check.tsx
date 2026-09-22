import { Reveal } from "@/components/reveal";
import { Section, SectionLead, SectionTitle } from "@/components/section";
import { whatWeCheck } from "@/content/he";

export function WhatWeCheck() {
  return (
    <Section>
      <SectionTitle>{whatWeCheck.title}</SectionTitle>
      <SectionLead>{whatWeCheck.lead}</SectionLead>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {whatWeCheck.items.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.04}>
            <div className="border-primary/25 border-s-2 ps-4">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {item.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
