import { Menu, Tent, UserRound, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";


import { CurrencySelector } from "@/components/layout/CurrencySelector";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useLanguage } from "@/i18n/LanguageProvider";

export function Header() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const links = [
    { label: t.nav.home, href: "#top" },
    { label: t.nav.stays, href: "/stays" },
    { label: t.nav.experiences, href: "#values" },
    { label: t.nav.journal, href: "#testimonials" },
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
        <a href="#top" className="flex min-w-0 items-center gap-2 text-white">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lime text-lime-foreground">
            <Tent className="size-5" aria-hidden />
          </span>
          <span className="truncate font-display text-xl font-bold">{t.brand}</span>
        </a>

        <nav className="hidden justify-center gap-8 lg:flex">
          {links.map((l) => {
            const cls =
              "relative text-sm font-medium text-white/85 transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-lime after:transition-all hover:text-lime hover:after:w-full focus-visible:text-lime focus-visible:outline-none focus-visible:after:w-full";
            return l.href.startsWith("/") ? (
              <Link key={l.href} to="/stays" className={cls}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className={cls}>
                {l.label}
              </a>
            );
          })}
        </nav>


        <div className="flex items-center justify-end gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <CurrencySelector variant="dark" />
            <LanguageSelector variant="dark" />
          </div>
          <button
            type="button"
            onClick={() => toast.success(t.auth.connect)}
            className="hidden items-center gap-2 rounded-full bg-lime py-2 pr-5 pl-2 text-sm font-bold text-lime-foreground shadow-[0_10px_24px_-12px_var(--lime)] transition-all hover:scale-[1.03] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-95 sm:inline-flex"
          >
            <span className="grid size-7 place-items-center rounded-full bg-lime-foreground/10">
              <UserRound className="size-4" aria-hidden />
            </span>
            {t.auth.connect}
          </button>
          <button
            type="button"
            aria-label={t.auth.connect}
            onClick={() => toast.success(t.auth.connect)}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-lime text-lime-foreground transition-transform hover:scale-105 active:scale-95 sm:hidden"
          >
            <UserRound className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-lime focus-visible:outline-none lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

        </div>
      </div>

      {open ? (
        <div className="mx-5 rounded-3xl border border-border bg-surface p-4 shadow-xl lg:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            <LanguageSelector />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                toast.success(t.auth.connect);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2 text-sm font-bold text-lime-foreground transition-transform active:scale-95"
            >
              <UserRound className="size-4" aria-hidden />
              {t.auth.connect}
            </button>
          </div>

        </div>
      ) : null}
    </header>
  );
}
