import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useLanguage } from "./LanguageProvider";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CHF" | "BRL";

export const currencies: { code: CurrencyCode; symbol: string; label: string; rate: number }[] = [
  { code: "USD", symbol: "$", label: "US Dollar", rate: 1 },
  { code: "EUR", symbol: "€", label: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", label: "British Pound", rate: 0.79 },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc", rate: 0.88 },
  { code: "BRL", symbol: "R$", label: "Brazilian Real", rate: 5.4 },
];

const STORAGE_KEY = "nestara.currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** Formats an amount given in USD into the active currency and locale. */
  format: (amountUsd: number, options?: { decimals?: boolean }) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function isCurrency(value: string | null): value is CurrencyCode {
  return !!value && currencies.some((c) => c.code === value);
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isCurrency(stored)) setCurrencyState(stored);
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const format = useCallback(
    (amountUsd: number, options?: { decimals?: boolean }) => {
      const entry = currencies.find((c) => c.code === currency)!;
      const value = amountUsd * entry.rate;
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: entry.code,
        maximumFractionDigits: options?.decimals ? 2 : 0,
        minimumFractionDigits: options?.decimals ? 2 : 0,
      }).format(value);
    },
    [currency, locale],
  );

  const value = useMemo(() => ({ currency, setCurrency, format }), [currency, setCurrency, format]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside a CurrencyProvider");
  return ctx;
}
