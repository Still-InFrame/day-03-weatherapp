// The per-trade rule sets are the heart of CrewCast: the SAME forecast yields a
// different verdict depending on the trade, because each trade has different
// tolerances. A generic weather app can't do this. Thresholds live here in one
// table so they're easy to read and tune; the evaluation logic lives in verdict.ts.

import type { DailyForecast, TradeKey, Verdict } from "./types";

// A rule fires when `test` is true, contributing its `severity` and `reason`.
// Severity is only ever "caution" or "reschedule" — "go" is the absence of any rule.
export interface Rule {
  severity: Exclude<Verdict, "go">;
  test: (f: DailyForecast) => boolean;
  reason: (f: DailyForecast) => string;
}

export interface TradeDef {
  key: TradeKey;
  label: string;
  blurb: string; // what this trade cares about, shown in the UI
  rules: Rule[];
}

// Small formatting helpers so reasons read like a foreman talking, not a data dump.
const pct = (f: DailyForecast) => `${Math.round(f.precipProbabilityMax)}% rain`;
const wind = (f: DailyForecast) => `${Math.round(f.windMax)} mph wind`;
const inches = (f: DailyForecast) => `${f.precipSum.toFixed(2)}" rain`;

export const TRADES: Record<TradeKey, TradeDef> = {
  roofing: {
    key: "roofing",
    label: "Roofing",
    blurb: "Stops for rain or high wind",
    rules: [
      { severity: "reschedule", test: (f) => f.precipProbabilityMax >= 60, reason: pct },
      { severity: "reschedule", test: (f) => f.windMax > 25, reason: wind },
      {
        severity: "caution",
        test: (f) => f.precipProbabilityMax >= 30 && f.precipProbabilityMax < 60,
        reason: pct,
      },
      {
        severity: "caution",
        test: (f) => f.windMax >= 15 && f.windMax <= 25,
        reason: wind,
      },
    ],
  },
  painting: {
    key: "painting",
    label: "Painting",
    blurb: "Needs dry, warm enough to cure",
    rules: [
      { severity: "reschedule", test: (f) => f.precipProbabilityMax >= 50, reason: pct },
      {
        severity: "reschedule",
        test: (f) => f.tempMax < 50,
        reason: (f) => `high of ${Math.round(f.tempMax)}°F — too cold to cure`,
      },
      {
        severity: "caution",
        test: (f) => f.precipProbabilityMax >= 20 && f.precipProbabilityMax < 50,
        reason: pct,
      },
      {
        severity: "caution",
        test: (f) => f.tempMax >= 50 && f.tempMax < 60,
        reason: (f) => `high of ${Math.round(f.tempMax)}°F — slow cure`,
      },
    ],
  },
  concrete: {
    key: "concrete",
    label: "Concrete",
    blurb: "Freeze and heavy rain ruin the pour",
    rules: [
      {
        severity: "reschedule",
        test: (f) => f.tempMin < 35,
        reason: (f) => `${Math.round(f.tempMin)}°F overnight — freeze risk`,
      },
      { severity: "reschedule", test: (f) => f.precipSum > 0.25, reason: inches },
      {
        severity: "caution",
        test: (f) => f.tempMin >= 35 && f.tempMin <= 40,
        reason: (f) => `${Math.round(f.tempMin)}°F overnight — borderline`,
      },
      {
        severity: "caution",
        test: (f) => f.precipProbabilityMax >= 40,
        reason: pct,
      },
    ],
  },
  landscaping: {
    key: "landscaping",
    label: "Landscaping",
    blurb: "Tolerant — only hard rain stops work",
    rules: [
      { severity: "reschedule", test: (f) => f.precipSum > 0.5, reason: inches },
      { severity: "reschedule", test: (f) => f.precipProbabilityMax >= 70, reason: pct },
      {
        severity: "caution",
        test: (f) => f.precipProbabilityMax >= 40 && f.precipProbabilityMax < 70,
        reason: pct,
      },
    ],
  },
  general: {
    key: "general",
    label: "General / Outdoor",
    blurb: "Moderate all-purpose thresholds",
    rules: [
      { severity: "reschedule", test: (f) => f.precipProbabilityMax >= 60, reason: pct },
      {
        severity: "reschedule",
        test: (f) => f.tempMax > 100,
        reason: (f) => `high of ${Math.round(f.tempMax)}°F — heat risk`,
      },
      {
        severity: "reschedule",
        test: (f) => f.tempMin < 32,
        reason: (f) => `${Math.round(f.tempMin)}°F overnight — freezing`,
      },
      {
        severity: "caution",
        test: (f) => f.precipProbabilityMax >= 30 && f.precipProbabilityMax < 60,
        reason: pct,
      },
    ],
  },
};

// Ordered list for dropdowns / iteration.
export const TRADE_LIST: TradeDef[] = Object.values(TRADES);
