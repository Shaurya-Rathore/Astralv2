import type { RequestApproval } from "@/lib/types";

const statusIcon: Record<RequestApproval["status"], { bg: string; icon: string }> = {
  approved: { bg: "bg-emerald-500", icon: "check" },
  rejected: { bg: "bg-red-500", icon: "x" },
  pending: { bg: "bg-amber-400", icon: "clock" },
};

export function ApprovalProgress({ approvals }: { approvals: RequestApproval[] }) {
  if (approvals.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No approvals required</p>
    );
  }

  const approved = approvals.filter((a) => a.status === "approved").length;
  const rejected = approvals.some((a) => a.status === "rejected");
  const total = approvals.length;

  return (
    <div className="space-y-2.5">
      {/* Summary line */}
      <div className="flex items-center gap-2">
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${rejected ? "bg-red-500" : "bg-emerald-500"}`}
            style={{ width: `${(approved / total) * 100}%` }}
          />
        </div>
        <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
          {approved}/{total}
        </span>
      </div>

      {/* Individual approvers */}
      <div className="space-y-1.5">
        {approvals.map((a) => {
          const { bg, icon } = statusIcon[a.status];
          return (
            <div key={a.id} className="flex items-start gap-2">
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${bg}`}
              >
                {icon === "check" && (
                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2.5 6 5 8.5 9.5 3.5" />
                  </svg>
                )}
                {icon === "x" && (
                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="3" x2="9" y2="9" />
                    <line x1="9" y1="3" x2="3" y2="9" />
                  </svg>
                )}
                {icon === "clock" && (
                  <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="6" cy="6" r="4" />
                    <polyline points="6 4 6 6 7.5 7" />
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-medium text-foreground">
                    {a.approverName}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {a.approverRole}
                  </span>
                </div>
                {a.comment && (
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {a.comment}
                  </p>
                )}
                {a.decidedAt && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                    {new Date(a.decidedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
