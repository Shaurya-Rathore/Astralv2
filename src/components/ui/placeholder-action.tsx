/**
 * A clearly-labeled placeholder for features that are wired
 * in the data model but not yet fully implemented.
 *
 * Per CLAUDE.md: "If a feature is not fully implemented,
 * make the UI label it clearly as demo behavior."
 */

import type { LinkedInPostStatus, SchedulingStatus } from "@/lib/types";

// ─── LinkedIn Post Status ────────────────────────────────────────────────────

const linkedInStyles: Record<LinkedInPostStatus, { bg: string; label: string }> = {
  not_posted: { bg: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500", label: "Not Posted" },
  draft: { bg: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400", label: "Draft" },
  scheduled: { bg: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400", label: "Scheduled" },
  posted: { bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", label: "Posted" },
};

export function LinkedInPostChip({ status }: { status: LinkedInPostStatus }) {
  const { bg, label } = linkedInStyles[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${bg}`}>
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
      {label}
    </span>
  );
}

export function LinkedInPostAction({ status }: { status: LinkedInPostStatus }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-dashed border-border p-3">
      <div className="flex items-center gap-2">
        <LinkedInPostChip status={status} />
        <span className="text-xs text-muted-foreground">LinkedIn Job Post</span>
      </div>
      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
        Coming Soon
      </span>
    </div>
  );
}

// ─── Scheduling Status ───────────────────────────────────────────────────────

const schedulingStyles: Record<SchedulingStatus, { bg: string; label: string }> = {
  not_started: { bg: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500", label: "Not Started" },
  in_progress: { bg: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400", label: "Scheduling" },
  confirmed: { bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", label: "Confirmed" },
  needs_reschedule: { bg: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400", label: "Needs Reschedule" },
};

export function SchedulingStatusChip({ status }: { status: SchedulingStatus }) {
  const { bg, label } = schedulingStyles[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${bg}`}>
      {label}
    </span>
  );
}

export function SchedulingPlaceholder({
  status,
  notes,
}: {
  status: SchedulingStatus;
  notes: string | null;
}) {
  return (
    <div className="rounded-md border border-dashed border-border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SchedulingStatusChip status={status} />
          <span className="text-xs text-muted-foreground">Interview Scheduling</span>
        </div>
        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Coming Soon
        </span>
      </div>
      {notes && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {notes}
        </p>
      )}
    </div>
  );
}
