import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { properties } from "@/data/properties";
import { setPlatform, usePlatform } from "@/hooks/usePlatform";
import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — RoomEasy" },
      { name: "description", content: "Threaded conversations between RoomEasy guests and hosts, with unread indicators." },
      { property: "og:title", content: "Messages — RoomEasy" },
      { property: "og:description", content: "Threaded conversations between RoomEasy guests and hosts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { t } = useLanguage();
  const { threads } = usePlatform();
  const [activeId, setActiveId] = useState(threads[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const active = threads.find((thread) => thread.id === activeId);

  function openThread(id: string) {
    setActiveId(id);
    setPlatform((state) => ({ threads: state.threads.map((th) => (th.id === id ? { ...th, unread: 0 } : th)) }));
  }

  function send() {
    if (!draft.trim() || !active) return;
    setPlatform((state) => ({
      threads: state.threads.map((th) =>
        th.id === active.id
          ? { ...th, messages: [...th.messages, { id: `m-${Date.now()}`, from: "me" as const, text: draft.trim(), time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) }] }
          : th,
      ),
    }));
    setDraft("");
    toast.success(t.app.messages.sent);
  }

  return (
    <AppShell title={t.app.messages.title} subtitle={t.app.messages.subtitle}>
      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <ul className="space-y-2">
          {threads.map((thread) => {
            const property = properties.find((p) => p.id === thread.propertyId);
            return (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => openThread(thread.id)}
                  className={cn(
                    "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-4 text-left transition-colors",
                    thread.id === activeId ? "border-primary bg-secondary" : "border-border bg-surface hover:bg-secondary",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{thread.withName}</p>
                    <p className="truncate text-xs text-muted-foreground">{property?.name}</p>
                  </div>
                  {thread.unread > 0 ? (
                    <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold text-lime-foreground">{thread.unread}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        <section className="flex min-h-[28rem] flex-col rounded-2xl border border-border bg-surface">
          {active ? (
            <>
              <header className="border-b border-border px-5 py-4">
                <h2 className="font-display text-lg font-bold">{active.withName}</h2>
                <p className="text-xs text-muted-foreground">{properties.find((p) => p.id === active.propertyId)?.name}</p>
              </header>
              <ul className="flex-1 space-y-3 overflow-y-auto p-5">
                {active.messages.map((message) => (
                  <li key={message.id} className={cn("flex", message.from === "me" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                        message.from === "me" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                      )}
                    >
                      <p>{message.text}</p>
                      <p className={cn("mt-1 text-[10px]", message.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground")}>{message.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <form
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-t border-border p-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  send();
                }}
              >
                <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t.app.messages.placeholder} className="h-12" />
                <Button type="submit" size="lg" aria-label={t.app.messages.send}><Send className="size-4" aria-hidden /></Button>
              </form>
            </>
          ) : (
            <p className="m-auto p-10 text-sm text-muted-foreground">{t.app.messages.empty}</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
