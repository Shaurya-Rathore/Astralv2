"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getCandidatesEnriched, getRequests, getRequestOptions } from "@/lib/store";
import type { CandidateStatus } from "@/lib/types";
import { CandidateStatusChip, MatchStrengthChip, ScoreBar } from "@/components/ui/chips";
import { StatusActionBar } from "@/components/status-action-bar";
import { currentUser } from "@/lib/auth";

const PIPELINE_STATUSES: CandidateStatus[] = ["new", "screening", "interviewing", "offer", "reactivated"];

type SortKey = "newest" | "oldest" | "highest_combined" | "highest_resume" | "highest_interview" | "name";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Most Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "highest_combined", label: "Highest Combined" },
  { value: "highest_resume", label: "Highest Resume Score" },
  { value: "highest_interview", label: "Highest Interview Score" },
  { value: "name", label: "Name A–Z" },
];

const selectClass = "rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

/** Extract per-request scores for a candidate's primary link */
function getScoresForLink(
  scores: { candidateId: string; requestId: string; category: string; score: number }[],
  requestId: string,
) {
  const forReq = scores.filter((s) => s.requestId === requestId);
  const resume = forReq.find((s) => s.category === "resume")?.score ?? null;
  const interview = forReq.find((s) => s.category === "interview")?.score ?? null;
  const combined = forReq.find((s) => s.category === "combined")?.score
    ?? (resume !== null && interview !== null ? Math.round(resume * 0.4 + interview * 0.6) : null);
  return { resume, interview, combined };
}

export default function PipelinePage() {
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | "all">("all");
  const [requestFilter, setRequestFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [scoreMin, setScoreMin] = useState(0);
  const [resumeOnly, setResumeOnly] = useState(false);
  const [reactivatedOnly, setReactivatedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [, setRefresh] = useState(0);

  const allCandidates = getCandidatesEnriched();
  const allRequestOptions = getRequestOptions();
  const approvedRequestIds = new Set(getRequests("approved").map((r) => r.id));

  // Only approved-request options in filter dropdown
  const requestOptions = allRequestOptions.filter((r) => approvedRequestIds.has(r.id));

  // Candidates linked to at least one approved request, in pipeline statuses
  const pipelineCandidates = useMemo(
    () =>
      allCandidates.filter(
        (c) =>
          PIPELINE_STATUSES.includes(c.status) &&
          c.links.some((l) => approvedRequestIds.has(l.requestId)),
      ),
    [allCandidates, approvedRequestIds],
  );

  const sources = useMemo(
    () => [...new Set(pipelineCandidates.map((c) => c.source))].sort(),
    [pipelineCandidates],
  );

  const stageCounts = pipelineCandidates.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  // Compute per-row scores once, keyed by candidate id
  const rowScores = useMemo(() => {
    const map: Record<string, { resume: number | null; interview: number | null; combined: number | null }> = {};
    for (const c of pipelineCandidates) {
      const approvedLink = requestFilter !== "all"
        ? c.links.find((l) => l.requestId === requestFilter)
        : c.links.find((l) => approvedRequestIds.has(l.requestId));
      if (approvedLink) {
        map[c.id] = getScoresForLink(c.scores, approvedLink.requestId);
      } else {
        map[c.id] = { resume: null, interview: null, combined: c.bestCombinedScore };
      }
    }
    return map;
  }, [pipelineCandidates, requestFilter, approvedRequestIds]);

  const filtered = pipelineCandidates
    .filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (requestFilter !== "all" && !c.links.some((l) => l.requestId === requestFilter)) return false;
      if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
      const cs = rowScores[c.id]?.combined;
      if (scoreMin > 0 && (cs === null || cs === undefined || cs < scoreMin)) return false;
      if (resumeOnly && !c.hasResume) return false;
      if (reactivatedOnly && c.status !== "reactivated") return false;
      return true;
    })
    .sort((a, b) => {
      const sa = rowScores[a.id];
      const sb = rowScores[b.id];
      switch (sortBy) {
        case "newest": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "oldest": return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "highest_combined": return (sb?.combined ?? -1) - (sa?.combined ?? -1);
        case "highest_resume": return (sb?.resume ?? -1) - (sa?.resume ?? -1);
        case "highest_interview": return (sb?.interview ?? -1) - (sa?.interview ?? -1);
        case "name": return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
        default: return 0;
      }
    });

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-card px-6 py-5">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          Applicants / Pipeline
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {pipelineCandidates.length} active candidates linked to approved requests
        </p>

        {/* Stage tabs */}
        <div className="mt-4 flex gap-1">
          <button onClick={() => setStatusFilter("all")} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${statusFilter === "all" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            All <span className={`tabular-nums ${statusFilter === "all" ? "opacity-70" : "opacity-50"}`}>{pipelineCandidates.length}</span>
          </button>
          {PIPELINE_STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${statusFilter === s ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)} <span className={`tabular-nums ${statusFilter === s ? "opacity-70" : "opacity-50"}`}>{stageCounts[s] || 0}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select className={selectClass} value={requestFilter} onChange={(e) => setRequestFilter(e.target.value)}>
            <option value="all">All Approved Requests</option>
            {requestOptions.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
          <select className={selectClass} value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="all">All Sources</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-muted-foreground">Min Score</label>
            <input type="number" min={0} max={100} className="w-16 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring" value={scoreMin || ""} onChange={(e) => setScoreMin(parseInt(e.target.value, 10) || 0)} placeholder="0" />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-foreground">
            <input type="checkbox" checked={resumeOnly} onChange={(e) => setResumeOnly(e.target.checked)} className="h-3.5 w-3.5 rounded border-border" /> Resume
          </label>
          <label className="flex items-center gap-1.5 text-xs text-foreground">
            <input type="checkbox" checked={reactivatedOnly} onChange={(e) => setReactivatedOnly(e.target.checked)} className="h-3.5 w-3.5 rounded border-border" /> Reactivated
          </label>
          <select className={`${selectClass} ml-auto`} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="text-[11px] tabular-nums text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-muted/50">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Candidate</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Stage</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Request</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Source</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Resume</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Interview</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Combined</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">CV</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Owner</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Updated</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((c) => {
                const approvedLink = requestFilter !== "all"
                  ? c.links.find((l) => l.requestId === requestFilter) ?? c.links.find((l) => approvedRequestIds.has(l.requestId))
                  : c.links.find((l) => approvedRequestIds.has(l.requestId));
                const scores = rowScores[c.id] ?? { resume: null, interview: null, combined: null };

                return (
                  <tr key={c.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/candidates/${c.id}`} className="block">
                        <span className="text-sm font-medium text-foreground group-hover:underline">{c.firstName} {c.lastName}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{c.currentTitle}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3"><CandidateStatusChip status={c.status} /></td>
                    <td className="px-4 py-3">
                      {approvedLink ? (
                        <div className="flex items-center gap-1.5">
                          <MatchStrengthChip strength={approvedLink.matchStrength} />
                          <Link href={`/requests/${approvedLink.requestId}`} className="text-xs text-foreground hover:underline truncate max-w-[120px]" title={requestOptions.find((r) => r.id === approvedLink.requestId)?.title}>
                            {requestOptions.find((r) => r.id === approvedLink.requestId)?.title ?? approvedLink.requestId}
                          </Link>
                        </div>
                      ) : <span className="text-[11px] text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3"><span className="text-xs capitalize text-foreground">{c.source}</span></td>
                    <td className="px-4 py-3">
                      {scores.resume !== null ? <ScoreBar score={scores.resume} /> : <span className="text-[11px] text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {scores.interview !== null ? <ScoreBar score={scores.interview} /> : <span className="text-[11px] text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {scores.combined !== null ? <ScoreBar score={scores.combined} /> : <span className="text-[11px] text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.hasResume ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="2.5 6 5 8.5 9.5 3.5" /></svg>
                        </span>
                      ) : <span className="text-[11px] text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
                          {currentUser.initials}
                        </div>
                        <span className="text-[11px] text-muted-foreground">{currentUser.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-muted-foreground">{new Date(c.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusActionBar
                        candidateId={c.id}
                        currentStatus={c.status}
                        requestId={approvedLink?.requestId}
                        onStatusChanged={() => setRefresh((n) => n + 1)}
                        layout="compact"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center"><p className="text-sm text-muted-foreground">No candidates match the current filters.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
