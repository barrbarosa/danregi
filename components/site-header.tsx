"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ctaLabel, formAnchor } from "@/content/he";
import { siteConfig } from "@/lib/site-config";

const navItems = [
  { label: "למי זה מתאים", href: "#kahal" },
  { label: "מה נבדק", href: "#bedika" },
  { label: "תהליך", href: "#tahalich" },
  { label: "אודות", href: "#alay" },
  { label: "מחיר", href: "#mechir" },
  { label: "שאלות נפוצות", href: "#faq" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-6">
        {/* לוגו / שם */}
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-heading font-semibold leading-none">
            {siteConfig.advisorName}
          </span>
          <span className="text-muted-foreground text-xs leading-tight">
            {siteConfig.advisorTitle}
          </span>
        </Link>

        {/* ניווט — דסקטופ */}
        <nav
          className="hidden items-center gap-6 lg:flex"
          aria-label="ניווט ראשי"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* כפתור CTA — דסקטופ */}
        <div className="hidden lg:block">
          <Button asChild size="sm">
            <Link href={formAnchor}>{ctaLabel}</Link>
          </Button>
        </div>

        {/* כפתור המבורגר — נייד */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "סגור תפריט" : "פתח תפריט"}
          onClick={() => setOpen((o) => !o)}
          className="flex flex-col gap-1.5 p-2 lg:hidden"
        >
          <span
            className={`block h-0.5 w-6 bg-current transition-transform duration-200 ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-transform duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* תפריט נייד */}
      {open && (
        <nav
          id="mobile-nav"
          className="border-t bg-background px-5 pb-5 lg:hidden"
          aria-label="ניווט נייד"
        >
          <ul className="flex flex-col gap-1 pt-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground block py-2 text-sm transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <Button asChild size="sm" className="w-full sm:w-auto">
                <Link href={formAnchor} onClick={() => setOpen(false)}>
                  {ctaLabel}
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
