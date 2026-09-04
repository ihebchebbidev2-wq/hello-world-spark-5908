import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, CalendarRange, Check, Plus, TrendingUp, Wallet, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { monthlyBookings } from "@/data/platform";
import { properties } from "@/data/properties";
import { setPlatform, usePlatform } from "@/hooks/usePlatform";
import { useCurrency } from "@/i18n/CurrencyProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { statusTone } from "@/routes/trips";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/host")({
  head: () => ({
    meta: [
      { title: "Host dashboard — Nestara" },
      { name: "description", content: "Manage Nestara listings, availability, rates, booking requests and payouts in one dashboard." },
      { property: "og:title", content: "Host dashboard — Nestara" },
      { property: "og:description", content: "Manage listings, availability, rates, requests and payouts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HostPage,
});

function HostPage() {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const { bookings, listings, payouts, reviews, rateRules, blockedDates, stripeOnboarded } = usePlatform();

  const earnings = bookings.filter((b) => b.status !== "declined" && b.status !== "cancelled").reduce((sum, b) => sum + b.totalUsd, 0);
  const requests = bookings.filter((b) => b.status === "pending");
  const occupancy = Math.round((bookings.filter((b) => b.status === "confirmed").length / Math.max(listings.length, 1)) * 100);
  const maxBookings = Math.max(...monthlyBookings.map((m) => m.bookings), 1);

  return (
    <AppShell
      title={t.app.host.title}
      subtitle={t.app.host.subtitle}
      actions={
        <Button onClick={() => toast.success(t.app.host.listingSaved)} className="rounded-full">
          <Plus className="size-4" aria-hidden />
          {t.app.host.newListing}
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Wallet} label={t.app.host.earnings} value={format(earnings)} />
        <Stat icon={CalendarRange} label={t.app.host.requests} value={String(requests.length)} />
        <Stat icon={TrendingUp} label={t.app.host.occupancy} value={`${occupancy}%`} />
        <Stat icon={BadgeCheck} label={t.app.host.listings} value={String(listings.length)} />
      </div>

      <Tabs defaultValue="requests" className="mt-8">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="requests">{t.app.host.requests}</TabsTrigger>
          <TabsTrigger value="listings">{t.app.host.listings}</TabsTrigger>
          <TabsTrigger value="calendar">{t.app.host.calendar}</TabsTrigger>
          <TabsTrigger value="payouts">{t.app.host.payouts}</TabsTrigger>
          <TabsTrigger value="reviews">{t.app.host.reviews}</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6 space-y-3">
          {requests.length === 0 ? <Panel><p className="text-sm text-muted-foreground">{t.app.host.noRequests}</p></Panel> : null}
          {requests.map((booking) => {
            const property = properties.find((p) => p.id === booking.propertyId);
            return (
              <Panel key={booking.id}>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{property?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.guestName} · {booking.from} → {booking.to} · {format(booking.totalUsd)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setPlatform((state) => ({ bookings: state.bookings.map((b) => (b.id === booking.id ? { ...b, status: "confirmed" } : b)) }));
                        toast.success(t.app.host.accepted);
                      }}
                    >
                      <Check className="size-4" aria-hidden />{t.app.host.accept}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPlatform((state) => ({ bookings: state.bookings.map((b) => (b.id === booking.id ? { ...b, status: "declined" } : b)) }));
                        toast(t.app.host.declined);
                      }}
                    >
                      <X className="size-4" aria-hidden />{t.app.host.decline}
                    </Button>
                  </div>
                </div>
              </Panel>
            );
          })}
        </TabsContent>

        <TabsContent value="listings" className="mt-6 space-y-3">
          {listings.map((listing) => {
            const property = properties.find((p) => p.id === listing.propertyId);
            return (
              <Panel key={listing.id}>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={property?.image} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{property?.name}</p>
                      <p className="text-xs text-muted-foreground">{format(listing.priceUsd)} · {t.app.host.perNight}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={cn("border-0", listing.status === "published" ? "bg-emerald-500/15 text-emerald-700" : listing.status === "draft" ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive")}>
                      {t.app.listingStatus[listing.status]}
                    </Badge>
                    <Switch
                      checked={listing.status === "published"}
                      aria-label={t.app.host.publish}
                      onCheckedChange={(checked) => {
                        setPlatform((state) => ({
                          listings: state.listings.map((l) => (l.id === listing.id ? { ...l, status: checked ? "published" : "draft" } : l)),
                        }));
                        toast.success(checked ? t.app.host.published : t.app.host.unpublished);
                      }}
                    />
                  </div>
                </div>
              </Panel>
            );
          })}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel>
            <h2 className="font-display text-lg font-bold">{t.app.host.availability}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.app.host.availabilityHint}</p>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 28 }, (_, index) => {
                const day = `2025-06-${String(index + 1).padStart(2, "0")}`;
                const blocked = blockedDates.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={blocked}
                    onClick={() =>
                      setPlatform((state) => ({
                        blockedDates: blocked ? state.blockedDates.filter((d) => d !== day) : [...state.blockedDates, day],
                      }))
                    }
                    className={cn(
                      "aspect-square rounded-lg border text-xs font-semibold transition-colors",
                      blocked ? "border-destructive/40 bg-destructive/10 text-destructive line-through" : "border-border hover:bg-secondary",
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </Panel>
          <Panel>
            <h2 className="font-display text-lg font-bold">{t.app.host.rates}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <RateField label={t.app.host.weekend} value={rateRules.weekendUplift} onChange={(v) => setPlatform({ rateRules: { ...rateRules, weekendUplift: v } })} suffix="%" />
              <RateField label={t.app.host.weekly} value={rateRules.weeklyDiscount} onChange={(v) => setPlatform({ rateRules: { ...rateRules, weeklyDiscount: v } })} suffix="%" />
              <RateField label={t.app.host.minNights} value={rateRules.minNights} onChange={(v) => setPlatform({ rateRules: { ...rateRules, minNights: v } })} />
              <RateField label={t.app.host.cleaning} value={rateRules.cleaningFeeUsd} onChange={(v) => setPlatform({ rateRules: { ...rateRules, cleaningFeeUsd: v } })} suffix="$" />
            </div>
            <Button className="mt-5" onClick={() => toast.success(t.app.host.ratesSaved)}>{t.app.common.save}</Button>
          </Panel>
          <Panel className="lg:col-span-2">
            <h2 className="font-display text-lg font-bold">{t.app.host.performance}</h2>
            <div className="mt-6 flex h-40 items-end gap-3">
              {monthlyBookings.map((month) => (
                <div key={month.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-lime" style={{ height: `${(month.bookings / maxBookings) * 100}%` }} />
                  <span className="text-[10px] font-semibold text-muted-foreground">{month.month}</span>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="payouts" className="mt-6 space-y-3">
          <Panel>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div>
                <p className="font-semibold">{t.app.host.stripe}</p>
                <p className="text-xs text-muted-foreground">{stripeOnboarded ? t.app.host.stripeReady : t.app.host.stripeHint}</p>
              </div>
              <Button
                variant={stripeOnboarded ? "outline" : "default"}
                onClick={() => {
                  setPlatform({ stripeOnboarded: !stripeOnboarded });
                  toast.success(stripeOnboarded ? t.app.host.stripeDisconnected : t.app.host.stripeConnected);
                }}
              >
                {stripeOnboarded ? t.app.host.disconnect : t.app.host.connect}
              </Button>
            </div>
          </Panel>
          {payouts.map((payout) => (
            <Panel key={payout.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{format(payout.amountUsd)}</p>
                  <p className="text-xs text-muted-foreground">{payout.date}</p>
                </div>
                <Badge className={cn("border-0", payout.status === "paid" ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700")}>
                  {t.app.payoutStatus[payout.status]}
                </Badge>
              </div>
            </Panel>
          ))}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-3">
          {reviews.map((review) => (
            <Panel key={review.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{review.guestName}</p>
                <span className="text-sm font-semibold">★ {review.rating.toFixed(1)}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
              <ReplyBox reviewId={review.id} reply={review.reply} />
            </Panel>
          ))}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function ReplyBox({ reviewId, reply }: { reviewId: string; reply?: string }) {
  const { t } = useLanguage();
  const [value, setValue] = useState(reply ?? "");
  return (
    <div className="mt-3 space-y-2">
      <Label htmlFor={`reply-${reviewId}`} className="text-xs">{t.app.host.reply}</Label>
      <Textarea id={`reply-${reviewId}`} value={value} onChange={(event) => setValue(event.target.value)} rows={2} />
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setPlatform((state) => ({ reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, reply: value } : r)) }));
          toast.success(t.app.host.replySent);
        }}
      >
        {t.app.common.send}
      </Button>
    </div>
  );
}

function RateField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (value: number) => void; suffix?: string }) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">{label}{suffix ? ` (${suffix})` : ""}</Label>
      <Input id={id} type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-11" />
    </div>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl border border-border bg-surface p-5 shadow-sm", className)}>{children}</section>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <Panel className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
      <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-5" aria-hidden /></span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-display text-xl font-bold">{value}</p>
      </div>
    </Panel>
  );
}
