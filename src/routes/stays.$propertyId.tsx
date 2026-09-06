import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { differenceInCalendarDays, format } from "date-fns";
import { enUS, fr as frLocale } from "date-fns/locale";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Heart,
  Laptop,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Share2,
  Snowflake,
  Star,
  Tent,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { cityName, properties } from "@/data/properties";
import { interpolate, useLanguage } from "@/i18n/LanguageProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stays/$propertyId")({
  head: ({ params }) => {
    const property = properties.find((item) => item.id === params.propertyId);
    const name = property?.name ?? "Nestara stay";
    return {
      meta: [
        { title: `${name} — Nestara` },
        { name: "description", content: `Explore photos, amenities, reviews and availability for ${name}.` },
        { property: "og:title", content: `${name} — Nestara` },
        { property: "og:description", content: `Explore photos, amenities, reviews and availability for ${name}.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ListingDetail,
});

function ListingDetail() {
  const { propertyId } = Route.useParams();
  const property = properties.find((item) => item.id === propertyId);
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();
  const [activeImage, setActiveImage] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const dateLocale = locale === "fr" ? frLocale : enUS;

  if (!property) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5 text-center">
        <div>
          <h1 className="font-display text-3xl font-semibold">Stay not found</h1>
          <Button asChild className="mt-6"><Link to="/stays">{t.detail.back}</Link></Button>
        </div>
      </main>
    );
  }

  const gallery = [
    property.image,
    ...properties.filter((item) => item.id !== property.id).map((item) => item.image).slice(0, 4),
  ];

  const nights = range?.from && range.to ? Math.max(1, differenceInCalendarDays(range.to, range.from)) : 0;
  const total = nights * property.price;
  const favorite = isFavorite(property.id);
  const propertyName = property.name;
  const imageAlt = `${property.name}, ${cityName(property, locale)}`;
  const amenities: ReadonlyArray<readonly [LucideIcon, string]> = [
    [Wifi, t.detail.wifi], [Car, t.detail.parking], [ChefHat, t.detail.kitchen],
    [Laptop, t.detail.workspace], [Snowflake, t.detail.air], [ShieldCheck, t.detail.security],
  ] as const;

  async function shareListing() {
    if (navigator.share) {
      await navigator.share({ title: propertyName, url: window.location.href });
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    toast.success(t.detail.shared);
  }

  function reserve() {
    if (!nights || !range?.from || !range.to) {
      toast.error(t.detail.selectDates);
      return;
    }
    navigate({
      to: "/checkout",
      search: {
        propertyId,
        from: range.from.toISOString().slice(0, 10),
        to: range.to.toISOString().slice(0, 10),
        nights,
        guests: adults + children,
      },
    });
  }

  return (
    <main className="min-h-screen bg-background pb-28 lg:pb-16">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2 font-display font-semibold">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Tent className="size-5" aria-hidden /></span>
            <span className="truncate text-lg">{t.brand}</span>
          </Link>
          <LanguageSelector />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
        <div className="hidden items-center justify-between py-6 sm:flex">
          <Button variant="ghost" asChild className="px-0 hover:bg-transparent">
            <Link to="/stays"><ArrowLeft aria-hidden />{t.detail.back}</Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void shareListing()}><Share2 aria-hidden />{t.detail.share}</Button>
            <Button variant="outline" onClick={() => toggle(property.id)} aria-pressed={favorite}>
              <Heart className={cn(favorite && "fill-destructive text-destructive")} aria-hidden />
              {favorite ? t.listings.saved : t.listings.save}
            </Button>
          </div>
        </div>

        <section aria-label={t.detail.photo.replace("{current}", "1").replace("{total}", String(gallery.length))} className="relative sm:grid sm:h-[34rem] sm:grid-cols-[1.55fr_0.8fr_0.8fr] sm:grid-rows-2 sm:gap-2 sm:overflow-hidden sm:rounded-lg">
          {gallery.slice(0, 5).map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveImage(index)}
              aria-label={interpolate(t.detail.photo, { current: index + 1, total: gallery.length })}
              className={cn(
                "group relative overflow-hidden bg-muted",
                index === 0 ? "h-[26rem] w-full sm:row-span-2 sm:h-full" : "hidden sm:block",
              )}
            >
              <img src={image} alt={index === 0 ? imageAlt : ""} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
              {activeImage === index ? <span className="absolute inset-0 ring-2 ring-inset ring-primary" /> : null}
            </button>
          ))}

          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 sm:hidden">
            <Button size="icon" variant="secondary" asChild className="rounded-full bg-surface/90 backdrop-blur"><Link to="/stays" aria-label={t.detail.back}><ChevronLeft /></Link></Button>
            <div className="flex gap-2">
              <Button size="icon" variant="secondary" onClick={() => void shareListing()} aria-label={t.detail.share} className="rounded-full bg-surface/90 backdrop-blur"><Share2 /></Button>
              <Button size="icon" variant="secondary" onClick={() => toggle(property.id)} aria-label={t.listings.save} aria-pressed={favorite} className="rounded-full bg-surface/90 backdrop-blur"><Heart className={cn(favorite && "fill-destructive text-destructive")} /></Button>
            </div>
          </div>
          <div className="absolute right-4 bottom-16 z-20 flex items-center gap-2 sm:hidden">
            <Button size="icon" variant="secondary" onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)} aria-label="Previous photo" className="size-8 rounded-full bg-surface/90"><ChevronLeft /></Button>
            <span className="rounded-full bg-foreground/70 px-3 py-1 text-xs font-semibold text-background backdrop-blur">{activeImage + 1} / {gallery.length}</span>
            <Button size="icon" variant="secondary" onClick={() => setActiveImage((activeImage + 1) % gallery.length)} aria-label="Next photo" className="size-8 rounded-full bg-surface/90"><ChevronRight /></Button>
          </div>
          {activeImage > 0 ? <img src={gallery[activeImage]} alt={imageAlt} className="pointer-events-none absolute inset-0 z-10 size-full object-cover sm:hidden" /> : null}
        </section>

        <div className="relative -mt-10 rounded-t-[2rem] bg-surface px-5 pt-7 sm:mt-0 sm:rounded-none sm:bg-transparent sm:px-0 sm:pt-10">
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-border sm:hidden" />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start lg:gap-16">
            <div className="min-w-0">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border pb-7">
                <div className="min-w-0">
                  <span className="inline-flex rounded-md bg-secondary px-2 py-1 text-[11px] font-bold text-primary">{t.detail.guestFavorite}</span>
                  <h1 className="mt-3 text-2xl leading-tight font-semibold sm:text-4xl">{property.name}</h1>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0" aria-hidden />{cityName(property, locale)}</p>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1 font-semibold"><Star className="size-4 fill-primary text-primary" aria-hidden />{property.rating.toFixed(1)}</p>
                  <a href="#reviews" className="mt-1 block text-xs text-muted-foreground underline underline-offset-4">128 {t.detail.reviews}</a>
                </div>
              </div>

              <ul className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto border-b border-border px-5 py-6 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
                {([
                  [Users, t.detail.entire, `${property.guests} ${t.listings.guests}`],
                  [BedDouble, t.listings.beds, String(property.beds)],
                  [Bath, t.listings.baths, String(property.baths)],
                  [MapPin, t.detail.area, `${property.area} ft²`],
                ] as ReadonlyArray<readonly [LucideIcon, string, string]>).map(([Icon, label, value]) => (
                  <li key={String(label)} className="flex min-w-28 items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3 sm:min-w-0">
                    <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                    <div><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-sm font-semibold">{value}</p></div>
                  </li>
                ))}
              </ul>

              <section className="border-b border-border py-7">
                <h2 className="text-xl font-semibold">{t.detail.description}</h2>
                <p className={cn("mt-3 text-sm leading-7 text-muted-foreground", !expanded && "line-clamp-3")}>{t.detail.descriptionBody}</p>
                <Button variant="link" className="mt-2 h-auto px-0 text-primary" onClick={() => setExpanded((value) => !value)}>{expanded ? t.detail.showLess : t.detail.showMore}</Button>
              </section>

              <section className="border-b border-border py-7">
                <h2 className="text-xl font-semibold">{t.detail.amenities}</h2>
                <ul className="mt-5 grid gap-5 sm:grid-cols-2">
                  {amenities.map(([Icon, label]) => <li key={label} className="flex items-center gap-3 text-sm"><Icon className="size-5 text-muted-foreground" aria-hidden />{label}</li>)}
                </ul>
              </section>

              <section id="reviews" className="border-b border-border py-7">
                <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">{t.detail.rating}</h2><p className="flex items-center gap-1 font-semibold"><Star className="size-4 fill-primary text-primary" />{property.rating.toFixed(1)} · 128 {t.detail.reviews}</p></div>
                <blockquote className="mt-5 border-l-2 border-primary pl-4 text-sm leading-7 text-muted-foreground">“{t.detail.recentReview}”<footer className="mt-3 font-semibold text-foreground">{t.detail.reviewer} · {t.detail.reviewDate}</footer></blockquote>
              </section>

              <section className="py-7">
                <h2 className="text-xl font-semibold">{t.detail.locationTitle}</h2>
                <div className="mt-5 flex min-h-44 items-center justify-center rounded-lg border border-border bg-secondary text-center">
                  <div><MapPin className="mx-auto size-7 text-primary" /><p className="mt-3 font-semibold">{cityName(property, locale)}</p><p className="mt-1 text-xs text-muted-foreground">{t.detail.mapNote}</p></div>
                </div>
                <h2 className="mt-8 text-xl font-semibold">{t.detail.houseRules}</h2>
                <ul className="mt-4 space-y-3 text-sm"><li className="flex gap-3"><Check className="size-5 text-primary" />{t.detail.cancellation}</li><li className="flex gap-3"><Check className="size-5 text-primary" />{t.detail.arrival}</li></ul>
              </section>
            </div>

            <aside className="sticky top-6 hidden rounded-lg border border-border bg-surface p-6 shadow-xl lg:block">
              <BookingPanel propertyPrice={property.price} range={range} setRange={setRange} adults={adults} setAdults={setAdults} children={children} setChildren={setChildren} nights={nights} total={total} reserve={reserve} />
            </aside>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0"><p className="text-xs text-muted-foreground">{t.detail.startingAt}</p><p className="truncate text-lg font-bold">${property.price}<span className="text-xs font-normal text-muted-foreground"> / {t.listings.night}</span></p></div>
          <Popover>
            <PopoverTrigger asChild><Button size="lg">{t.detail.reserve}</Button></PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-[calc(100vw-2rem)] max-w-sm p-5"><BookingPanel propertyPrice={property.price} range={range} setRange={setRange} adults={adults} setAdults={setAdults} children={children} setChildren={setChildren} nights={nights} total={total} reserve={reserve} /></PopoverContent>
          </Popover>
        </div>
      </div>
    </main>
  );
}

type BookingPanelProps = {
  propertyPrice: number;
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  adults: number;
  setAdults: (value: number) => void;
  children: number;
  setChildren: (value: number) => void;
  nights: number;
  total: number;
  reserve: () => void;
};

function BookingPanel({ propertyPrice, range, setRange, adults, setAdults, children, setChildren, nights, total, reserve }: BookingPanelProps) {
  const { t, locale } = useLanguage();
  const dateLocale = locale === "fr" ? frLocale : enUS;
  const dateText = range?.from ? `${format(range.from, "dd MMM", { locale: dateLocale })}${range.to ? ` — ${format(range.to, "dd MMM", { locale: dateLocale })}` : ""}` : t.search.datePlaceholder;
  return (
    <div>
      <div className="flex items-baseline gap-1"><span className="text-2xl font-bold">${propertyPrice}</span><span className="text-sm text-muted-foreground">/ {t.listings.night}</span></div>
      <h2 className="mt-5 text-sm font-semibold">{t.detail.stayDates}</h2>
      <Popover>
        <PopoverTrigger asChild><Button variant="outline" className="mt-2 h-12 w-full justify-start"><CalendarDays />{dateText}</Button></PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end"><Calendar mode="range" selected={range} onSelect={setRange} locale={dateLocale} disabled={{ before: new Date() }} /></PopoverContent>
      </Popover>
      <div className="mt-4 rounded-md border border-border p-3">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{t.detail.guestsLabel}</p>
        {[[t.detail.adults, adults, setAdults, 1], [t.detail.children, children, setChildren, 0]].map(([label, value, setter, min]) => (
          <div key={String(label)} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-1.5">
            <span className="text-sm">{String(label)}</span>
            <div className="flex items-center gap-2"><Button size="icon" variant="outline" className="size-7 rounded-full" onClick={() => (setter as (n: number) => void)(Math.max(Number(min), Number(value) - 1))} disabled={Number(value) <= Number(min)}><Minus /></Button><span className="w-5 text-center text-sm tabular-nums">{String(value)}</span><Button size="icon" variant="outline" className="size-7 rounded-full" onClick={() => (setter as (n: number) => void)(Math.min(12, Number(value) + 1))}><Plus /></Button></div>
          </div>
        ))}
      </div>
      {nights > 0 ? <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm"><div className="flex justify-between text-muted-foreground"><span>${propertyPrice} × {nights} {t.detail.nights}</span><span>${total}</span></div><div className="flex justify-between font-bold"><span>{t.detail.total}</span><span>${total}</span></div></div> : null}
      <Button size="lg" className="mt-5 w-full" onClick={reserve}>{t.detail.reserve}</Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">{t.detail.noFees}</p>
    </div>
  );
}