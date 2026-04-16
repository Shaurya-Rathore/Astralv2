"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCandidateStatus, getNextPipelineStage } from "@/lib/store";
import { currentUser, canUpdateCandidateStatus } from "@/lib/auth";
import type { CandidateStatus } from "@/lib/types";

interface StatusActionBarProps {
  candidateId: string;
  currentStatus: CandidateStatus;
  requestId?: string;
  onStatusChanged?: () => void;
  layout?: "full" | "compact";
}

type ActionType = "advance" | "reject" | "withdraw" | null;

const TERMINAL: CandidateStatus[] = ["hired", "rejected", "withdrawn"];

const statusLabel: Record<string, string> = {
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

const statusBadgeStyle: Record<string, string> = {
  screening: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  interviewing: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  offer: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  hired: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  withdrawn: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const inputClass = "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export function StatusActionBar({
  candidateId,
  currentStatus,
  requestId,
  onStatusChanged,
  layout = "full",
}: StatusActionBarProps) {
  const [action, setAction] = useState<ActionType>(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState<CandidateStatus | null>(null);
  const router = useRouter();

  if (!canUpdateCandidateStatus()) return null;

  const nextStage = getNextPipelineStage(currentStatus);
  const isTerminal = TERMINAL.includes(currentStatus);

  if (done) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${statusBadgeStyle[done] ?? "bg-muted text-muted-foreground"}`}>
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="2.5 6 5 8.5 9.5 3.5" />
        </svg>
        {statusLabel[done] ?? done}
      </span>
    );
  }

  if (isTerminal) {
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusBadgeStyle[currentStatus] ?? "bg-muted text-muted-foreground"}`}>
        {statusLabel[currentStatus]}
      </span>
    );
  }

  if (!nextStage && currentStatus === "inactive") return null;

  function execute(toStatus: CandidateStatus, defaultNote: string) {
    updateCandidateStatus(candidateId, toStatus, currentUser.name, requestId, note || defaultNote);
    setDone(toStatus);
    setAction(null);
    setNote("");
    onStatusChanged?.();
    router.refresh();
  }

  if (layout === "compact") {
    return nextStage ? (
      <button
        onClick={() => execute(nextStage, `Advanced to ${statusLabel[nextStage]}`)}
        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
      >
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="4 2 9 6 4 10" />
        </svg>
        {statusLabel[nextStage]}
      </button>
    ) : null;
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        {nextStage && (
          <button
            onClick={() => setAction(action === "advance" ? null : "advance")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              action === "advance"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            }`}
          >
            Move to {statusLabel[nextStage]}
          </button>
        )}
        <button
          onClick={() => setAction(action === "reject" ? null : "reject")}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            action === "reject"
              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              : "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          }`}
        >
          Reject
        </button>
        <button
          onClick={() => setAction(action === "withdraw" ? null : "withdraw")}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            action === "withdraw"
              ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          Mark Withdrawn
        </button>
      </div>

      {action && (
        <div className="rounded-md border border-border-subtle bg-muted/30 p-3">
          <textarea
            className={`${inputClass} min-h-[40px] resize-y mb-2`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              action === "advance" ? `Note for advancing to ${statusLabel[nextStage!]}...` :
              action === "reject" ? "Reason for rejection..." :
              "Withdrawal context..."
            }
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (action === "advance" && nextStage) execute(nextStage, `Advanced to ${statusLabel[nextStage]}`);
                else if (action === "reject") execute("rejected", "Candidate rejected");
                else if (action === "withdraw") execute("withdrawn", "Candidate withdrawn");
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium text-white transition-colors ${
                action === "reject" ? "bg-red-600 hover:bg-red-700" :
                action === "withdraw" ? "bg-zinc-600 hover:bg-zinc-700" :
                "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {action === "advance" ? `Confirm: ${statusLabel[nextStage!]}` :
               action === "reject" ? "Confirm Rejection" :
               "Confirm Withdrawal"}
            </button>
            <button
              onClick={() => { setAction(null); setNote(""); }}
              className="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
