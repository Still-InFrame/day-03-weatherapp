import { useState } from "react";
import { isoFromToday } from "@/lib/dates";
import { TRADE_LIST } from "@/lib/trades";
import type { Job, TradeKey } from "@/lib/types";

export default function AddJobForm({
  onAdd,
}: {
  onAdd: (job: Omit<Job, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(isoFromToday(0)); // default to today
  const [trade, setTrade] = useState<TradeKey>("roofing");

  const canSubmit = name.trim() && location.trim() && date;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd({ name: name.trim(), location: location.trim(), date, trade });
    // Reset for the next entry, keeping the trade selection (crews often batch).
    setName("");
    setLocation("");
    setDate(isoFromToday(0));
  }

  const fieldClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
  const labelClass =
    "mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <label className={labelClass} htmlFor="job-name">
            Job
          </label>
          <input
            id="job-name"
            className={fieldClass}
            placeholder="Maple St. re-roof"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="lg:col-span-1">
          <label className={labelClass} htmlFor="job-location">
            Location
          </label>
          <input
            id="job-location"
            className={fieldClass}
            placeholder="Austin, TX"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="job-date">
            Date
          </label>
          <input
            id="job-date"
            type="date"
            min={isoFromToday(0)}
            className={fieldClass}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="job-trade">
            Trade
          </label>
          <select
            id="job-trade"
            className={fieldClass}
            value={trade}
            onChange={(e) => setTrade(e.target.value as TradeKey)}
          >
            {TRADE_LIST.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {TRADE_LIST.find((t) => t.key === trade)?.blurb}
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Add job
        </button>
      </div>
    </form>
  );
}
