import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ctaLabel, formAnchor, hero } from "@/content/he";

export function Hero() {
  return (
    <header className="px-5 pt-14 pb-14 sm:px-6 sm:pt-24 sm:pb-20">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="font-heading text-4xl font-bold leading-snug text-balance sm:text-6xl sm:leading-tight">
          {hero.title}
          <br />
          {hero.titleAccent}
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-relaxed sm:text-lg">
          {hero.lead}
        </p>

        <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
          {hero.secondary}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button asChild size="lg">
            <Link href={formAnchor}>{ctaLabel}</Link>
          </Button>
          <p className="text-muted-foreground text-sm">{hero.priceNote}</p>
        </div>

        <p className="text-muted-foreground mt-12 text-sm">{hero.byline}</p>
      </div>
    </header>
  );
}
