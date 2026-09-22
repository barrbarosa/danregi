import { Reveal } from "@/components/reveal";
import { Section, SectionTitle } from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faq } from "@/content/he";

export function Faq() {
  return (
    <Section muted>
      <Reveal>
        <SectionTitle>{faq.title}</SectionTitle>

        <Accordion type="single" collapsible className="mt-6 w-full">
          {faq.items.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`}>
              <AccordionTrigger className="text-start text-base">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </Section>
  );
}
