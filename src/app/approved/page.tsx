"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getRequests, getApprovalsByRequest, getCandidatesByRequest } from "@/lib/store";
import type { LinkedInPostStatus } from "@/lib/types";
import { PriorityChip, EmploymentTypeChip, CandidateStatusChip } from "@/components/ui/chips";
import { LinkedInPostChip } from "@/components/ui/placeholder-action";
import { canViewCompensation } from "@/lib/auth";

function formatSalary(min: number, max: number, currency: string) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  return `${fmt(min)} – ${fmt(max)}`;
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

type SortKey = "start_asc" | "start_desc" | "priority" | "pipeline_desc" | "title";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "start_asc", label: "Start Date (Soonest)" },
  { value: "start_desc", label: "Start Date (Latest)" },
  { value: "priority", label: "Priority" },
  { value: "pipeline_desc", label: "Pipeline Size" },
  { value: "title", label: "Title A–Z" },
];
const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const filterSelect = "rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export default function ApprovedRequestsPage() {
  const [teamFilter, setTeamFilter] = useState("all");
  const [postingFilter, setPostingFilter] = useState<LinkedInPostStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("start_asc");

  const allApproved = getRequests("approved");
  const teams = useMemo(() => [...new Set(allApproved.map((r) => r.team))].sort(), [allApproved]);

  const approved = allApproved
    .filter((r) => {
      if (teamFilter !== "all" && r.team !== teamFilter) return false;
      if (postingFilter !== "all" && r.linkedInPostStatus !== postingFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "start_asc": return new Date(a.targetStartDate).getTime() - new Date(b.targetStartDate).getTime();
        case "start_desc": return new Date(b.targetStartDate).getTime() - new Date(a.targetStartDate).getTime();
        case "priority": return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        case "pipeline_desc": return getCandidatesByRequest(b.id).length - getCandidatesByRequest(a.id).length;
        case "title": return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          Approved Requests
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {allApproved.length} approved request{allApproved.length !== 1 ? "s" : ""} ready for sourcing
        </p>

        {/* Filter bar */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select className={filterSelect} value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="all">All Teams</option>
            {teams.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className={filterSelect} value={postingFilter} onChange={(e) => setPostingFilter(e.target.value as LinkedInPostStatus | "all")}>
            <option value="all">All Posting Status</option>
            <option value="posted">Posted</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="not_posted">Not Posted</option>
          </select>
          <select className={`${filterSelect} ml-auto`} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="text-[11px] tabular-nums text-muted-foreground">{approved.length} result{approved.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 px-6 py-5 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {approved.map((req) => {
          const approvals = getApprovalsByRequest(req.id);
          const candidates = getCandidatesByRequest(req.id);
          const activeCandidates = candidates.filter(
            (c) => !["rejected", "withdrawn", "inactive"].includes(c.link.status)
          );

          // Pipeline breakdown
          const pipeline = candidates.reduce<Record<string, number>>((acc, c) => {
            acc[c.link.status] = (acc[c.link.status] || 0) + 1;
            return acc;
          }, {});

          return (
            <Link
              key={req.id}
              href={`/requests/${req.id}`}
              className="group rounded-lg border border-border bg-card transition-all hover:border-foreground/10 hover:shadow-sm"
            >
              {/* Card header */}
              <div className="border-b border-border-subtle px-5 py-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground group-hover:underline">
                      {req.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {req.department} · {req.team}
                    </p>
                  </div>
                  <PriorityChip priority={req.priority} />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <EmploymentTypeChip type={req.employmentType} />
                  <span className="text-[11px] text-muted-foreground">
                    {req.location}{req.remote ? " (Remote)" : ""}
                  </span>
                </div>
              </div>

              {/* Card body — metrics */}
              <div className="px-5 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Headcount
                    </dt>
                    <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                      {req.headcount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Pipeline
                    </dt>
                    <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                      {activeCandidates.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Start In
                    </dt>
                    <dd className={`mt-0.5 text-sm font-semibold ${
                      daysUntil(req.targetStartDate) === "Overdue"
                        ? "text-red-600 dark:text-red-400"
                        : "text-foreground"
                    }`}>
                      {daysUntil(req.targetStartDate)}
                    </dd>
                  </div>
                </div>

                {canViewCompensation() && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {formatSalary(req.salaryMin, req.salaryMax, req.currency)}
                  </div>
                )}
              </div>

              {/* Card footer — candidate pipeline mini-chips */}
              {candidates.length > 0 && (
                <div className="border-t border-border-subtle px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(pipeline).map(([status, count]) => (
                      <span key={status} className="flex items-center gap-1">
                        <CandidateStatusChip status={status as import("@/lib/types").CandidateStatus} />
                        <span className="text-[10px] tabular-nums text-muted-foreground">{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval stamp + LinkedIn */}
              <div className="border-t border-border-subtle px-5 py-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-0.5">
                      {approvals
                        .filter((a) => a.status === "approved")
                        .map((a) => (
                          <div
                            key={a.id}
                            className="h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-card"
                          />
                        ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Approved by{" "}
                      {approvals
                        .filter((a) => a.status === "approved")
                        .map((a) => a.approverName)
                        .join(", ")}
                    </span>
                  </div>
                  <LinkedInPostChip status={req.linkedInPostStatus} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {approved.length === 0 && (
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No approved requests. Requests need full approval before appearing here.
          </p>
        </div>
      )}
    </div>
  );
}
