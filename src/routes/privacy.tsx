import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { useLanguage } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Nestara" },
      { name: "description", content: "How Nestara collects, uses and protects your personal data across bookings, hosting and payments." },
      { property: "og:title", content: "Privacy policy — Nestara" },
      { property: "og:description", content: "How Nestara collects, uses and protects your personal data." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  ["Data we collect", "Account details, booking history, messages exchanged on the platform and payment metadata handled by our payment partner."],
  ["How we use it", "To operate bookings, prevent fraud, provide support, remember your language and currency, and improve the service."],
  ["Sharing", "We share only what is necessary with hosts, guests and processors such as our payment and email providers."],
  ["Your rights", "You may access, correct, export or delete your data, and object to marketing at any time."],
  ["Contact", "Write to privacy@nestara.travel and we will respond within 30 days."],
];

function PrivacyPage() {
  const { t } = useLanguage();
  return (
    <AppShell title={t.app.legal.privacy} subtitle={`${t.app.legal.updated}: 2026-09-01`}>
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
