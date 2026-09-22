import { Reveal } from "@/components/reveal";
import { Section, SectionTitle } from "@/components/section";
import { selfTracking } from "@/content/he";

export function SelfTracking() {
  return (
    <Section id="maakav">
      <Reveal>
        <SectionTitle>{selfTracking.title}</SectionTitle>
        <p className="mt-4 text-base leading-relaxed sm:text-lg">
          {selfTracking.body}
        </p>
      </Reveal>
    </Section>
  );
}
