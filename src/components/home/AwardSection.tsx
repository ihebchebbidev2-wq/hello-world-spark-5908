import { Bath, BedDouble, Heart, Ruler, Star, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import awardHotel from "@/assets/award-hotel.jpg";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function AwardSection() {
  const { t } = useLanguage();
  const [liked, setLiked] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="relative isolate overflow-hidden rounded-[2rem]">
        <img
          src={awardHotel}
          alt={t.award.imageAlt}
          loading="lazy"
          width={1600}
          height={1008}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />

        <div className="relative grid gap-10 p-7 sm:p-12 lg:grid-cols-2 lg:items-end">
          <div className="max-w-lg text-white">
            <h2 className="text-2xl leading-tight font-bold sm:text-4xl">{t.award.title}</h2>
            <p className="mt-4 max-w-sm text-sm text-white/80">{t.award.body}</p>
          </div>

          <div className="w-full max-w-sm justify-self-end rounded-[1.5rem] bg-surface p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-display text-base font-semibold">{t.award.property}</h3>
                <p className="truncate text-sm text-muted-foreground">{t.award.location}</p>
              </div>
              <button
                type="button"
                aria-label={t.listings.save}
                aria-pressed={liked}
                onClick={() => setLiked((v) => !v)}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-border transition-colors hover:bg-secondary"
              >
                <Heart
                  className={cn("size-4", liked && "fill-destructive text-destructive")}
                  aria-hidden
                />
              </button>
            </div>

            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden />4 {t.listings.guests}
              </li>
              <li className="flex items-center gap-1.5">
                <BedDouble className="size-3.5" aria-hidden />2 {t.listings.beds}
              </li>
              <li className="flex items-center gap-1.5">
                <Bath className="size-3.5" aria-hidden />2 {t.listings.baths}
              </li>
              <li className="flex items-center gap-1.5">
                <Ruler className="size-3.5" aria-hidden />
                1500 ft²
              </li>
            </ul>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-lg font-semibold">
                $246
                <span className="text-sm font-normal text-muted-foreground">
                  /{t.listings.night}
                </span>
              </p>
              <p className="flex items-center gap-1 text-sm">
                <Star className="size-3.5 fill-foreground" aria-hidden />
                4.9
              </p>
            </div>

            <button
              type="button"
              onClick={() => toast.success(t.award.booked)}
              className="mt-4 w-full rounded-full bg-lime py-3 text-sm font-semibold text-lime-foreground transition-transform hover:scale-[1.02] active:scale-95"
            >
              {t.award.book}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
