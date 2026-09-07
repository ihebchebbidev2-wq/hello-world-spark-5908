import { createFileRoute } from "@tanstack/react-router";

import { AwardSection } from "@/components/home/AwardSection";
import { Hero } from "@/components/home/Hero";
import { StaysSection } from "@/components/home/StaysSection";
import { Testimonials } from "@/components/home/Testimonials";
import { ValueSection } from "@/components/home/ValueSection";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RoomEasy — Handpicked Resorts & Boutique Hotel Stays" },
      {
        name: "description",
        content:
          "Book handpicked resorts, lodges and boutique hotels with transparent pricing, secure payments and hassle-free refunds. Available in English and French.",
      },
      { property: "og:title", content: "RoomEasy — Handpicked Resorts & Boutique Hotel Stays" },
      {
        property: "og:description",
        content:
          "Discover curated vacation stays worldwide: resorts, lodges, apartments and hotels with best-price guarantee.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <StaysSection />
      <ValueSection />
      <AwardSection />
      <Testimonials />
      <Footer />
    </main>
  );
}
