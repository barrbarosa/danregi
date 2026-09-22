import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** מעטפת אחידה לרוחב, למרווחים ולרקע של אזורי הדף. */
export function Section({
  id,
  children,
  className,
  muted = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 px-5 py-16 sm:px-6 sm:py-20",
        muted && "bg-muted/60",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </section>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function SectionLead({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground mt-3 text-base leading-relaxed sm:text-lg">
      {children}
    </p>
  );
}
