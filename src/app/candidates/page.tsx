"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  getCandidatesEnriched,
  getReactivationSuggestions,
  getRequestOptions,
  getStatusHistory,
  createCandidate,
  linkCandidateToRequest,
} from "@/lib/store";
import type { CandidateStatus, ReactivationLabel, CandidateMatchStrength } from "@/lib/types";
import {
  CandidateStatusChip,
  MatchStrengthChip,
  ReactivationLabelChip,
  ScoreBar,
} from "@/components/ui/chips";
import { ReactivateButton } from "@/components/reactivate-button";

const STATUS_TABS: { label: string; value: CandidateStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Screening", value: "screening" },
  { label: "Interviewing", value: "interviewing" },
  { label: "Offer", value: "offer" },
  { label: "Inactive", value: "inactive" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

type SortKey = "newest" | "highest_score" | "lowest_score" | "name";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Most Recent" },
  { value: "highest_score", label: "Highest Score" },
  { value: "lowest_score", label: "Lowest Score" },
  { value: "name", label: "Name A–Z" },
];

export default function CandidatesPage() {
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | "all">("all");
  const [requestFilter, setRequestFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [scoreMin, setScoreMin] = useState(0);
  const [resumeOnly, setResumeOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [suggestionsOnly, setSuggestionsOnly] = useState(false);
  const [showReactivation, setShowReactivation] = useState(true);
  const [, setRefresh] = useState(0);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    currentTitle: "", currentCompany: "", location: "",
    yearsExperience: 0, source: "sourced",
    linkedinUrl: "", githubUsername: "",
    requestId: "", matchReason: "",
  });

  function handleCreateCandidate() {
    if (!newCandidate.firstName || !newCandidate.lastName || !newCandidate.email) return;
    const cand = createCandidate({
      ...newCandidate,
      linkedinUrl: newCandidate.linkedinUrl || null,
      githubUsername: newCandidate.githubUsername || null,
    });
    if (newCandidate.requestId) {
      linkCandidateToRequest(cand.id, newCandidate.requestId, "moderate" as CandidateMatchStrength, newCandidate.matchReason || "Manually added");
    }
    setNewCandidate({
      firstName: "", lastName: "", email: "", phone: "",
      currentTitle: "", currentCompany: "", location: "",
      yearsExperience: 0, source: "sourced",
      linkedinUrl: "", githubUsername: "",
      requestId: "", matchReason: "",
    });
    setShowNewForm(false);
    setRefresh((n) => n + 1);
  }

  const allCandidates = getCandidatesEnriched();
  const reactivations = getReactivationSuggestions();
  const requestOptions = getRequestOptions();
  const sources = useMemo(() => [...new Set(allCandidates.map((c) => c.source))].sort(), [allCandidates]);

  // Lookup: candidateId → reactivation suggestion (for inline badges)
  const reactivationMap = useMemo(() => {
    const map = new Map<string, { labels: ReactivationLabel[]; outcome: string; bestScore: number | null }>();
    for (const s of reactivations) {
      map.set(s.candidate.id, { labels: s.labels, outcome: s.link.status, bestScore: s.bestScore });
    }
    return map;
  }, [reactivations]);

  const counts = allCandidates.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const filtered = allCandidates
    .filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (requestFilter !== "all" && !c.links.some((l) => l.requestId === requestFilter)) return false;
      if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
      if (scoreMin > 0 && (c.bestCombinedScore === null || c.bestCombinedScore < scoreMin)) return false;
      if (resumeOnly && !c.hasResume) return false;
      if (suggestionsOnly && !reactivationMap.has(c.id)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "highest_score": return (b.bestCombinedScore ?? -1) - (a.bestCombinedScore ?? -1);
        case "lowest_score": return (a.bestCombinedScore ?? 999) - (b.bestCombinedScore ?? 999);
        case "name": return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
        default: return 0;
      }
    });

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              Candidates
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {allCandidates.length} candidates across all requests
            </p>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="rounded-md bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
          >
            + New Candidate
          </button>
        </div>

        {showNewForm && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <input className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="First Name *" required value={newCandidate.firstName} onChange={(e) => setNewCandidate((p) => ({ ...p, firstName: e.target.value }))} />
              <input className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Last Name *" required value={newCandidate.lastName} onChange={(e) => setNewCandidate((p) => ({ ...p, lastName: e.target.value }))} />
              <input className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" type="email" placeholder="Email *" required value={newCandidate.email} onChange={(e) => setNewCandidate((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Phone" value={newCandidate.phone} onChange={(e) => setNewCandidate((p) => ({ ...p, phone: e.target.value }))} />
              <input className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Current Title" value={newCandidate.currentTitle} onChange={(e) => setNewCandidate((p) => ({ ...p, currentTitle: e.target.value }))} />
              <input className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Current Company" value={newCandidate.currentCompany} onChange={(e) => setNewCandidate((p) => ({ ...p, currentCompany: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <input className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Location" value={newCandidate.location} onChange={(e) => setNewCandidate((p) => ({ ...p, location: e.target.value }))} />
              <input className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" type="number" min={0} placeholder="Years Exp" value={newCandidate.yearsExperience || ""} onChange={(e) => setNewCandidate((p) => ({ ...p, yearsExperience: parseInt(e.target.value, 10) || 0 }))} />
              <select className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" value={newCandidate.source} onChange={(e) => setNewCandidate((p) => ({ ...p, source: e.target.value }))}>
                <option value="sourced">Sourced</option>
                <option value="referral">Referral</option>
                <option value="inbound">Inbound</option>
                <option value="agency">Agency</option>
              </select>
              <select className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring" value={newCandidate.requestId} onChange={(e) => setNewCandidate((p) => ({ ...p, requestId: e.target.value }))}>
                <option value="">Link to Request (optional)</option>
                {requestOptions.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleCreateCandidate} className="rounded-md bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90">Create Candidate</button>
              <button onClick={() => setShowNewForm(false)} className="rounded-md px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">Cancel</button>
            </div>
          </div>
        )}

        {/* Status tabs */}
        <div className="mt-4 flex gap-1">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === "all" ? allCandidates.length : counts[tab.value] || 0;
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
                <span className={`tabular-nums ${isActive ? "opacity-70" : "opacity-50"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="mt-3 flex items-center gap-3">
          <select
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={requestFilter}
            onChange={(e) => setRequestFilter(e.target.value)}
          >
            <option value="all">All Requests</option>
            {requestOptions.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-muted-foreground">Min Score</label>
            <input
              type="number"
              min={0}
              max={100}
              className="w-16 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              value={scoreMin || ""}
              onChange={(e) => setScoreMin(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
            />
          </div>

          <select
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 text-xs text-foreground">
            <input
              type="checkbox"
              checked={resumeOnly}
              onChange={(e) => setResumeOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border"
            />
            Resume
          </label>

          <label className="flex items-center gap-1.5 text-xs text-violet-700 dark:text-violet-400 font-medium">
            <input
              type="checkbox"
              checked={suggestionsOnly}
              onChange={(e) => setSuggestionsOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-violet-300 dark:border-violet-700"
            />
            Suggestions Only
          </label>

          <select
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring ml-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <span className="text-[11px] tabular-nums text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="px-6 py-4 space-y-5">
        {/* Reactivation suggestions */}
        {reactivations.length > 0 && (
          <section className="rounded-lg border border-dashed border-violet-300 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/30">
            <button
              onClick={() => setShowReactivation(!showReactivation)}
              className="flex w-full items-center justify-between px-5 py-3"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                  {reactivations.length}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  Suggested Reactivations
                </span>
                <span className="text-xs text-muted-foreground">
                  Candidates who previously performed well
                </span>
              </div>
              <svg
                className={`h-4 w-4 text-muted-foreground transition-transform ${showReactivation ? "rotate-180" : ""}`}
                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="4 6 8 10 12 6" />
              </svg>
            </button>

            {showReactivation && (
              <div className="divide-y divide-violet-200/50 border-t border-violet-200/50 dark:divide-violet-800/50 dark:border-violet-800/50">
                {reactivations.map((s) => {
                  // Evidence: find last status history note for context
                  const history = getStatusHistory(s.candidate.id);
                  const relevantEntry = history
                    .filter((h) => h.requestId === s.link.requestId)
                    .at(-1);
                  const priorStage = history
                    .filter((h) => h.requestId === s.link.requestId)
                    .map((h) => h.toStatus)
                    .filter((st) => ["screening", "interviewing", "offer"].includes(st))
                    .at(-1) ?? "new";

                  return (
                    <div key={`${s.candidate.id}-${s.link.requestId}`} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-[11px] font-semibold text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                            {s.candidate.firstName[0]}{s.candidate.lastName[0]}
                          </div>
                          <div>
                            <Link
                              href={`/candidates/${s.candidate.id}`}
                              className="text-sm font-medium text-foreground hover:underline"
                            >
                              {s.candidate.firstName} {s.candidate.lastName}
                            </Link>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {s.candidate.currentTitle} at {s.candidate.currentCompany} · {s.requestTitle}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {s.labels.map((label) => (
                            <ReactivationLabelChip key={label} label={label} />
                          ))}
                          {s.bestScore !== null && <ScoreBar score={s.bestScore} />}
                          {s.candidate.status !== "reactivated" ? (
                            <ReactivateButton
                              candidateId={s.candidate.id}
                              requestId={s.link.requestId}
                              suggestionLabels={s.labels}
                              onReactivated={() => setRefresh((n) => n + 1)}
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400">
                              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="2.5 6 5 8.5 9.5 3.5" /></svg>
                              Reactivated
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Evidence row */}
                      <div className="mt-2 ml-11 flex flex-wrap items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <span className="font-medium text-foreground">Prior stage:</span>
                          <CandidateStatusChip status={priorStage as CandidateStatus} />
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <span className="font-medium text-foreground">Outcome:</span>
                          <CandidateStatusChip status={s.link.status} />
                        </span>
                        {s.bestScore !== null && (
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">Best score:</span> {s.bestScore}/100
                          </span>
                        )}
                        {relevantEntry?.note && (
                          <span className="text-muted-foreground italic truncate max-w-[320px]" title={relevantEntry.note}>
                            &ldquo;{relevantEntry.note}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Candidate table */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-muted/50">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Candidate
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Matched To
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Why Matched
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Score
                </th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Resume
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((c) => {
                const primaryLink = requestFilter !== "all"
                  ? c.links.find((l) => l.requestId === requestFilter) ?? c.links[0]
                  : c.links[0];

                return (
                  <tr key={c.id} className={`group transition-colors hover:bg-muted/30 ${reactivationMap.has(c.id) ? "bg-violet-50/30 dark:bg-violet-950/10" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`/candidates/${c.id}`} className="block">
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground group-hover:underline">
                            {c.firstName} {c.lastName}
                          </span>
                          {reactivationMap.has(c.id) && (
                            <span className="rounded bg-violet-100 px-1 py-0.5 text-[9px] font-bold text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                              REACTIVATE
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {c.currentTitle} at {c.currentCompany}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <CandidateStatusChip status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      {primaryLink ? (
                        <div className="flex items-center gap-1.5">
                          <MatchStrengthChip strength={primaryLink.matchStrength} />
                          <Link
                            href={`/requests/${primaryLink.requestId}`}
                            className="text-xs text-foreground hover:underline"
                          >
                            {requestOptions.find((r) => r.id === primaryLink.requestId)?.title ?? primaryLink.requestId}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="max-w-[240px] px-4 py-3">
                      {primaryLink ? (
                        <p className="truncate text-xs text-muted-foreground" title={primaryLink.matchReason}>
                          {primaryLink.matchReason}
                        </p>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.bestCombinedScore !== null ? (
                        <ScoreBar score={c.bestCombinedScore} />
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.hasResume ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="2.5 6 5 8.5 9.5 3.5" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No candidates match the current filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
