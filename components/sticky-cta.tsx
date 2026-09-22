"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ctaLabel, formAnchor } from "@/content/he";
import { formattedPrice } from "@/lib/site-config";

/**
 * כפתור קבוע בתחתית המסך בנייד בלבד.
 *
 * נעלם ברגע שהטופס נכנס לתצוגה, כדי לא להסתיר את השדות. מתחת לתוכן נוסף
 * מרווח בגובה הסרגל (ראו app/page.tsx) כדי שלא יכסה את תחתית הדף.
 *
 * IntersectionObserver ולא מאזין גלילה: הוא אינו מבצע קריאת פריסה בכל
 * אירוע גלילה ומתעורר רק במעבר הסף.
 */
export function StickyCta() {
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const target = document.querySelector(formAnchor);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      // השליש התחתון של המסך אינו נחשב, כדי שהסרגל ייעלם רק כשהטופס
      // באמת מולו ולא ברגע שקצהו מציץ מלמטה.
      { rootMargin: "0px 0px -35% 0px" },
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  if (formInView) return null;

  return (
    <div className="bg-background/95 border-input fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur sm:hidden">
      <div className="flex items-center gap-3">
        <Button asChild size="lg" className="flex-1">
          <Link href={formAnchor}>{ctaLabel}</Link>
        </Button>
        <span className="text-muted-foreground shrink-0 text-xs">
          {formattedPrice} ₪
        </span>
      </div>
    </div>
  );
}
