// localStorage-backed job list. This is the app's only persistence — no DB, no
// server. SSR-safe: starts empty on the server and during the first client render,
// then hydrates from storage in an effect, so server and client markup match.

import { useCallback, useEffect, useState } from "react";
import { seedJobs } from "./seed";
import type { Job } from "./types";

const STORAGE_KEY = "crewcast.jobs.v1";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Hydrate once on mount. Seed when there's nothing stored yet.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setJobs(JSON.parse(raw) as Job[]);
      } else {
        setJobs(seedJobs());
      }
    } catch {
      setJobs(seedJobs());
    }
    setLoaded(true);
  }, []);

  // Persist on every change, but only after the initial hydrate so we never
  // overwrite stored jobs with the empty starting state.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch {
      // Storage full / disabled — non-fatal; the app still works in-memory.
    }
  }, [jobs, loaded]);

  const addJob = useCallback((job: Omit<Job, "id">) => {
    setJobs((prev) => [...prev, { ...job, id: crypto.randomUUID() }]);
  }, []);

  const updateJob = useCallback((id: string, patch: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...patch } : j)),
    );
  }, []);

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const resetToSeed = useCallback(() => {
    setJobs(seedJobs());
  }, []);

  return { jobs, loaded, addJob, updateJob, removeJob, resetToSeed };
}
