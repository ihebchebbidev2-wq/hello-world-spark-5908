import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, MessageSquare, Shield, Tent, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { CurrencySelector } from "@/components/layout/CurrencySelector";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageProvider";
import { setPlatform, usePlatform } from "@/hooks/usePlatform";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon?: typeof Tent };

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { t } = useLanguage();
  const { session, threads } = usePlatform();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = threads.reduce((sum, thread) => sum + thread.unread, 0);

  const nav: NavItem[] = [
    { to: "/stays", label: t.nav.stays },
    { to: "/trips", label: t.app.nav.trips },
    { to: "/messages", label: t.app.nav.messages, icon: MessageSquare },
    { to: "/host", label: t.app.nav.host, icon: LayoutDashboard },
    { to: "/admin", label: t.app.nav.admin, icon: Shield },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <Link to="/" className="flex min-w-0 items-center gap-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lime text-lime-foreground">
                <Tent className="size-5" aria-hidden />
              </span>
              <span className="truncate font-display text-lg font-bold">{t.brand}</span>
            </Link>
            <nav className="hidden items-center gap-5 lg:flex">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    pathname.startsWith(item.to) && "text-foreground",
                  )}
                >
                  {item.label}
                  {item.to === "/messages" && unread > 0 ? (
                    <span className="ml-1.5 rounded-full bg-lime px-1.5 py-0.5 text-[10px] font-bold text-lime-foreground">
                      {unread}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>
            <LanguageSelector />
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={t.app.nav.profile}
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-lime text-lime-foreground transition-transform hover:scale-105 active:scale-95"
                >
                  <UserRound className="size-5" aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{session.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/profile">{t.app.nav.profile}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/trips">{t.app.nav.trips}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/favourites">{t.app.nav.favourites}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/host">{t.app.nav.host}</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/admin">{t.app.nav.admin}</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      setPlatform({ session: null });
                      toast.success(t.app.auth.signedOut);
                    }}
                    className="cursor-pointer gap-2"
                  >
                    <LogOut className="size-4" aria-hidden />
                    {t.app.nav.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="rounded-full">
                <Link to="/auth">{t.app.auth.signIn}</Link>
              </Button>
            )}
          </div>
        </div>

        <nav className="no-scrollbar flex gap-4 overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors",
                pathname.startsWith(item.to) ? "bg-secondary text-foreground" : "hover:bg-secondary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {title ? (
          <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            {actions}
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
