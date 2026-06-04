// Core domain types for CrewCast. A "job" is a scheduled piece of trade work at a
// location on a date; the app's value is turning a forecast into a per-trade verdict.

export type TradeKey =
  | "roofing"
  | "painting"
  | "concrete"
  | "landscaping"
  | "general";

// A verdict is the decision the app exists to produce, not just raw weather.
export type Verdict = "go" | "caution" | "reschedule";

export interface Coords {
  lat: number;
  lon: number;
  label: string; // human-readable resolved place, e.g. "Austin, Texas, US"
}

export interface Job {
  id: string;
  name: string;
  location: string; // user-entered text, e.g. "Austin, TX"
  date: string; // ISO calendar date, YYYY-MM-DD
  trade: TradeKey;
  coords?: Coords; // cached geocode result so we don't re-resolve every render
}

// One day's forecast, normalized out of Open-Meteo's parallel-array response.
export interface DailyForecast {
  date: string; // YYYY-MM-DD
  weatherCode: number; // WMO code
  precipProbabilityMax: number; // %
  precipSum: number; // inches
  tempMax: number; // °F
  tempMin: number; // °F
  windMax: number; // mph
}

export interface VerdictResult {
  verdict: Verdict;
  reason: string;
}

// Per-job async lifecycle, owned by the dashboard and rendered by each row.
export type JobStatus =
  | "loading"
  | "ready"
  | "too-far" // beyond Open-Meteo's ~16-day horizon
  | "past" // date already gone
  | "not-found" // geocode returned nothing
  | "error"; // network/fetch failure (retryable)

export interface JobState {
  status: JobStatus;
  forecast?: DailyForecast;
}
