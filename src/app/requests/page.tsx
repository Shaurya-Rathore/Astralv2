"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getRequests, getApprovalsByRequest, getCandidatesByRequest } from "@/lib/store";
import type { RequestStatus } from "@/lib/types";
import { RequestStatusChip, PriorityChip, EmploymentTypeChip } from "@/components/ui/chips";
import { canEditRequest } from "@/lib/auth";

const statusTabs: { label: string; value: RequestStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending_approval" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Draft", value: "draft" },
  { label: "On Hold", value: "on_hold" },
  { label: "Filled", value: "filled" },
  { label: "Cancelled", value: "cancelled" },
];

function formatSalary(min: number, max: number, currency: string) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  return `${fmt(min)} – ${fmt(max)}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

type SortKey = "created_desc" | "created_asc" | "updated_desc" | "priority" | "title";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "created_desc", label: "Newest" },
  { value: "created_asc", label: "Oldest" },
  { value: "updated_desc", label: "Recently Updated" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title A–Z" },
];
const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const filterSelect = "rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<RequestStatus | "all">("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [hmFilter, setHmFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("created_desc");

  const showEdit = canEditRequest();
  const allRequests = getRequests();

  const teams = useMemo(() => [...new Set(allRequests.map((r) => r.team))].sort(), [allRequests]);
  const hms = useMemo(() => [...new Set(allRequests.map((r) => r.hiringManagerName))].sort(), [allRequests]);

  const filtered = allRequests
    .filter((r) => {
      if (activeTab !== "all" && r.status !== activeTab) return false;
      if (teamFilter !== "all" && r.team !== teamFilter) return false;
      if (hmFilter !== "all" && r.hiringManagerName !== hmFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "created_desc": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "created_asc": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "updated_desc": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "priority": return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        case "title": return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

  // Counts for tabs
  const counts = allRequests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              Hiring Requests
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {allRequests.length} requests across all departments
            </p>
          </div>
          {showEdit && (
            <Link
              href="/requests/new"
              className="rounded-md bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
            >
              + New Request
            </Link>
          )}
        </div>

        {/* Filter tabs */}
        <div className="mt-4 flex gap-1">
          {statusTabs.map((tab) => {
            const count =
              tab.value === "all"
                ? allRequests.length
                : counts[tab.value] || 0;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
                <span
                  className={`tabular-nums ${
                    isActive ? "opacity-70" : "opacity-50"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select className={filterSelect} value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="all">All Teams</option>
            {teams.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className={filterSelect} value={hmFilter} onChange={(e) => setHmFilter(e.target.value)}>
            <option value="all">All Hiring Managers</option>
            {hms.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <select className={`${filterSelect} ml-auto`} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="text-[11px] tabular-nums text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-muted/50">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Request
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Department
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Priority
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Approval
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Candidates
                </th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((req) => {
                const approvals = getApprovalsByRequest(req.id);
                const approvedCount = approvals.filter((a) => a.status === "approved").length;
                const candidates = getCandidatesByRequest(req.id);

                return (
                  <tr
                    key={req.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/requests/${req.id}`}
                        className="block"
                      >
                        <span className="text-sm font-medium text-foreground group-hover:underline">
                          {req.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {req.hiringManagerName} · {req.location}
                          {req.remote && " (Remote)"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground">{req.department}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">{req.team}</span>
                    </td>
                    <td className="px-4 py-3">
                      <EmploymentTypeChip type={req.employmentType} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityChip priority={req.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <RequestStatusChip status={req.status} />
                    </td>
                    <td className="px-4 py-3">
                      {approvals.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-0.5">
                            {approvals.map((a) => (
                              <div
                                key={a.id}
                                className={`h-2 w-2 rounded-full ring-1 ring-card ${
                                  a.status === "approved"
                                    ? "bg-emerald-500"
                                    : a.status === "rejected"
                                      ? "bg-red-500"
                                      : "bg-amber-400"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {approvedCount}/{approvals.length}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs tabular-nums text-foreground">
                        {candidates.length}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {" "}/ {req.headcount} HC
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(req.createdAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No requests match this filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
