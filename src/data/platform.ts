import { properties } from "@/data/properties";

export type Role = "guest" | "host" | "admin";
export type BookingStatus = "pending" | "confirmed" | "declined" | "cancelled" | "completed";
export type ListingStatus = "draft" | "published" | "suspended";

export type SessionUser = {
  name: string;
  email: string;
  role: Role;
  verified: boolean;
};

export type Booking = {
  id: string;
  propertyId: string;
  guestName: string;
  from: string;
  to: string;
  nights: number;
  guests: number;
  totalUsd: number;
  status: BookingStatus;
};

export type HostListing = {
  id: string;
  propertyId: string;
  status: ListingStatus;
  nightlyUsd: number;
  approved: boolean;
};

export type Thread = {
  id: string;
  propertyId: string;
  withName: string;
  unread: number;
  messages: { id: string; from: "me" | "them"; text: string; time: string }[];
};

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  suspended: boolean;
  joined: string;
};

export type Payout = {
  id: string;
  hostName: string;
  amountUsd: number;
  status: "paid" | "scheduled";
  date: string;
};

export type HostReview = {
  id: string;
  propertyId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type TeamMember = { id: string; name: string; email: string; scopes: ("calendar" | "messaging")[] };

export type RateRules = { weekend: number; longStay: number; lastMinute: number };

const ids = properties.map((p) => p.id) as string[];
const pid = (i: number): string => ids[i] ?? "listing";

export const seedBookings: Booking[] = [
  { id: "bk-1", propertyId: pid(0), guestName: "Clara Mercier", from: "2026-09-18", to: "2026-09-22", nights: 4, guests: 2, totalUsd: 984, status: "confirmed" },
  { id: "bk-2", propertyId: pid(1), guestName: "Jonas Weber", from: "2026-10-04", to: "2026-10-07", nights: 3, guests: 4, totalUsd: 897, status: "pending" },
  { id: "bk-3", propertyId: pid(2), guestName: "Ana Ferreira", from: "2026-06-02", to: "2026-06-06", nights: 4, guests: 2, totalUsd: 1436, status: "completed" },
  { id: "bk-4", propertyId: pid(3), guestName: "Marc Dupont", from: "2026-05-11", to: "2026-05-13", nights: 2, guests: 3, totalUsd: 498, status: "cancelled" },
  { id: "bk-5", propertyId: pid(4), guestName: "Lucía Ortega", from: "2026-11-01", to: "2026-11-05", nights: 4, guests: 5, totalUsd: 1320, status: "pending" },
];

export const seedListings: HostListing[] = properties.map((p, index) => ({
  id: `ls-${index + 1}`,
  propertyId: p.id,
  status: index === 4 ? "draft" : index === 5 ? "suspended" : "published",
  nightlyUsd: p.price,
  approved: index !== 4,
}));

export const seedThreads: Thread[] = [
  {
    id: "th-1",
    propertyId: pid(0),
    withName: "Maya (host)",
    unread: 2,
    messages: [
      { id: "m1", from: "them", text: "Hi! Your booking request is in — do you need an early check-in?", time: "09:12" },
      { id: "m2", from: "me", text: "Yes please, we land at 11am.", time: "09:20" },
      { id: "m3", from: "them", text: "Perfect, the flat will be ready from 11:30.", time: "09:24" },
    ],
  },
  {
    id: "th-2",
    propertyId: pid(1),
    withName: "Jonas Weber",
    unread: 0,
    messages: [
      { id: "m1", from: "them", text: "Is parking included for two cars?", time: "14:02" },
      { id: "m2", from: "me", text: "One space is included, the second is €12 a night.", time: "14:30" },
    ],
  },
  {
    id: "th-3",
    propertyId: pid(2),
    withName: "Ana Ferreira",
    unread: 1,
    messages: [{ id: "m1", from: "them", text: "Thanks again — we left the keys in the box.", time: "18:45" }],
  },
];

export const seedUsers: PlatformUser[] = [
  { id: "u-1", name: "Maya Lindqvist", email: "maya@nestara.travel", role: "host", suspended: false, joined: "2025-02-11" },
  { id: "u-2", name: "Clara Mercier", email: "clara@example.com", role: "guest", suspended: false, joined: "2025-06-02" },
  { id: "u-3", name: "Jonas Weber", email: "jonas@example.com", role: "guest", suspended: false, joined: "2025-08-19" },
  { id: "u-4", name: "Ana Ferreira", email: "ana@example.com", role: "host", suspended: true, joined: "2024-11-30" },
  { id: "u-5", name: "Sofia Marchetti", email: "sofia@nestara.travel", role: "admin", suspended: false, joined: "2024-01-08" },
];

export const seedPayouts: Payout[] = [
  { id: "po-1", hostName: "Maya Lindqvist", amountUsd: 2840, status: "paid", date: "2026-08-01" },
  { id: "po-2", hostName: "Ana Ferreira", amountUsd: 1120, status: "scheduled", date: "2026-09-01" },
  { id: "po-3", hostName: "Tomas Alvarez", amountUsd: 640, status: "scheduled", date: "2026-09-01" },
];

export const seedReviews: HostReview[] = [
  { id: "rv-1", propertyId: pid(0), author: "Clara M.", rating: 5, text: "Spotless, quiet and exactly as pictured.", date: "2026-07-22" },
  { id: "rv-2", propertyId: pid(1), author: "Daniel O.", rating: 4, text: "Great location, the kitchen could use more pans.", date: "2026-06-14" },
  { id: "rv-3", propertyId: pid(2), author: "Mei T.", rating: 5, text: "The host thought of everything for our late arrival.", date: "2026-05-03" },
];

export const seedTeam: TeamMember[] = [
  { id: "tm-1", name: "Elena Rossi", email: "elena@nestara.travel", scopes: ["calendar", "messaging"] },
  { id: "tm-2", name: "Paul Girard", email: "paul@nestara.travel", scopes: ["messaging"] },
];

export const seedRateRules: RateRules = { weekend: 15, longStay: 10, lastMinute: 5 };

export const monthlyBookings = [
  { month: "Jan", value: 4 }, { month: "Feb", value: 6 }, { month: "Mar", value: 9 },
  { month: "Apr", value: 7 }, { month: "May", value: 12 }, { month: "Jun", value: 15 },
  { month: "Jul", value: 18 }, { month: "Aug", value: 21 }, { month: "Sep", value: 14 },
];

export const SERVICE_FEE_RATE = 0.08;
export const TAX_RATE = 0.05;
