// Local-time date helpers. We deliberately avoid Date.toISOString() for calendar
// dates: it converts to UTC, so for users in a negative-UTC timezone an evening
// "today" rolls forward to tomorrow — which shifts displayed dates and (worse)
// made the date picker's min reject the real today. These format from the local
// calendar instead, so "today" is actually today wherever the user is.

export function toLocalIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// YYYY-MM-DD for today + `days` (days may be 0 or negative).
export function isoFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toLocalIso(d);
}
