"use client";

import { useEffect, useRef, useState } from "react";
import AddJobForm from "@/components/AddJobForm";
import JobRow from "@/components/JobRow";
import type { Job, JobState } from "@/lib/types";
import { useJobs } from "@/lib/useJobs";
import { evaluateForecast } from "@/lib/verdict";
import { fetchForecast, geocode } from "@/lib/weather";

export default function Home() {
  const { jobs, loaded, addJob, updateJob, removeJob, resetToSeed } = useJobs();

  // Per-job async outcome (forecast / error / out-of-range), keyed by job id.
  const [states, setStates] = useState<Record<string, JobState>>({});
  // Tracks which (location+date) signature we've already resolved for each job,
  // so the resolver doesn't refetch on every render. Bumping `retryTick` forces a
  // re-run for a job whose signature we cleared (the retry button).
  const processed = useRef<Record<string, string>>({});
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!loaded) return;

    jobs.forEach(async (job) => {
      const signature = `${job.location}|${job.date}`;
      if (processed.current[job.id] === signature) return;
      processed.current[job.id] = signature;

      setStates((s) => ({ ...s, [job.id]: { status: "loading" } }));

      try {
        let coords = job.coords;
        if (!coords) {
          const resolved = await geocode(job.location);
          if (!resolved) {
            setStates((s) => ({ ...s, [job.id]: { status: "not-found" } }));
            return;
          }
          coords = resolved;
          updateJob(job.id, { coords }); // cache so we don't re-geocode
        }

        const days = await fetchForecast(coords.lat, coords.lon);
        const row = days.find((d) => d.date === job.date);
        if (!row) {
          // Outside the forecast window: before today, or past the ~16-day horizon.
          const first = days[0]?.date ?? job.date;
          const status = job.date < first ? "past" : "too-far";
          setStates((s) => ({ ...s, [job.id]: { status } }));
          return;
        }

        setStates((s) => ({
          ...s,
          [job.id]: { status: "ready", forecast: row },
        }));
      } catch {
        processed.current[job.id] = ""; // allow a retry
        setStates((s) => ({ ...s, [job.id]: { status: "error" } }));
      }
    });
    // updateJob/addJob are stable (useCallback); retryTick forces re-resolution.
  }, [jobs, loaded, retryTick, updateJob]);

  function handleRetry(id: string) {
    processed.current[id] = "";
    setStates((s) => ({ ...s, [id]: { status: "loading" } }));
    setRetryTick((t) => t + 1);
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            CrewCast
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Weather-aware scheduling for trade crews. Each job gets a go/no-go
            call tuned to its trade — not just a forecast.
          </p>
        </header>

        <section className="mb-6">
          <AddJobForm onAdd={addJob} />
        </section>

        <Summary jobs={jobs} states={states} loaded={loaded} />

        <section>
          {!loaded ? (
            <p className="py-10 text-center text-sm text-zinc-400">Loading…</p>
          ) : jobs.length === 0 ? (
            <EmptyState onReset={resetToSeed} />
          ) : (
            <ul className="flex flex-col gap-3">
              {jobs.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  state={states[job.id]}
                  onDelete={removeJob}
                  onRetry={handleRetry}
                />
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-10 text-center text-xs text-zinc-400 dark:text-zinc-600">
          Forecasts by Open-Meteo. Jobs are saved in this browser only.
        </footer>
      </main>
    </div>
  );
}

function Summary({
  jobs,
  states,
  loaded,
}: {
  jobs: Job[];
  states: Record<string, JobState>;
  loaded: boolean;
}) {
  if (!loaded || jobs.length === 0) return null;

  let reschedule = 0;
  let caution = 0;
  let pending = 0;
  for (const job of jobs) {
    const s = states[job.id];
    if (!s || s.status === "loading") {
      pending++;
    } else if (s.status === "ready" && s.forecast) {
      const { verdict } = evaluateForecast(s.forecast, job.trade);
      if (verdict === "reschedule") reschedule++;
      else if (verdict === "caution") caution++;
    }
  }

  const parts = [`${jobs.length} job${jobs.length === 1 ? "" : "s"} scheduled`];
  if (reschedule > 0) parts.push(`${reschedule} to reschedule`);
  if (caution > 0) parts.push(`${caution} to watch`);
  if (pending > 0) parts.push(`${pending} checking…`);

  return (
    <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
      {parts.join(" · ")}
    </p>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700">
      <p className="text-zinc-500 dark:text-zinc-400">
        No jobs yet. Add one above to get a weather verdict.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-3 text-sm font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
      >
        Load sample jobs
      </button>
    </div>
  );
}
