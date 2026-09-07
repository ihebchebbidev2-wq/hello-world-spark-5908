import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, MessageSquare, Receipt, Users } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cityName, properties } from "@/data/properties";
import type { Booking, BookingStatus } from "@/data/platform";
import { setPlatform, usePlatform } from "@/hooks/usePlatform";
import { useCurrency } from "@/i18n/CurrencyProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "My trips — RoomEasy" },
      { name: "description", content: "Track every RoomEasy stay you have requested, confirmed or completed." },
      { property: "og:title", content: "My trips — RoomEasy" },
      { property: "og:description", content: "Track every RoomEasy stay you have requested, confirmed or completed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TripsPage,
});

export function statusTone(status: BookingStatus) {
  return {
    pending: "bg-amber-500/15 text-amber-700",
    confirmed: "bg-emerald-500/15 text-emerald-700",
    declined: "bg-destructive/10 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
    completed: "bg-primary/10 text-primary",
  }[status];
}

function TripsPage() {
  const { t, locale } = useLanguage();
  const { bookings } = usePlatform();
  const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(b.status));
  const past = bookings.filter((b) => !["pending", "confirmed"].includes(b.status));

  return (
    <AppShell title={t.app.trips.title} subtitle={t.app.trips.subtitle}>
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">{t.app.trips.upcoming}</TabsTrigger>
          <TabsTrigger value="past">{t.app.trips.past}</TabsTrigger>
        </TabsList>
        {([["upcoming", upcoming], ["past", past]] as const).map(([key, list]) => (
          <TabsContent key={key} value={key} className="mt-6">
            {list.length === 0 ? (
              <EmptyState text={t.app.trips.empty} />
            ) : (
              <ul className="grid gap-4">
                {list.map((booking) => (
                  <TripCard key={booking.id} booking={booking} locale={locale} />
                ))}
              </ul>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}

function TripCard({ booking, locale }: { booking: Booking; locale: string }) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const property = properties.find((p) => p.id === booking.propertyId);
  if (!property) return null;

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="grid gap-4 sm:grid-cols-[14rem_minmax(0,1fr)]">
        <img src={property.image} alt={property.name} className="h-40 w-full object-cover sm:h-full" />
        <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("border-0", statusTone(booking.status))}>{t.app.status[booking.status]}</Badge>
              <span className="text-xs text-muted-foreground">#{booking.id.toUpperCase()}</span>
            </div>
            <h2 className="mt-2 truncate font-display text-lg font-bold">{property.name}</h2>
            <p className="text-sm text-muted-foreground">{cityName(property, locale as never)}</p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden />{booking.from} → {booking.to}</li>
              <li className="flex items-center gap-1.5"><Users className="size-3.5" aria-hidden />{booking.guests} {t.listings.guests}</li>
              <li>{booking.nights} {t.app.trips.nights}</li>
            </ul>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <p className="font-display text-xl font-bold">{format(booking.totalUsd)}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/stays/$propertyId" params={{ propertyId: property.id }}>{t.app.trips.view}</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/messages"><MessageSquare className="size-3.5" aria-hidden />{t.app.trips.message}</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.success(t.app.trips.receiptReady)}>
                <Receipt className="size-3.5" aria-hidden />{t.app.trips.receipt}
              </Button>
              {["pending", "confirmed"].includes(booking.status) ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    setPlatform((state) => ({
                      bookings: state.bookings.map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b)),
                    }));
                    toast.success(t.app.trips.cancelled);
                  }}
                >
                  {t.app.trips.cancel}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
