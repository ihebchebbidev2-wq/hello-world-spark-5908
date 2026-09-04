import { Star } from "lucide-react";

import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import heroImage from "@/assets/hero-resort.jpg";
import { SearchBar } from "@/components/home/SearchBar";
import { Header } from "@/components/layout/Header";
import { useLanguage } from "@/i18n/LanguageProvider";

const trustAvatars = [avatar1, avatar2, avatar3];

export function Hero() {
  const { t } = useLanguage();

  return (
    <section id="top" className="px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="relative isolate flex min-h-[calc(100svh-1.5rem)] flex-col overflow-hidden rounded-[2rem] sm:min-h-[calc(100svh-2.5rem)] sm:max-h-[46rem] sm:rounded-[2.5rem]">
        <img
          src={heroImage}
          alt={t.hero.imageAlt}
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        {/* layered scrim keeps white type readable over the bright sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/25" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_35%,rgb(0_0_0/0.45),transparent_70%)]" />

        <Header />

        <div className="relative mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-5 pt-20 pb-5 text-center sm:pt-24 sm:pb-7 lg:pt-20">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-black/35 py-1.5 pr-5 pl-2 backdrop-blur-md">
            <span className="flex -space-x-2">
              {trustAvatars.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  loading="lazy"
                  width={512}
                  height={512}
                  className="size-6 rounded-full object-cover ring-2 ring-white/70"
                />
              ))}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.1em] text-lime uppercase sm:text-sm">
              <Star className="size-3.5 fill-lime" aria-hidden />
              {t.hero.badge}
            </span>
          </div>

          <h1 className="mt-4 font-display text-[2rem] leading-[1.05] font-bold tracking-tight text-balance text-white drop-shadow-[0_2px_18px_rgb(0_0_0/0.55)] sm:mt-5 sm:text-5xl lg:text-[3.5rem]">
            {t.hero.titleLine1}
            <br className="hidden sm:block" /> {t.hero.titleLine2}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-balance text-white/95 drop-shadow-[0_1px_10px_rgb(0_0_0/0.5)] sm:mt-4 sm:text-base">
            {t.hero.subtitle}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-5xl px-4 pb-5 sm:px-8 sm:pb-8">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
