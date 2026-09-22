import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { Section, SectionTitle } from "@/components/section";
import { Button } from "@/components/ui/button";
import { ctaLabel, formAnchor, pricing } from "@/content/he";
import { siteConfig } from "@/lib/site-config";

export function Pricing() {
  return (
    <Section id="mechir">
      <Reveal>
        <SectionTitle>{pricing.title}</SectionTitle>

        <div className="border-input mt-6 rounded-lg border p-6 sm:p-8">
          <p className="font-heading text-3xl font-bold">
            {pricing.price}{" "}
            <span className="text-muted-foreground text-base font-normal">
              {pricing.priceNote}
            </span>
          </p>

          <ul className="mt-6 grid gap-3">
            {pricing.includes.map((item) => (
              <li key={item} className="flex gap-3 leading-relaxed">
                <span
                  aria-hidden="true"
                  className="bg-primary/60 mt-2.5 size-1.5 shrink-0 rounded-full"
                />
                {item}
              </li>
            ))}
          </ul>

          <p className="text-muted-foreground mt-6 text-sm leading-relaxed">
            {pricing.scopeNote}
          </p>

          {/*
            כפתור תשלום יוצג רק כאשר siteConfig.paymentEnabled יהיה true,
            כלומר רק לאחר חיבור ספק סליקה ואימות תשלום אמיתי.
            עד אז הפעולה היחידה היא העברת פרטים.
          */}
          <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
            <Link href={formAnchor}>{ctaLabel}</Link>
          </Button>

          {!siteConfig.paymentEnabled && (
            <p className="text-muted-foreground mt-4 text-sm">
              התשלום מתואם בנפרד ואינו מתבצע דרך הדף בשלב זה.
            </p>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
