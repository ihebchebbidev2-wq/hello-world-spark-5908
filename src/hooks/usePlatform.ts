import { useSyncExternalStore } from "react";

import {
  seedBookings,
  seedListings,
  seedPayouts,
  seedRateRules,
  seedReviews,
  seedTeam,
  seedThreads,
  seedUsers,
  type Booking,
  type HostListing,
  type Payout,
  type PlatformUser,
  type RateRules,
  type HostReview,
  type SessionUser,
  type TeamMember,
  type Thread,
} from "@/data/platform";

export type PlatformState = {
  session: SessionUser | null;
  bookings: Booking[];
  listings: HostListing[];
  threads: Thread[];
  users: PlatformUser[];
  payouts: Payout[];
  reviews: HostReview[];
  team: TeamMember[];
  rateRules: RateRules;
  blockedDates: string[];
  commissionRate: number;
  stripeOnboarded: boolean;
  cookiesChoice: "accepted" | "essential" | null;
};

const STORAGE_KEY = "nestara.platform";

const initialState: PlatformState = {
  session: null,
  bookings: seedBookings,
  listings: seedListings,
  threads: seedThreads,
  users: seedUsers,
  payouts: seedPayouts,
  reviews: seedReviews,
  team: seedTeam,
  rateRules: seedRateRules,
  blockedDates: [],
  commissionRate: 12,
  stripeOnboarded: false,
  cookiesChoice: null,
};

let state: PlatformState = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = { ...initialState, ...(JSON.parse(raw) as Partial<PlatformState>) };
      emit();
    }
  } catch {
    /* ignore malformed state */
  }
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setPlatform(update: Partial<PlatformState> | ((current: PlatformState) => Partial<PlatformState>)) {
  const patch = typeof update === "function" ? update(state) : update;
  state = { ...state, ...patch };
  persist();
  emit();
}

export function usePlatform(): PlatformState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initialState,
  );
}

export function useSession() {
  return usePlatform().session;
}
