// Sample jobs so the dashboard is alive on first load (and after the list is
// cleared) instead of showing an empty shell. Coordinates are pre-filled for the
// sample cities so they render without waiting on geocoding. Dates are computed
// relative to today at call time, spread across the near-term forecast window so
// the verdicts are real, varied, and meaningful.

import { isoFromToday } from "./dates";
import type { Job } from "./types";

export function seedJobs(): Job[] {
  return [
    {
      id: "seed-roof-austin",
      name: "Maple St. re-roof",
      location: "Austin, TX",
      date: isoFromToday(2),
      trade: "roofing",
      coords: { lat: 30.27, lon: -97.74, label: "Austin, Texas, US" },
    },
    {
      id: "seed-paint-seattle",
      name: "Office exterior repaint",
      location: "Seattle, WA",
      date: isoFromToday(4),
      trade: "painting",
      coords: { lat: 47.61, lon: -122.33, label: "Seattle, Washington, US" },
    },
    {
      id: "seed-concrete-denver",
      name: "Driveway pour",
      location: "Denver, CO",
      date: isoFromToday(3),
      trade: "concrete",
      coords: { lat: 39.74, lon: -104.99, label: "Denver, Colorado, US" },
    },
    {
      id: "seed-sod-miami",
      name: "Backyard sod install",
      location: "Miami, FL",
      date: isoFromToday(5),
      trade: "landscaping",
      coords: { lat: 25.76, lon: -80.19, label: "Miami, Florida, US" },
    },
  ];
}
