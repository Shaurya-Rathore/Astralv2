"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRequestStatus, approveRequest, rejectRequest } from "@/lib/store";
import { canEditRequest, currentUser } from "@/lib/auth";
import type { RequestStatus } from "@/lib/types";

interface RequestStatusActionsProps {
  requestId: string;
  currentStatus: RequestStatus;
}

type ActionDef = { label: string; target: RequestStatus; style: string };

function getActions(status: RequestStatus): ActionDef[] {
  switch (status) {
    case "draft":
      return [
        { label: "Submit for Approval", target: "pending_approval", style: "bg-foreground text-background hover:bg-foreground/90" },
        { label: "Cancel", target: "cancelled", style: "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800" },
      ];
    case "pending_approval":
      return [
        { label: "Approve", target: "approved", style: "bg-emerald-600 text-white hover:bg-emerald-700" },
        { label: "Reject", target: "rejected", style: "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950" },
        { label: "Put On Hold", target: "on_hold", style: "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950" },
      ];
    case "approved":
      return [
        { label: "Mark Filled", target: "filled", style: "bg-violet-600 text-white hover:bg-violet-700" },
        { label: "Put On Hold", target: "on_hold", style: "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950" },
        { label: "Cancel", target: "cancelled", style: "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800" },
      ];
    case "on_hold":
      return [
        { label: "Resume", target: "pending_approval", style: "bg-foreground text-background hover:bg-foreground/90" },
        { label: "Cancel", target: "cancelled", style: "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800" },
      ];
    default:
      return [];
  }
}

const statusLabels: Record<RequestStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  on_hold: "On Hold",
  filled: "Filled",
  cancelled: "Cancelled",
};

const statusBadgeStyle: Record<RequestStatus, string> = {
  draft: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  pending_approval: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  on_hold: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  filled: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  cancelled: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

const inputClass = "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";

const DESTRUCTIVE_TARGETS: RequestStatus[] = ["rejected", "cancelled"];

export function RequestStatusActions({ requestId, currentStatus }: RequestStatusActionsProps) {
  const [done, setDone] = useState<RequestStatus | null>(null);
  const [pendingTarget, setPendingTarget] = useState<RequestStatus | null>(null);
  const [note, setNote] = useState("");
  const router = useRouter();

  const canEdit = canEditRequest();
  if (!canEdit) return null;

  const actions = getActions(done ?? currentStatus);

  if (actions.length === 0) {
    const effective = done ?? currentStatus;
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusBadgeStyle[effective]}`}>
        {statusLabels[effective]}
      </span>
    );
  }

  function executeAction(target: RequestStatus) {
    if (target === "approved") {
      approveRequest(requestId, currentUser.name, currentUser.title, note || undefined);
    } else if (target === "rejected") {
      rejectRequest(requestId, currentUser.name, currentUser.title, note || undefined);
    } else {
      updateRequestStatus(requestId, target);
    }
    setDone(target);
    setPendingTarget(null);
    setNote("");
    router.refresh();
  }

  function handleClick(target: RequestStatus) {
    if (DESTRUCTIVE_TARGETS.includes(target)) {
      setPendingTarget(pendingTarget === target ? null : target);
      setNote("");
    } else {
      executeAction(target);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {done && (
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${statusBadgeStyle[done]}`}>
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="2.5 6 5 8.5 9.5 3.5" />
            </svg>
            {statusLabels[done]}
          </span>
        )}
        {actions.map((a) => (
          <button
            key={a.target}
            onClick={() => handleClick(a.target)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              pendingTarget === a.target ? "ring-2 ring-ring " : ""
            }${a.style}`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {pendingTarget && (
        <div className="rounded-md border border-border-subtle bg-muted/30 p-3">
          <textarea
            className={`${inputClass} min-h-[40px] resize-y mb-2`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={pendingTarget === "rejected" ? "Reason for rejection..." : "Add a note (optional)..."}
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => executeAction(pendingTarget)}
              className={`rounded-md px-3 py-1 text-xs font-medium text-white transition-colors ${
                pendingTarget === "rejected" ? "bg-red-600 hover:bg-red-700" : "bg-zinc-600 hover:bg-zinc-700"
              }`}
            >
              Confirm: {statusLabels[pendingTarget]}
            </button>
            <button
              onClick={() => { setPendingTarget(null); setNote(""); }}
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
