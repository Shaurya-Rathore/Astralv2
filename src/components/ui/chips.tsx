import type { RequestStatus, RequestPriority, EmploymentType, CandidateStatus, CandidateMatchStrength, ReactivationLabel } from "@/lib/types";

// ─── Status Chip ─────────────────────────────────────────────────────────────

const requestStatusStyles: Record<RequestStatus, string> = {
  draft: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  pending_approval: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  on_hold: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  filled: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  cancelled: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

const requestStatusLabels: Record<RequestStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  on_hold: "On Hold",
  filled: "Filled",
  cancelled: "Cancelled",
};

export function RequestStatusChip({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${requestStatusStyles[status]}`}
    >
      {requestStatusLabels[status]}
    </span>
  );
}

// ─── Priority Chip ───────────────────────────────────────────────────────────

const priorityStyles: Record<RequestPriority, string> = {
  critical: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-400 dark:ring-red-800",
  high: "bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:ring-orange-800",
  medium: "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:ring-sky-800",
  low: "bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-700",
};

const priorityLabels: Record<RequestPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function PriorityChip({ priority }: { priority: RequestPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${priorityStyles[priority]}`}
    >
      {priorityLabels[priority]}
    </span>
  );
}

// ─── Employment Type Chip ────────────────────────────────────────────────────

const employmentStyles: Record<EmploymentType, string> = {
  full_time: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  part_time: "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
  contract: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  intern: "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
};

const employmentLabels: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export function EmploymentTypeChip({ type }: { type: EmploymentType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${employmentStyles[type]}`}
    >
      {employmentLabels[type]}
    </span>
  );
}

// ─── Candidate Status Chip ───────────────────────────────────────────────────

const candidateStatusStyles: Record<CandidateStatus, string> = {
  new: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  screening: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  interviewing: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  offer: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  hired: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  withdrawn: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  inactive: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
  reactivated: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
};

const candidateStatusLabels: Record<CandidateStatus, string> = {
  new: "New",
  screening: "Screening",
  interviewing: "Interviewing",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  inactive: "Inactive",
  reactivated: "Reactivated",
};

export function CandidateStatusChip({ status }: { status: CandidateStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${candidateStatusStyles[status]}`}
    >
      {candidateStatusLabels[status]}
    </span>
  );
}

// ─── Match Strength Chip ─────────────────────────────────────────────────────

const matchStyles: Record<CandidateMatchStrength, string> = {
  strong: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  moderate: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  weak: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

export function MatchStrengthChip({ strength }: { strength: CandidateMatchStrength }) {
  return (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${matchStyles[strength]}`}>
      {strength}
    </span>
  );
}

// ─── Reactivation Label Chip ─────────────────────────────────────────────────

const reactivationStyles: Record<ReactivationLabel, string> = {
  "Strong Prior Interview": "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  "Silver Medalist": "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
  "Final Round Previously": "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  "Rejected for Timing": "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
};

export function ReactivationLabelChip({ label }: { label: ReactivationLabel }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${reactivationStyles[label]}`}>
      {label}
    </span>
  );
}

// ─── Score Bar ───────────────────────────────────────────────────────────────

export function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const color =
    score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-foreground">{score}</span>
    </div>
  );
}
