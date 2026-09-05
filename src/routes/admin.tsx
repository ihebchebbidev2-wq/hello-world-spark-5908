import { createFileRoute } from "@tanstack/react-router";
import { Check, Search, Shield, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { properties } from "@/data/properties";
import { setPlatform, usePlatform } from "@/hooks/usePlatform";
import { useCurrency } from "@/i18n/CurrencyProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin back office — Nestara" },
      { name: "description", content: "Moderate listings, manage Nestara members, review payouts and tune platform settings." },
      { property: "og:title", content: "Admin back office — Nestara" },
      { property: "og:description", content: "Moderate listings, manage members, review payouts and platform settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const { listings, users, payouts, commissionRate } = usePlatform();
  const [query, setQuery] = useState("");
  const [commission, setCommission] = useState(String(commissionRate));

  const pending = listings.filter((l) => !l.approved);
  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <AppShell title={t.app.admin.title} subtitle={t.app.admin.subtitle}>
      <Tabs defaultValue="approvals">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 sm:w-auto">
          <TabsTrigger value="approvals">{t.app.admin.approvals}</TabsTrigger>
          <TabsTrigger value="users">{t.app.admin.users}</TabsTrigger>
          <TabsTrigger value="payouts">{t.app.admin.payouts}</TabsTrigger>
          <TabsTrigger value="reports">{t.app.admin.reports}</TabsTrigger>
          <TabsTrigger value="settings">{t.app.admin.settings}</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-6">
          {pending.length === 0 ? (
            <Empty text={t.app.admin.noReports} />
          ) : (
            <ul className="grid gap-4">
              {pending.map((listing) => {
                const property = properties.find((p) => p.id === listing.propertyId);
                return (
                  <li
                    key={listing.id}
                    className="grid gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-lg font-bold">{property?.name ?? listing.propertyId}</h2>
                      <p className="text-sm text-muted-foreground">
                        {format(listing.nightlyUsd)} · {t.app.host[listing.status]}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setPlatform((s) => ({
                            listings: s.listings.map((l) =>
                              l.id === listing.id ? { ...l, approved: true, status: "published" as const } : l,
                            ),
                          }));
                          toast.success(t.app.admin.approved);
                        }}
                      >
                        <Check className="size-4" aria-hidden />
                        {t.app.admin.approve}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPlatform((s) => ({
                            listings: s.listings.map((l) =>
                              l.id === listing.id ? { ...l, status: "suspended" as const } : l,
                            ),
                          }));
                          toast.success(t.app.admin.rejected);
                        }}
                      >
                        <X className="size-4" aria-hidden />
                        {t.app.admin.reject}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.app.admin.searchUsers}
              aria-label={t.app.admin.searchUsers}
              className="pl-9"
            />
          </div>
          <ul className="grid gap-3">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className="grid gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{t.app.admin[user.role]}</Badge>
                  {user.suspended ? <Badge className="border-0 bg-destructive/10 text-destructive">{t.app.admin.suspend}</Badge> : null}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPlatform((s) => ({
                        users: s.users.map((u) => (u.id === user.id ? { ...u, suspended: !u.suspended } : u)),
                      }));
                      toast.success(t.app.admin.updated);
                    }}
                  >
                    {user.suspended ? t.app.admin.reinstate : t.app.admin.suspend}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <ul className="grid gap-3">
            {payouts.map((payout) => (
              <li
                key={payout.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{payout.hostName}</p>
                  <p className="text-sm text-muted-foreground">{payout.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={cn(
                      "border-0",
                      payout.status === "paid" ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700",
                    )}
                  >
                    {payout.status === "paid" ? t.app.admin.paid : t.app.admin.scheduled}
                  </Badge>
                  <span className="font-display text-lg font-bold">{format(payout.amountUsd)}</span>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Empty text={t.app.admin.noReports} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPlatform({ commissionRate: Number(commission) || 0 });
              toast.success(t.app.admin.settingsSaved);
            }}
            className="max-w-md space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm"
          >
            <div className="space-y-2">
              <Label htmlFor="commission">{t.app.admin.commission}</Label>
              <Input
                id="commission"
                type="number"
                min={0}
                max={50}
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t.app.admin.commissionHint}</p>
            </div>
            <Button type="submit">{t.app.admin.saveSettings}</Button>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5" aria-hidden />
              {t.app.admin.auditNote}
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
