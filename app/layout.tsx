import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Heebo } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { metadataCopy } from "@/content/he";
import { siteConfig } from "@/lib/site-config";

import "./globals.css";

const heebo = Heebo({
  variable: "--font-sans",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const frankRuhlLibre = Frank_Ruhl_Libre({
  variable: "--font-display",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  // TODO (לפני פרסום): להגדיר domain ב-lib/site-config כדי שכתובות
  // מוחלטות ותצוגה מקדימה בשיתוף יעבדו.
  metadataBase: siteConfig.domain ? new URL(siteConfig.domain) : undefined,
  title: metadataCopy.title,
  description: metadataCopy.description,
  openGraph: {
    title: metadataCopy.title,
    description: metadataCopy.description,
    locale: "he_IL",
    type: "website",
    // TODO (לפני פרסום): להוסיף images לאחר שתסופק תמונת שיתוף.
  },
  twitter: {
    card: "summary_large_image",
    title: metadataCopy.title,
    description: metadataCopy.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${frankRuhlLibre.variable} h-full antialiased`}
    >
      <head>
        {/*
          אנימציות ההופעה מתחילות במצב שקוף. אם JavaScript מושבת,
          הכלל הזה מחזיר את התוכן לגלוי, כדי שאנימציה לא תחסום גישה אליו.
        */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
