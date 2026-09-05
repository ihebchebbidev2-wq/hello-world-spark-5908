import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setPlatform, usePlatform } from "@/hooks/usePlatform";
import { useLanguage } from "@/i18n/LanguageProvider";

export function CookieBanner() {
  const { t } = useLanguage();
  const { cookiesChoice } = usePlatform();
  if (cookiesChoice) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-xl sm:flex-row sm:items-center">
        <p className="flex flex-1 items-start gap-2.5 text-sm text-muted-foreground">
          <Cookie className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {t.app.cookies.text}{" "}
            <Link to="/privacy" className="font-semibold text-foreground underline underline-offset-4">
              {t.app.cookies.more}
            </Link>
          </span>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => setPlatform({ cookiesChoice: "essential" })}>
            {t.app.cookies.decline}
          </Button>
          <Button size="sm" onClick={() => setPlatform({ cookiesChoice: "accepted" })}>
            {t.app.cookies.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
