import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarDays, CreditCard, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_FEE_RATE, TAX_RATE } from "@/data/platform";
import { cityName, properties } from "@/data/properties";
import { setPlatform, usePlatform } from "@/hooks/usePlatform";
import { useCurrency } from "@/i18n/CurrencyProvider";
import { useLanguage } from "@/i18n/LanguageProvider";

type CheckoutSearch = {
  propertyId: string | undefined;
  from: string | undefined;
  to: string | undefined;
  nights: number | undefined;
  guests: number | undefined;
};

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
    propertyId: typeof search["propertyId"] === "string" ? search["propertyId"] : undefined,
    from: typeof search["from"] === "string" ? search["from"] : undefined,
    to: typeof search["to"] === "string" ? search["to"] : undefined,
    nights: Number(search["nights"]) > 0 ? Number(search["nights"]) : undefined,
    guests: Number(search["guests"]) > 0 ? Number(search["guests"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Confirm and pay — Nestara" },
      { name: "description", content: "Review your Nestara stay, price breakdown and cancellation policy, then confirm your booking." },
      { property: "og:title", content: "Confirm and pay — Nestara" },
      { property: "og:description", content: "Review your stay, price breakdown and cancellation policy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { t, locale } = useLanguage();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { session } = usePlatform();

  const property = properties.find((p) => p.id === search.propertyId) ?? properties[0]!;
  const nights = search.nights ?? 2;
  const guests = search.guests ?? 2;
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [note, setNote] = useState("");

  const subtotal = property.price * nights;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const taxes = Math.round(subtotal * TAX_RATE);
  const total = subtotal + serviceFee + taxes;

  function pay(e: React.FormEvent) {
    e.preventDefault();
    const id = `bk-${Math.random().toString(36).slice(2, 7)}`;
    setPlatform((s) => ({
      bookings: [
        {
          id,
          propertyId: property.id,
          guestName: name || "Guest",
          from: search.from ?? "2026-10-01",
          to: search.to ?? "2026-10-03",
          nights,
          guests,
          totalUsd: total,
          status: "pending" as const,
        },
        ...s.bookings,
      ],
    }));
    toast.success(t.app.checkout.paid);
    navigate({ to: "/trips" });
  }

  return (
    <AppShell title={t.app.checkout.title}>
      <form onSubmit={pay} className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">{t.app.checkout.contact}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cname">{t.app.auth.name}</Label>
                <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cemail">{t.app.auth.email}</Label>
                <Input id="cemail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnote">
                {t.app.checkout.request} <span className="text-muted-foreground">({t.app.checkout.optional})</span>
              </Label>
              <Textarea id="cnote" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">{t.app.checkout.policy}</h2>
            <p className="text-sm text-muted-foreground">{t.app.checkout.flexible}</p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" aria-hidden />
              {t.app.checkout.secure}
            </p>
          </section>
        </div>

        <aside className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex gap-3">
            <img src={property.image} alt={property.name} className="size-20 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0">
              <Link
                to="/stays/$propertyId"
                params={{ propertyId: property.id }}
                className="block truncate font-semibold hover:underline"
              >
                {property.name}
              </Link>
              <p className="truncate text-sm text-muted-foreground">{cityName(property, locale)}</p>
            </div>
          </div>

          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              {nights} {t.app.trips.nights}
            </li>
            <li className="flex items-center gap-1.5">
              <Users className="size-3.5" aria-hidden />
              {guests} {t.listings.guests}
            </li>
          </ul>

          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <Row label={t.app.checkout.nightsLine.replace("{price}", format(property.price)).replace("{nights}", String(nights))} value={format(subtotal)} />
            <Row label={t.app.checkout.serviceFee} value={format(serviceFee)} />
            <Row label={t.app.checkout.taxes} value={format(taxes)} />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="font-semibold">{t.app.checkout.total}</span>
            <span className="font-display text-xl font-bold">{format(total)}</span>
          </div>

          <Button type="submit" size="lg" className="w-full">
            <CreditCard className="size-4" aria-hidden />
            {t.app.checkout.pay}
          </Button>
        </aside>
      </form>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
