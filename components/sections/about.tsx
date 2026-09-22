import { Reveal } from "@/components/reveal";
import { Section, SectionTitle } from "@/components/section";
import { about } from "@/content/he";

export function About() {
  return (
    <Section id="alay" muted>
      <Reveal>
        <SectionTitle>{about.title}</SectionTitle>
        {/* TODO (לפני פרסום): להוסיף תמונת פורטרט אם תסופק (siteConfig.portraitSrc). */}
        <div className="mt-4 grid gap-4">
          {about.body.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
