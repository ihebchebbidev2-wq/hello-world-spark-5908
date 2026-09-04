import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PropertyCard } from "@/components/home/PropertyCard";
import { categories, properties, type PropertyCategory } from "@/data/properties";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function StaysSection() {
  const { t } = useLanguage();
  const [active, setActive] = useState<"all" | PropertyCategory>("all");
  const [destination, setDestination] = useState("");
  const { isFavorite, toggle } = useFavorites();

  useEffect(() => {
    const handleSearch = (event: Event) => {
      const query = (event as CustomEvent<{ where?: string }>).detail?.where ?? "";
      setDestination(query.toLocaleLowerCase());
    };
    window.addEventListener("nestara:search", handleSearch);
    return () => window.removeEventListener("nestara:search", handleSearch);
  }, []);

  const visible = useMemo(() => properties.filter((property) => {
    const categoryMatches = active === "all" || property.category === active;
    const searchable = `${property.name} ${property.location.en} ${property.location.fr}`.toLocaleLowerCase();
    return categoryMatches && (!destination || searchable.includes(destination));
  }), [active, destination]);

  return (
    <section id="stays" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          {t.listings.title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-balance text-muted-foreground sm:text-base">
          {t.listings.subtitle}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:mt-12">
        <div className="no-scrollbar -mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 py-1">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              aria-pressed={active === c}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:outline-none",
                active === c
                  ? "border-lime bg-lime text-lime-foreground shadow-[0_8px_20px_-10px_var(--lime)]"
                  : "border-border bg-surface text-foreground hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-secondary",
              )}
            >
              {t.categories[c]}
            </button>
          ))}
        </div>
        <Link
          to="/stays"
          search={{ where: "", from: "", to: "", guests: 1, category: active, maxPrice: 400, rating: 0, beds: 0, sort: "recommended" }}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors hover:text-muted-foreground focus-visible:outline-none"
        >
          <span className="hidden sm:inline">{t.listings.seeAll}</span>
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">{t.listings.empty}</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">

          {visible.slice(0, 6).map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isFavorite={isFavorite(p.id)}
              onToggleFavorite={(id) => {
                const added = toggle(id);
                toast(added ? t.listings.favouriteAdded : t.listings.favouriteRemoved);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
