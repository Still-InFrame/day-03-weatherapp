import { TRADES } from "@/lib/trades";
import type { Job, JobState } from "@/lib/types";
import { evaluateForecast } from "@/lib/verdict";
import { describeWeather } from "@/lib/weather";
import VerdictBadge from "./VerdictBadge";

// Render a YYYY-MM-DD as "Wed, Jun 5". Parse at local midnight to avoid the
// off-by-one a bare `new Date("2026-06-05")` (UTC) can cause.
function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface Props {
  job: Job;
  state: JobState | undefined;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
}

export default function JobRow({ job, state, onDelete, onRetry }: Props) {
  const trade = TRADES[job.trade];
  const status = state?.status ?? "loading";

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: job identity */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
            {job.name}
          </h3>
          <span className="shrink-0 rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {trade.label}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
          {job.coords?.label ?? job.location} &middot; {formatDate(job.date)}
        </p>
      </div>

      {/* Right: weather + verdict, varying by async state */}
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <Outcome job={job} state={state} status={status} onRetry={onRetry} />
        <button
          type="button"
          onClick={() => onDelete(job.id)}
          aria-label={`Delete ${job.name}`}
          className="shrink-0 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </li>
  );
}

function Outcome({
  job,
  state,
  status,
  onRetry,
}: {
  job: Job;
  state: JobState | undefined;
  status: JobState["status"];
  onRetry: (id: string) => void;
}) {
  if (status === "loading") {
    return (
      <span className="text-sm text-zinc-400 dark:text-zinc-500">
        Checking forecast…
      </span>
    );
  }

  if (status === "not-found") {
    return (
      <span className="text-sm text-rose-600 dark:text-rose-400">
        Location not found
      </span>
    );
  }

  if (status === "too-far") {
    return (
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Too far out to forecast
      </span>
    );
  }

  if (status === "past") {
    return (
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        Date has passed
      </span>
    );
  }

  if (status === "error" || !state?.forecast) {
    return (
      <button
        type="button"
        onClick={() => onRetry(job.id)}
        className="text-sm font-medium text-rose-600 underline-offset-2 hover:underline dark:text-rose-400"
      >
        Couldn&apos;t load — retry
      </button>
    );
  }

  const forecast = state.forecast;
  const { verdict, reason } = evaluateForecast(forecast, job.trade);
  const weather = describeWeather(forecast.weatherCode);

  return (
    <div className="flex items-center gap-3 text-right">
      <div className="hidden text-sm text-zinc-500 dark:text-zinc-400 sm:block">
        <span className="mr-1">{weather.icon}</span>
        {Math.round(forecast.tempMax)}° / {Math.round(forecast.tempMin)}°
      </div>
      <div className="flex flex-col items-end gap-1">
        <VerdictBadge verdict={verdict} />
        <span className="max-w-[12rem] truncate text-xs text-zinc-500 dark:text-zinc-400">
          {reason}
        </span>
      </div>
    </div>
  );
}
