import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setPlatform } from "@/hooks/usePlatform";
import { interpolate, useLanguage } from "@/i18n/LanguageProvider";
import type { Role } from "@/data/platform";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create an account — RoomEasy" },
      { name: "description", content: "Access your RoomEasy trips, messages and host dashboard with one account." },
      { property: "og:title", content: "Sign in or create an account — RoomEasy" },
      { property: "og:description", content: "One RoomEasy account to book stays and to publish your own place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("guest");

  function signIn(displayName: string, created: boolean) {
    setPlatform({
      session: { name: displayName || email.split("@")[0] || "Traveller", email: email || "guest@roomeasy.com", role, verified: !created },
    });
    toast.success(created ? t.app.auth.created : interpolate(t.app.auth.signedIn, { name: displayName || email }));
    void navigate({ to: role === "host" ? "/host" : "/trips" });
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between bg-foreground p-12 text-background lg:flex">
        <BrandLogo inverted className="h-24" />
        <div>
          <h2 className="font-display text-4xl leading-tight font-bold">{t.hero.titleLine1}<br />{t.hero.titleLine2}</h2>
          <p className="mt-4 max-w-sm text-sm text-background/70">{t.app.auth.createIntro}</p>
        </div>
        <p className="text-xs text-background/50">{t.app.auth.demoNote}</p>
      </section>

      <section className="flex items-center justify-center px-5 py-14 sm:px-10">
        <div className="w-full max-w-md">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t.app.auth.signIn}</TabsTrigger>
              <TabsTrigger value="signup">{t.app.auth.signUp}</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-8">
              <h1 className="font-display text-2xl font-bold">{t.app.auth.welcome}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.app.auth.intro}</p>
              <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  signIn(email.split("@")[0] ?? "Traveller", false);
                }}
              >
                <Field id="signin-email" label={t.app.auth.email} type="email" value={email} onChange={setEmail} />
                <Field id="signin-password" label={t.app.auth.password} type="password" value={password} onChange={setPassword} />
                <button
                  type="button"
                  onClick={() => toast.success(t.app.auth.resetSent)}
                  className="text-xs font-semibold text-primary underline underline-offset-4"
                >
                  {t.app.auth.forgot}
                </button>
                <Button type="submit" size="lg" className="w-full">{t.app.auth.signIn}</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-8">
              <h1 className="font-display text-2xl font-bold">{t.app.auth.signUp}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.app.auth.createIntro}</p>
              <form
                className="mt-6 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  signIn(name, true);
                }}
              >
                <Field id="signup-name" label={t.app.auth.name} type="text" value={name} onChange={setName} />
                <Field id="signup-email" label={t.app.auth.email} type="email" value={email} onChange={setEmail} />
                <Field id="signup-password" label={t.app.auth.password} type="password" value={password} onChange={setPassword} />
                <div>
                  <p className="mb-2 text-sm font-medium">{t.app.auth.iAm}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([["guest", t.app.auth.asGuest], ["host", t.app.auth.asHost]] as const).map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setRole(value)}
                        aria-pressed={role === value}
                        className={cn(
                          "rounded-xl border p-4 text-left text-sm font-semibold transition-colors",
                          role === value ? "border-primary bg-secondary text-primary" : "border-border hover:bg-secondary",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full">{t.app.auth.signUp}</Button>
                <p className="text-center text-xs text-muted-foreground">{t.app.auth.verifyEmail}</p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}

function Field({
  id, label, type, value, onChange,
}: { id: string; label: string; type: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} required onChange={(event) => onChange(event.target.value)} className="h-12" />
    </div>
  );
}
