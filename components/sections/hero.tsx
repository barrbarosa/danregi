import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ctaLabel, formAnchor, hero } from "@/content/he";

export function Hero() {
  return (
    <header className="px-5 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-muted-foreground text-sm font-medium">
          {hero.byline}
        </p>

        <h1 className="font-heading mt-4 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
          {hero.title}
          <span className="text-primary block">{hero.titleAccent}</span>
        </h1>

        <p className="mt-6 text-base leading-relaxed sm:text-lg">{hero.lead}</p>

        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          {hero.secondary}
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button asChild size="lg">
            <Link href={formAnchor}>{ctaLabel}</Link>
          </Button>
          <p className="text-muted-foreground text-sm">{hero.priceNote}</p>
        </div>
      </div>
    </header>
  );
}
