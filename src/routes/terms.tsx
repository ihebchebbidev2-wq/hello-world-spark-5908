import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { useLanguage } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of service — Nestara" },
      { name: "description", content: "The rules for booking, hosting, cancelling and paying on Nestara." },
      { property: "og:title", content: "Terms of service — Nestara" },
      { property: "og:description", content: "The rules for booking, hosting, cancelling and paying on Nestara." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const sections = [
  ["Using Nestara", "You must be 18 or older and provide accurate information. Accounts may be suspended for misuse."],
  ["Bookings", "A booking is confirmed once the host accepts and payment is authorised. Prices shown include applicable fees."],
  ["Cancellations", "Flexible stays can be cancelled free of charge up to 24 hours before check-in; refunds follow the listing policy."],
  ["Hosting", "Hosts are responsible for accurate listings, safe accommodation and honouring confirmed reservations."],
  ["Liability", "Nestara connects guests and hosts and is not a party to the rental agreement between them."],
];

function TermsPage() {
  const { t } = useLanguage();
  return (
    <AppShell title={t.app.legal.terms} subtitle={`${t.app.legal.updated}: 2026-09-01`}>
      <div className="max-w-3xl space-y-8">
        {sections.map(([heading, body]) => (
          <section key={heading} className="space-y-2">
            <h2 className="font-display text-lg font-bold">{heading}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
