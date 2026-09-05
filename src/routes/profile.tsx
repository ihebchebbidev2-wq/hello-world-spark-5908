import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { CurrencySelector } from "@/components/layout/CurrencySelector";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { setPlatform, usePlatform } from "@/hooks/usePlatform";
import { useLanguage } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Nestara" },
      { name: "description", content: "Update your Nestara name, contact details, language, currency and security preferences." },
      { property: "og:title", content: "Your profile — Nestara" },
      { property: "og:description", content: "Name, contact details, language, currency and security preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useLanguage();
  const { session } = usePlatform();
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <AppShell title={t.app.profile.title} subtitle={t.app.profile.subtitle}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPlatform((s) => ({
              session: s.session ? { ...s.session, name, email } : { name, email, role: "guest", verified: false },
            }));
            toast.success(t.app.profile.saved);
          }}
          className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-lime text-lime-foreground">
              <UserRound className="size-8" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold">{t.app.profile.photo}</p>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => toast.success(t.app.profile.saved)}>
                {t.app.profile.changePhoto}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t.app.auth.name}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.app.auth.email}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">{t.app.profile.role}</span>
            <Badge variant="secondary" className="capitalize">{session?.role ?? "guest"}</Badge>
            {session?.verified ? (
              <Badge className="border-0 bg-emerald-500/15 text-emerald-700">{t.app.auth.verified}</Badge>
            ) : (
              <Badge className="border-0 bg-amber-500/15 text-amber-700">{t.app.auth.verifyEmail}</Badge>
            )}
          </div>

          <Button type="submit">{t.app.profile.save}</Button>
        </form>

        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">{t.app.profile.preferences}</h2>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t.app.profile.language}</span>
              <LanguageSelector />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{t.app.profile.currency}</span>
              <CurrencySelector />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">{t.app.profile.security}</h2>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast.success(t.app.auth.resetSent)}>
              <KeyRound className="size-4" aria-hidden />
              {t.app.profile.password}
            </Button>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm">
                <ShieldCheck className="size-4 text-muted-foreground" aria-hidden />
                {t.app.profile.twoFactor}
              </span>
              <Switch
                checked={twoFactor}
                onCheckedChange={(v) => {
                  setTwoFactor(v);
                  toast.success(t.app.profile.saved);
                }}
                aria-label={t.app.profile.twoFactor}
              />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
