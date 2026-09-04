import type { Locale } from "@/i18n/translations";

import prop1 from "@/assets/prop-1.jpg";
import prop2 from "@/assets/prop-2.jpg";
import prop3 from "@/assets/prop-3.jpg";
import prop4 from "@/assets/prop-4.jpg";
import prop5 from "@/assets/prop-5.jpg";
import prop6 from "@/assets/prop-6.jpg";

export type PropertyCategory = "apartment" | "resort" | "lodge" | "hotel";

export type Property = {
  id: string;
  name: string;
  location: Partial<Record<Locale, string>> & { en: string };
  image: string;
  category: PropertyCategory;
  guests: number;
  beds: number;
  baths: number;
  area: number;
  price: number;
  rating: number;
};

export function cityName(property: Property, locale: Locale) {
  return property.location[locale] ?? property.location.en;
}

export const categories: ("all" | PropertyCategory)[] = [
  "all",
  "apartment",
  "resort",
  "lodge",
  "hotel",
];

export const properties: Property[] = [
  {
    id: "hidden-quill-haven",
    name: "Hidden Quill Haven",
    location: { en: "New York, USA", fr: "New York, États-Unis" },
    image: prop1,
    category: "apartment",
    guests: 4,
    beds: 2,
    baths: 2,
    area: 1500,
    price: 246,
    rating: 4.9,
  },
  {
    id: "coastal-haven-lodge",
    name: "Coastal Haven Lodge",
    location: { en: "Andalusia, Spain", fr: "Andalousie, Espagne" },
    image: prop2,
    category: "lodge",
    guests: 5,
    beds: 3,
    baths: 2,
    area: 1600,
    price: 299,
    rating: 4.8,
  },
  {
    id: "brass-lantern-inn",
    name: "Brass Lantern Inn",
    location: { en: "Paris, France", fr: "Paris, France" },
    image: prop3,
    category: "hotel",
    guests: 6,
    beds: 3,
    baths: 2,
    area: 1500,
    price: 325,
    rating: 4.5,
  },
  {
    id: "golden-willowbrook",
    name: "Golden Willowbrook Mansion",
    location: { en: "Miami, USA", fr: "Miami, États-Unis" },
    image: prop4,
    category: "resort",
    guests: 5,
    beds: 3,
    baths: 2,
    area: 1500,
    price: 249,
    rating: 4.8,
  },
  {
    id: "the-verdant-frame",
    name: "The Verdant Frame",
    location: { en: "Jakarta, Indonesia", fr: "Jakarta, Indonésie" },
    image: prop5,
    category: "lodge",
    guests: 5,
    beds: 2,
    baths: 2,
    area: 1500,
    price: 330,
    rating: 4.6,
  },
  {
    id: "silver-fern-estate",
    name: "Silver Fern Estate",
    location: { en: "Lisbon, Portugal", fr: "Lisbonne, Portugal" },
    image: prop6,
    category: "hotel",
    guests: 4,
    beds: 2,
    baths: 2,
    area: 1500,
    price: 359,
    rating: 4.9,
  },
];
