// Open-Meteo client. No API key, CORS-friendly, so these run straight from the
// browser — there's no server in this app. Two endpoints: geocoding (text → coords)
// and forecast (coords → daily rows).

import type { Coords, DailyForecast } from "./types";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// Resolve a free-text place to coordinates. Returns null when nothing matches.
// Open-Meteo's geocoder matches on city name and returns nothing for a "City, ST"
// string, but that's how people type locations — so we fall back to the part
// before the first comma (the city) when the full string misses. The resolved
// result still carries the state/country, so the displayed label confirms the pick.
// Limitation: it can't disambiguate same-named cities by state (see Open threads).
export async function geocode(query: string): Promise<Coords | null> {
  const full = query.trim();
  const city = full.split(",")[0].trim();
  const candidates = city && city !== full ? [full, city] : [full];

  for (const name of candidates) {
    const hit = await searchPlace(name);
    if (hit) return hit;
  }
  return null;
}

async function searchPlace(name: string): Promise<Coords | null> {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(
    name,
  )}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`geocode failed: ${res.status}`);
  const data = await res.json();
  const hit = data?.results?.[0];
  if (!hit) return null;
  const label = [hit.name, hit.admin1, hit.country_code]
    .filter(Boolean)
    .join(", ");
  return { lat: hit.latitude, lon: hit.longitude, label };
}

// Cache forecasts per rounded coordinate for the session so several jobs in the
// same city share one network call.
const forecastCache = new Map<string, Promise<DailyForecast[]>>();
const cacheKey = (lat: number, lon: number) =>
  `${lat.toFixed(2)},${lon.toFixed(2)}`;

export function fetchForecast(
  lat: number,
  lon: number,
): Promise<DailyForecast[]> {
  const key = cacheKey(lat, lon);
  const cached = forecastCache.get(key);
  if (cached) return cached;

  const promise = requestForecast(lat, lon).catch((err) => {
    // Don't cache failures — let the next attempt retry.
    forecastCache.delete(key);
    throw err;
  });
  forecastCache.set(key, promise);
  return promise;
}

async function requestForecast(
  lat: number,
  lon: number,
): Promise<DailyForecast[]> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily:
      "weather_code,precipitation_probability_max,precipitation_sum,temperature_2m_max,temperature_2m_min,wind_speed_10m_max",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
    forecast_days: "16",
  });
  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`forecast failed: ${res.status}`);
  const data = await res.json();
  const d = data?.daily;
  if (!d?.time) throw new Error("forecast response missing daily data");

  // Open-Meteo returns parallel arrays; zip them into one object per day.
  return d.time.map((date: string, i: number) => ({
    date,
    weatherCode: d.weather_code[i],
    precipProbabilityMax: d.precipitation_probability_max[i] ?? 0,
    precipSum: d.precipitation_sum[i] ?? 0,
    tempMax: d.temperature_2m_max[i],
    tempMin: d.temperature_2m_min[i],
    windMax: d.wind_speed_10m_max[i],
  }));
}

// Map a WMO weather code to a short label + emoji for the row summary.
// Grouped by range; exact codes per the Open-Meteo docs.
export function describeWeather(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀️", label: "Clear" };
  if (code <= 2) return { icon: "🌤️", label: "Mostly clear" };
  if (code === 3) return { icon: "☁️", label: "Overcast" };
  if (code <= 48) return { icon: "🌫️", label: "Fog" };
  if (code <= 57) return { icon: "🌧️", label: "Drizzle" };
  if (code <= 67) return { icon: "🌧️", label: "Rain" };
  if (code <= 77) return { icon: "🌨️", label: "Snow" };
  if (code <= 82) return { icon: "🌧️", label: "Showers" };
  if (code <= 86) return { icon: "🌨️", label: "Snow showers" };
  if (code <= 99) return { icon: "⛈️", label: "Thunderstorm" };
  return { icon: "🌡️", label: "—" };
}
