import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { enUS, fr as frLocale } from "date-fns/locale";
import {
  ArrowUpDown,
  CalendarDays,
  Filter,
  MapPin,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Tent,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { PropertyCard } from "@/components/home/PropertyCard";
import { Footer } from "@/components/layout/Footer";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { categories, properties, type PropertyCategory } from "@/data/properties";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

type SortOption = "recommended" | "price-low" | "price-high" | "rating";
type StaySearch = {
  where?: string;
  from?: string;
  to?: string;
  guests?: number;
  category?: "all" | PropertyCategory;
  maxPrice?: number;
  rating?: number;
  beds?: number;
  sort?: SortOption;
};
type ResolvedSearch = Required<StaySearch>;

const defaults: ResolvedSearch = {
  where: "",
  from: "",
  to: "",
  guests: 1,
  category: "all",
  maxPrice: 400,
  rating: 0,
  beds: 0,
  sort: "recommended",
};

export const Route = createFileRoute("/stays/")({
  validateSearch: (input: Record<string, unknown>): StaySearch => {
    const raw = input as Partial<Record<keyof StaySearch, unknown>>;
    return {
      where: typeof raw.where === "string" ? raw.where.slice(0, 80) : "",
      from: typeof raw.from === "string" ? raw.from : "",
      to: typeof raw.to === "string" ? raw.to : "",
      guests: Math.max(1, Math.min(12, Number(raw.guests) || 1)),
      category: categories.includes(raw.category as "all" | PropertyCategory)
        ? (raw.category as "all" | PropertyCategory)
        : "all",
      maxPrice: Math.max(200, Math.min(400, Number(raw.maxPrice) || 400)),
      rating: [0, 4.5, 4.8].includes(Number(raw.rating)) ? Number(raw.rating) : 0,
      beds: Math.max(0, Math.min(4, Number(raw.beds) || 0)),
      sort: ["recommended", "price-low", "price-high", "rating"].includes(String(raw.sort))
        ? (raw.sort as SortOption)
        : "recommended",
    };
  },

  head: () => ({
    meta: [
      { title: "Browse Handpicked Stays — Nestara" },
      { name: "description", content: "Explore and filter Nestara's handpicked resorts, lodges, apartments and boutique hotels." },
      { property: "og:title", content: "Browse Handpicked Stays — Nestara" },
      { property: "og:description", content: "Find a memorable stay with flexible filters, transparent prices and verified guest ratings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StaysPage,
});

function StaysPage() {
  const rawSearch = Route.useSearch();
  const search: ResolvedSearch = { ...defaults, ...rawSearch };
  const navigate = useNavigate({ from: "/stays/" });
  const { t, locale } = useLanguage();
  const { isFavorite, toggle } = useFavorites();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const dateLocale = locale === "fr" ? frLocale : enUS;
  const range: DateRange | undefined = search.from
    ? { from: parseISO(search.from), to: search.to ? parseISO(search.to) : undefined }
    : undefined;

  const update = (values: Partial<StaySearch>) => {
    void navigate({ search: (previous) => ({ ...previous, ...values }), replace: true });
  };

  const visible = useMemo(() => {
    const query = search.where.trim().toLocaleLowerCase();
    const result = properties.filter((property) => {
      const haystack = `${property.name} ${property.location.en} ${property.location.fr}`.toLocaleLowerCase();
      return (!query || haystack.includes(query)) &&
        (search.category === "all" || property.category === search.category) &&
        property.price <= search.maxPrice && property.rating >= search.rating &&
        property.beds >= search.beds && property.guests >= search.guests;
    });
    return [...result].sort((a, b) => {
      if (search.sort === "price-low") return a.price - b.price;
      if (search.sort === "price-high") return b.price - a.price;
      if (search.sort === "rating") return b.rating - a.rating;
      return b.rating * 20 - a.rating * 20 || a.price - b.price;
    });
  }, [search]);

  const activeCount = [search.category !== "all", search.maxPrice < 400, search.rating > 0, search.beds > 0].filter(Boolean).length;
  const dateText = range?.from
    ? `${format(range.from, "dd MMM", { locale: dateLocale })}${range.to ? ` – ${format(range.to, "dd MMM", { locale: dateLocale })}` : ""}`
    : t.search.datePlaceholder;

  const reset = () => update(defaults);

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:h-20 sm:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2 font-display font-bold">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Tent className="size-5" /></span>
            <span className="truncate text-xl">{t.brand}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link to="/">{t.nav.home}</Link></Button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-sky-panel">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <p className="text-sm font-bold text-primary">{t.explore.eyebrow}</p>
          <div className="mt-2 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h1 className="max-w-3xl font-display text-3xl font-bold text-balance sm:text-5xl">{t.explore.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{t.explore.subtitle}</p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">{t.explore.curated}</p>
          </div>

          <div className="mt-8 grid gap-2 rounded-2xl border border-border bg-surface p-2 shadow-lg sm:grid-cols-[1.2fr_1fr_0.8fr_auto] sm:rounded-full">
            <label className="flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 hover:bg-secondary sm:rounded-full">
              <MapPin className="size-4 shrink-0 text-primary" />
              <span className="sr-only">{t.search.where}</span>
              <Input value={search.where} onChange={(event) => update({ where: event.target.value })} placeholder={t.search.wherePlaceholder} className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" />
            </label>
            <Popover>
              <PopoverTrigger asChild><Button variant="ghost" className="h-12 justify-start rounded-xl px-4 sm:rounded-full"><CalendarDays className="text-primary" /><span className="truncate">{dateText}</span></Button></PopoverTrigger>
              <PopoverContent align="start" className="w-[calc(100vw-2rem)] max-w-sm p-0">
                <Calendar mode="range" selected={range} onSelect={(value) => update({ from: value?.from ? format(value.from, "yyyy-MM-dd") : "", to: value?.to ? format(value.to, "yyyy-MM-dd") : "" })} disabled={{ before: new Date() }} locale={dateLocale} fixedWeeks className="mx-auto p-3 [--cell-size:2.35rem]" />
              </PopoverContent>
            </Popover>
            <GuestPicker value={search.guests} onChange={(guests) => update({ guests })} />
            <Button size="lg" className="h-12 rounded-xl px-7 sm:rounded-full"><Search />{t.search.search}</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <aside className="sticky top-28 hidden lg:block">
            <div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">{t.explore.filters}</h2><Button variant="link" className="h-auto px-0" onClick={reset}>{t.explore.clearAll}</Button></div>
            <FilterPanel search={search} update={update} />
          </aside>

          <div className="min-w-0">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-display text-xl font-bold sm:text-2xl">{visible.length} {t.explore.results}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{search.where || t.explore.worldwide}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild><Button variant="outline" className="lg:hidden"><Filter />{t.explore.filters}{activeCount ? ` (${activeCount})` : ""}</Button></SheetTrigger>
                  <SheetContent side="bottom" className="max-h-[88svh] overflow-y-auto rounded-t-2xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                    <SheetHeader className="text-left"><SheetTitle>{t.explore.filters}</SheetTitle><SheetDescription>{t.explore.filterHint}</SheetDescription></SheetHeader>
                    <FilterPanel search={search} update={update} />
                    <div className="mt-6 grid grid-cols-2 gap-3"><Button variant="outline" onClick={reset}>{t.explore.clearAll}</Button><Button onClick={() => setMobileFiltersOpen(false)}>{t.explore.showResults.replace("{count}", String(visible.length))}</Button></div>
                  </SheetContent>
                </Sheet>
                <Select value={search.sort} onValueChange={(sort: SortOption) => update({ sort })}>
                  <SelectTrigger className="h-10 w-11 sm:w-48"><ArrowUpDown className="size-4 shrink-0 sm:hidden" /><span className="hidden sm:block"><SelectValue /></span></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">{t.explore.recommended}</SelectItem>
                    <SelectItem value="price-low">{t.explore.priceLow}</SelectItem>
                    <SelectItem value="price-high">{t.explore.priceHigh}</SelectItem>
                    <SelectItem value="rating">{t.explore.topRated}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeCount > 0 ? <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
              {search.category !== "all" ? <ActiveChip label={t.categories[search.category]} onRemove={() => update({ category: "all" })} /> : null}
              {search.maxPrice < 400 ? <ActiveChip label={`≤ $${search.maxPrice}`} onRemove={() => update({ maxPrice: 400 })} /> : null}
              {search.rating > 0 ? <ActiveChip label={`${search.rating}+ ★`} onRemove={() => update({ rating: 0 })} /> : null}
              {search.beds > 0 ? <ActiveChip label={`${search.beds}+ ${t.listings.beds}`} onRemove={() => update({ beds: 0 })} /> : null}
            </div> : null}

            {visible.length ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((property) => <PropertyCard key={property.id} property={property} isFavorite={isFavorite(property.id)} onToggleFavorite={(id) => { const added = toggle(id); toast(added ? t.listings.favouriteAdded : t.listings.favouriteRemoved); }} />)}
              </div>
            ) : (
              <div className="mt-10 rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
                <SlidersHorizontal className="mx-auto size-8 text-primary" />
                <h3 className="mt-4 font-display text-xl font-bold">{t.explore.noResults}</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{t.explore.noResultsHint}</p>
                <Button className="mt-6" onClick={reset}>{t.explore.resetFilters}</Button>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function GuestPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const { t } = useLanguage();
  return <Popover><PopoverTrigger asChild><Button variant="ghost" className="h-12 justify-start rounded-xl px-4 sm:rounded-full"><Users className="text-primary" />{value} {t.listings.guests}</Button></PopoverTrigger><PopoverContent className="w-72 p-4"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center"><div><p className="font-semibold">{t.detail.guestsLabel}</p><p className="text-xs text-muted-foreground">{t.explore.guestHint}</p></div><div className="flex items-center gap-3"><Button size="icon" variant="outline" className="size-8 rounded-full" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1}><Minus /></Button><span className="w-4 text-center text-sm font-bold">{value}</span><Button size="icon" variant="outline" className="size-8 rounded-full" onClick={() => onChange(Math.min(12, value + 1))}><Plus /></Button></div></div></PopoverContent></Popover>;
}

function FilterPanel({ search, update }: { search: ResolvedSearch; update: (values: Partial<StaySearch>) => void }) {
  const { t } = useLanguage();
  return <div className="mt-5 space-y-7">
    <fieldset><legend className="text-sm font-bold">{t.explore.propertyType}</legend><div className="mt-3 flex flex-wrap gap-2">{categories.map((category) => <Button key={category} variant={search.category === category ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => update({ category })}>{t.categories[category]}</Button>)}</div></fieldset>
    <fieldset><div className="flex justify-between gap-3"><legend className="text-sm font-bold">{t.explore.maxPrice}</legend><span className="text-sm font-semibold text-primary">${search.maxPrice}</span></div><Slider className="mt-4" min={200} max={400} step={10} value={[search.maxPrice]} onValueChange={([value]) => update({ maxPrice: value ?? 400 })} /><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>$200</span><span>$400+</span></div></fieldset>
    <fieldset><legend className="text-sm font-bold">{t.explore.guestRating}</legend><div className="mt-3 grid grid-cols-3 gap-2">{[0, 4.5, 4.8].map((rating) => <Button key={rating} variant={search.rating === rating ? "default" : "outline"} size="sm" onClick={() => update({ rating })}>{rating ? <><Star className="size-3 fill-current" />{rating}+</> : t.categories.all}</Button>)}</div></fieldset>
    <fieldset><legend className="text-sm font-bold">{t.explore.bedrooms}</legend><div className="mt-3 grid grid-cols-4 gap-2">{[0, 1, 2, 3].map((beds) => <Button key={beds} variant={search.beds === beds ? "default" : "outline"} size="sm" onClick={() => update({ beds })}>{beds ? `${beds}+` : t.categories.all}</Button>)}</div></fieldset>
  </div>;
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <button type="button" onClick={onRemove} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none")}>{label}<X className="size-3.5" /></button>;
}