import Link from "next/link";

import { footer } from "@/content/he";
import { hasContactDetails, siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-input mt-auto border-t px-5 py-10 sm:px-6">
      <div className="text-muted-foreground mx-auto grid w-full max-w-3xl gap-4 text-sm">
        <p className="text-foreground font-medium">
          {siteConfig.advisorName}, {siteConfig.advisorTitle}
        </p>

        {/* TODO (לפני פרסום): להשלים phone ו-email ב-lib/site-config. */}
        {hasContactDetails && (
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            {siteConfig.phone && (
              <a href={`tel:${siteConfig.phone}`} dir="ltr">
                {siteConfig.phone}
              </a>
            )}
            {siteConfig.email && (
              <a href={`mailto:${siteConfig.email}`} dir="ltr">
                {siteConfig.email}
              </a>
            )}
          </p>
        )}

        {/* TODO (לפני פרסום): להשלים שם עסק ומספר עוסק ב-lib/site-config. */}
        {siteConfig.businessName && (
          <p>
            {siteConfig.businessName}
            {siteConfig.businessId ? ` · ${siteConfig.businessId}` : ""}
          </p>
        )}

        <p>
          <Link href="/privacy" className="underline underline-offset-4">
            {footer.privacyLabel}
          </Link>
        </p>
      </div>
    </footer>
  );
}
