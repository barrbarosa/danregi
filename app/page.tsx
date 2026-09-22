import { About } from "@/components/sections/about";
import { Audience } from "@/components/sections/audience";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { InquirySection } from "@/components/sections/inquiry-section";
import { Pricing } from "@/components/sections/pricing";
import { Process } from "@/components/sections/process";
import { SelfTracking } from "@/components/sections/self-tracking";
import { SiteFooter } from "@/components/sections/site-footer";
import { WhatWeCheck } from "@/components/sections/what-we-check";
import { StickyCta } from "@/components/sticky-cta";

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <Audience />
        <WhatWeCheck />
        <Process />
        <SelfTracking />
        <About />
        <Pricing />
        <Faq />
        <InquirySection />
      </main>

      <SiteFooter />

      {/* מרווח שמונע מהכפתור הקבוע בנייד להסתיר את תחתית הדף. */}
      <div aria-hidden="true" className="h-20 sm:hidden" />

      <StickyCta />
    </>
  );
}
