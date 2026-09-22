import { Reveal } from "@/components/reveal";
import { Section, SectionTitle } from "@/components/section";
import { process } from "@/content/he";

export function Process() {
  return (
    <Section id="tahalich" muted>
      <SectionTitle>{process.title}</SectionTitle>

      <ol className="mt-8 grid gap-6">
        {process.steps.map((step, index) => (
          <Reveal key={step.title} delay={index * 0.05}>
            <li className="flex gap-4">
              <span
                aria-hidden="true"
                className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-muted-foreground mt-2 leading-relaxed">
                  {step.body}
                </p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>

      <p className="text-muted-foreground mt-8 text-sm">{process.note}</p>
    </Section>
  );
}
