import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "nestara.favorites";

/**
 * Local favourites store. Swap the storage calls for a Cloud-backed
 * table later without touching the component API.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw) as string[]);
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const toggle = useCallback((id: string) => {
    let added = false;
    setFavorites((prev) => {
      added = !prev.includes(id);
      const next = added ? [...prev, id] : prev.filter((f) => f !== id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return added;
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return { favorites, toggle, isFavorite };
}
