import type { Verdict } from "@/lib/types";

const STYLES: Record<Verdict, { label: string; className: string }> = {
  go: {
    label: "Go",
    className:
      "bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  },
  caution: {
    label: "Caution",
    className:
      "bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20",
  },
  reschedule: {
    label: "Reschedule",
    className:
      "bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/20",
  },
};

export default function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const { label, className } = STYLES[verdict];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}
