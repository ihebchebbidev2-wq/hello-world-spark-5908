import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, CalendarRange, Check, Plus, TrendingUp, Wallet, X } from "lucide-react";
import { useState, type ReactNode } from "react";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/host")({
  head: () => ({
    meta: [
      { title: "Host dashboard — RoomEasy" },
      { name: "description", content: "Manage RoomEasy listings, availability, rates, booking requests and payouts in one dashboard." },
      { property: "og:title", content: "Host dashboard — RoomEasy" },
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
  const { bookings, listings, payouts, reviews, team, rateRules, blockedDates, stripeOnboarded } = usePlatform();

  const revenue = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((sum, b) => sum + b.totalUsd, 0);
  const requests = bookings.filter((b) => b.status === "pending");
  const decided = bookings.filter((b) => b.status !== "pending");
  const confirmationRate = decided.length
    ? Math.round((decided.filter((b) => b.status === "confirmed" || b.status === "completed").length / decided.length) * 100)
    : 0;
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const maxMonth = Math.max(...monthlyBookings.map((m) => m.value), 1);

  return (
    <AppShell
      title={t.app.host.title}
      subtitle={t.app.host.subtitle}
      actions={
        <Button onClick={() => toast.success(t.app.host.created)} className="rounded-full">
          <Plus className="size-4" aria-hidden />
          {t.app.host.newListing}
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Wallet} label={t.app.host.revenue} value={format(revenue)} />
        <Stat icon={CalendarRange} label={t.app.host.requests} value={String(requests.length)} />
        <Stat icon={TrendingUp} label={t.app.host.confirmationRate} value={`${confirmationRate}%`} />
        <Stat icon={BadgeCheck} label={t.app.host.avgRating} value={avgRating.toFixed(1)} />
      </div>

      <Tabs defaultValue="requests" className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="requests">{t.app.host.requests}</TabsTrigger>
          <TabsTrigger value="listings">{t.app.host.listings}</TabsTrigger>
          <TabsTrigger value="calendar">{t.app.host.calendar}</TabsTrigger>
          <TabsTrigger value="payouts">{t.app.host.payouts}</TabsTrigger>
          <TabsTrigger value="reviews">{t.app.host.reviews}</TabsTrigger>
          <TabsTrigger value="team">{t.app.host.team}</TabsTrigger>
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
                        toast(t.app.host.declinedToast);
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
                      <p className="text-xs text-muted-foreground">{t.app.host.nightlyRate}: {format(listing.nightlyUsd)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={cn(
                        "border-0",
                        listing.status === "published"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : listing.status === "draft"
                            ? "bg-muted text-muted-foreground"
                            : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {t.app.host[listing.status]}
                    </Badge>
                    <Switch
                      checked={listing.status === "published"}
                      aria-label={listing.status === "published" ? t.app.host.unpublish : t.app.host.publish}
                      onCheckedChange={(checked) => {
                        setPlatform((state) => ({
                          listings: state.listings.map((l) => (l.id === listing.id ? { ...l, status: checked ? "published" : "draft" } : l)),
                        }));
                        toast.success(t.app.host.statusChanged);
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
            <h2 className="font-display text-lg font-bold">{t.app.host.blockedDates}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.app.host.blockHint}</p>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 28 }, (_, index) => {
                const day = `2026-06-${String(index + 1).padStart(2, "0")}`;
                const blocked = blockedDates.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={blocked}
                    onClick={() => {
                      setPlatform((state) => ({
                        blockedDates: blocked ? state.blockedDates.filter((d) => d !== day) : [...state.blockedDates, day],
                      }));
                      toast.success(t.app.host.blocked);
                    }}
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
            <h2 className="font-display text-lg font-bold">{t.app.host.rateRules}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <RateField id="weekend" label={t.app.host.weekend} value={rateRules.weekend} onChange={(v) => setPlatform({ rateRules: { ...rateRules, weekend: v } })} />
              <RateField id="longstay" label={t.app.host.longStay} value={rateRules.longStay} onChange={(v) => setPlatform({ rateRules: { ...rateRules, longStay: v } })} />
              <RateField id="lastminute" label={t.app.host.lastMinute} value={rateRules.lastMinute} onChange={(v) => setPlatform({ rateRules: { ...rateRules, lastMinute: v } })} />
            </div>
            <Button className="mt-5" onClick={() => toast.success(t.app.host.ruleSaved)}>{t.app.common.save}</Button>
          </Panel>
          <Panel className="lg:col-span-2">
            <h2 className="font-display text-lg font-bold">{t.app.host.monthly}</h2>
            <div className="mt-6 flex h-40 items-end gap-2 sm:gap-3">
              {monthlyBookings.map((month) => (
                <div key={month.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-lime" style={{ height: `${(month.value / maxMonth) * 100}%` }} />
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
                <p className="font-semibold">{t.app.host.stripeTitle}</p>
                <p className="text-xs text-muted-foreground">{t.app.host.stripeBody}</p>
              </div>
              <Button
                variant={stripeOnboarded ? "outline" : "default"}
                onClick={() => {
                  setPlatform({ stripeOnboarded: !stripeOnboarded });
                  toast.success(t.app.host.stripeDone);
                }}
              >
                {stripeOnboarded ? t.app.host.stripeDone : t.app.host.stripeCta}
              </Button>
            </div>
          </Panel>
          {payouts.map((payout) => (
            <Panel key={payout.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{format(payout.amountUsd)}</p>
                  <p className="text-xs text-muted-foreground">{t.app.host.nextPayout}: {payout.date}</p>
                </div>
                <Badge className={cn("border-0", payout.status === "paid" ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700")}>
                  {payout.status === "paid" ? t.app.admin.paid : t.app.admin.scheduled}
                </Badge>
              </div>
            </Panel>
          ))}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-3">
          {reviews.map((review) => (
            <Panel key={review.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{review.author}</p>
                <span className="text-sm font-semibold">★ {review.rating.toFixed(1)}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
              <ReplyBox reviewId={review.id} />
            </Panel>
          ))}
        </TabsContent>

        <TabsContent value="team" className="mt-6 space-y-3">
          {team.map((member) => (
            <Panel key={member.id}>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {member.scopes.map((scope) => (
                    <Badge key={scope} variant="secondary">{scope === "calendar" ? t.app.host.calendarRates : t.app.host.messaging}</Badge>
                  ))}
                </div>
              </div>
            </Panel>
          ))}
          <Button variant="outline" onClick={() => toast.success(t.app.host.inviteSent)}>
            <Plus className="size-4" aria-hidden />{t.app.host.invite}
          </Button>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function ReplyBox({ reviewId }: { reviewId: string }) {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  return (
    <div className="mt-3 space-y-2">
      <Label htmlFor={`reply-${reviewId}`} className="text-xs">{t.app.messages.placeholder}</Label>
      <Textarea id={`reply-${reviewId}`} value={value} onChange={(event) => setValue(event.target.value)} rows={2} />
      <Button size="sm" variant="outline" onClick={() => { setValue(""); toast.success(t.app.messages.sent); }}>
        {t.app.messages.send}
      </Button>
    </div>
  );
}

function RateField({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">{label} (%)</Label>
      <Input id={id} type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-11" />
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
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
