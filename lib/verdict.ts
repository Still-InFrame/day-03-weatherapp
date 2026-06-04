// Turns a day's forecast into a Go / Caution / Reschedule verdict for a given trade
// by running that trade's rules (defined in trades.ts). Pure and synchronous.

import { TRADES } from "./trades";
import type { DailyForecast, TradeKey, VerdictResult } from "./types";

export function evaluateForecast(
  forecast: DailyForecast,
  trade: TradeKey,
): VerdictResult {
  const def = TRADES[trade];
  const fired = def.rules.filter((r) => r.test(forecast));

  // Worst severity wins. Collect every reason at that severity so the foreman sees
  // all the reasons it's a no-go (e.g. "70% rain, 28 mph wind"), not just the first.
  const reschedule = fired.filter((r) => r.severity === "reschedule");
  const caution = fired.filter((r) => r.severity === "caution");

  if (reschedule.length > 0) {
    return {
      verdict: "reschedule",
      reason: reschedule.map((r) => r.reason(forecast)).join(", "),
    };
  }
  if (caution.length > 0) {
    return {
      verdict: "caution",
      reason: caution.map((r) => r.reason(forecast)).join(", "),
    };
  }

  // No rule fired — good conditions. Give a short positive summary.
  return {
    verdict: "go",
    reason: `${Math.round(forecast.tempMax)}°F, ${Math.round(
      forecast.precipProbabilityMax,
    )}% rain`,
  };
}
