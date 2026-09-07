import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { PropertyCard } from "@/components/home/PropertyCard";
import { EmptyState } from "@/routes/trips";
import { properties } from "@/data/properties";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/favourites")({
  head: () => ({
    meta: [
      { title: "Saved stays — RoomEasy" },
      { name: "description", content: "Every RoomEasy stay you saved, ready to compare and book." },
      { property: "og:title", content: "Saved stays — RoomEasy" },
      { property: "og:description", content: "Every RoomEasy stay you saved, ready to compare and book." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FavouritesPage,
});

function FavouritesPage() {
  const { t } = useLanguage();
  const { favorites, isFavorite, toggle } = useFavorites();
  const saved = properties.filter((property) => favorites.includes(property.id));

  return (
    <AppShell title={t.app.favourites.title} subtitle={t.app.favourites.subtitle}>
      {saved.length === 0 ? (
        <EmptyState text={t.app.favourites.empty} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={isFavorite(property.id)}
              onToggleFavorite={(id) => toggle(id)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
