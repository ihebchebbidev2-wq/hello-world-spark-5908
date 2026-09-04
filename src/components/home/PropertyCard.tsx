import { Bath, BedDouble, Heart, Ruler, Star, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";

import type { Property } from "@/data/properties";
import { interpolate, useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

type Props = {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function PropertyCard({ property, isFavorite, onToggleFavorite }: Props) {
  const { t, locale } = useLanguage();

  const specs = [
    { icon: Users, value: `${property.guests} ${t.listings.guests}` },
    { icon: BedDouble, value: `${property.beds} ${t.listings.beds}` },
    { icon: Bath, value: `${property.baths} ${t.listings.baths}` },
    { icon: Ruler, value: `${property.area} ft²` },
  ];

  return (
    <article className="group relative isolate overflow-hidden rounded-[1.75rem] bg-surface shadow-sm ring-1 ring-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-lime/50">
      <Link
        to="/stays/$propertyId"
        params={{ propertyId: property.id }}
        aria-label={interpolate(t.listings.viewDetails, { property: property.name })}
        className="absolute inset-0 z-[1] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      />
      <img
        src={property.image}
        alt={property.name}
        loading="lazy"
        width={900}
        height={700}
        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5 transition-opacity duration-300 group-hover:from-black/90" />

      <button
        type="button"
        aria-label={t.listings.save}
        aria-pressed={isFavorite}
        onClick={() => onToggleFavorite(property.id)}
        className="absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full bg-surface/90 text-foreground shadow-sm backdrop-blur transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none active:scale-95"
      >
        <Heart
          className={cn("size-4 transition-colors", isFavorite && "fill-destructive text-destructive")}
          aria-hidden
        />
      </button>


      <div className="relative flex h-full min-h-[20rem] flex-col justify-end p-5 text-white transition-transform duration-300 group-hover:-translate-y-0.5 sm:min-h-[22rem] sm:p-6">
        <h3 className="font-display text-xl leading-snug font-bold tracking-tight">{property.name}</h3>
        <p className="mt-0.5 text-sm text-white/80">{cityName(property, locale)}</p>


        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-white/80">
          {specs.map((s) => (
            <li key={s.value} className="flex items-center gap-1.5">
              <s.icon className="size-3.5" aria-hidden />
              {s.value}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3.5">
          <p className="font-display text-xl font-bold text-lime">
            ${property.price}
            <span className="text-sm font-normal text-white/80">/{t.listings.night}</span>
          </p>

          <p className="flex items-center gap-1 text-sm">
            <Star className="size-3.5 fill-lime text-lime" aria-hidden />
            {property.rating.toFixed(1)}
          </p>
        </div>
      </div>
    </article>
  );
}
