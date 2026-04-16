"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import { getInterviews, getCandidateById, getRequestById, getRequestOptions } from "@/lib/store";
import { generateGoogleCalendarUrl, downloadICS } from "@/lib/calendar";
import { ScorePanel, SchedulePanel } from "@/components/interview-action-modal";

type RoundView = {
  interviewId: string;
  roundId: string;
  candidateId: string;
  candidateName: string;
  requestId: string;
  requestTitle: string;
  roundType: string;
  interviewerName: string;
  interviewerTitle: string;
  order: number;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  meetingType: string;
  hasFeedback: boolean;
  recommendation: string | null;
  overallScore: number | null;
};

type SortKey = "date_asc" | "date_desc" | "candidate" | "interviewer";
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Earliest First" },
  { value: "candidate", label: "Candidate A–Z" },
  { value: "interviewer", label: "Interviewer A–Z" },
];

type StatusFilter = "all" | "scheduled" | "completed" | "feedback_pending";
type ActionType = "score" | "schedule" | null;

const selectClass = "rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function formatRoundType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function InterviewsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [requestFilter, setRequestFilter] = useState("all");
  const [interviewerFilter, setInterviewerFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("date_desc");
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [, setRefresh] = useState(0);

  const interviews = getInterviews();
  const requestOptions = getRequestOptions();

  const allRounds = useMemo<RoundView[]>(() => {
    const rows: RoundView[] = [];
    for (const int of interviews) {
      const candidate = getCandidateById(int.candidateId);
      const request = getRequestById(int.requestId);
      for (const round of int.rounds) {
        rows.push({
          interviewId: int.id,
          roundId: round.id,
          candidateId: int.candidateId,
          candidateName: candidate ? `${candidate.firstName} ${candidate.lastName}` : int.candidateId,
          requestId: int.requestId,
          requestTitle: request?.title ?? int.requestId,
          roundType: round.type,
          interviewerName: round.interviewerName,
          interviewerTitle: round.interviewerTitle,
          order: round.order,
          status: round.status,
          scheduledAt: round.scheduledAt,
          durationMinutes: round.durationMinutes,
          timezone: round.timezone,
          meetingType: round.meetingType,
          hasFeedback: round.feedback !== null,
          recommendation: round.feedback?.recommendation ?? null,
          overallScore: round.feedback?.overallScore ?? null,
        });
      }
    }
    return rows;
  }, [interviews]);

  const interviewers = useMemo(() => [...new Set(allRounds.map((r) => r.interviewerName))].sort(), [allRounds]);
  const roundTypes = useMemo(() => [...new Set(allRounds.map((r) => r.roundType))].sort(), [allRounds]);

  const statusCounts = {
    all: allRounds.length,
    scheduled: allRounds.filter((r) => r.status === "scheduled").length,
    completed: allRounds.filter((r) => r.status === "completed").length,
    feedback_pending: allRounds.filter((r) => r.status === "completed" && !r.hasFeedback).length,
  };

  const filtered = allRounds
    .filter((r) => {
      if (statusFilter === "scheduled" && r.status !== "scheduled") return false;
      if (statusFilter === "completed" && r.status !== "completed") return false;
      if (statusFilter === "feedback_pending" && !(r.status === "completed" && !r.hasFeedback)) return false;
      if (requestFilter !== "all" && r.requestId !== requestFilter) return false;
      if (interviewerFilter !== "all" && r.interviewerName !== interviewerFilter) return false;
      if (roundFilter !== "all" && r.roundType !== roundFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date_desc": return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
        case "date_asc": return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        case "candidate": return a.candidateName.localeCompare(b.candidateName);
        case "interviewer": return a.interviewerName.localeCompare(b.interviewerName);
        default: return 0;
      }
    });

  function openAction(roundId: string, type: ActionType) {
    setExpandedRound(expandedRound === roundId && actionType === type ? null : roundId);
    setActionType(type);
  }

  function closeAction() {
    setExpandedRound(null);
    setActionType(null);
    setRefresh((n) => n + 1);
  }

  function handleCalendar(r: RoundView) {
    const url = generateGoogleCalendarUrl({
      title: `Interview: ${r.candidateName} — ${formatRoundType(r.roundType)}`,
      description: `${r.requestTitle}\nRound: ${formatRoundType(r.roundType)}\nInterviewer: ${r.interviewerName}`,
      startTime: r.scheduledAt,
      durationMinutes: r.durationMinutes,
      location: r.meetingType === "in_person" ? "Office" : null,
      timezone: r.timezone,
    });
    window.open(url, "_blank");
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-card px-6 py-5">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Interviews & Scheduling</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{allRounds.length} interview rounds across {interviews.length} loops</p>

        <div className="mt-4 flex gap-1">
          {(["all", "scheduled", "completed", "feedback_pending"] as StatusFilter[]).map((s) => {
            const label = s === "all" ? "All" : s === "feedback_pending" ? "Feedback Pending" : s.charAt(0).toUpperCase() + s.slice(1);
            return (
              <button key={s} onClick={() => setStatusFilter(s)} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${statusFilter === s ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                {label} <span className={`tabular-nums ${statusFilter === s ? "opacity-70" : "opacity-50"}`}>{statusCounts[s]}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select className={selectClass} value={requestFilter} onChange={(e) => setRequestFilter(e.target.value)}>
            <option value="all">All Requests</option>
            {requestOptions.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
          <select className={selectClass} value={interviewerFilter} onChange={(e) => setInterviewerFilter(e.target.value)}>
            <option value="all">All Interviewers</option>
            {interviewers.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <select className={selectClass} value={roundFilter} onChange={(e) => setRoundFilter(e.target.value)}>
            <option value="all">All Round Types</option>
            {roundTypes.map((t) => <option key={t} value={t}>{formatRoundType(t)}</option>)}
          </select>
          <select className={`${selectClass} ml-auto`} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span className="text-[11px] tabular-nums text-muted-foreground">{filtered.length} round{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-muted/50">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Candidate</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Request</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Round</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Interviewer</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Feedback</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((r) => (
                <Fragment key={r.roundId}>
                  <tr className={`group transition-colors hover:bg-muted/30 ${expandedRound === r.roundId ? "bg-muted/20" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`/candidates/${r.candidateId}`} className="text-sm font-medium text-foreground group-hover:underline">{r.candidateName}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/requests/${r.requestId}`} className="text-xs text-foreground hover:underline">{r.requestTitle}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{formatRoundType(r.roundType)}</span>
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground capitalize">{r.meetingType.replace("_", " ")}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground">{r.interviewerName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${
                        r.status === "completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : r.status === "scheduled" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                      }`}>{r.status.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.hasFeedback ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            r.recommendation === "strong_hire" || r.recommendation === "hire" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : r.recommendation === "lean_hire" ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                          }`}>{r.recommendation?.replace(/_/g, " ")}</span>
                          <span className="text-[11px] tabular-nums text-muted-foreground">{r.overallScore}/5</span>
                        </div>
                      ) : r.status === "completed" ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-400">Pending</span>
                      ) : <span className="text-[11px] text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-muted-foreground">{new Date(r.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">{r.durationMinutes}min</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(r.status === "completed" && !r.hasFeedback) && (
                          <button onClick={() => openAction(r.roundId, "score")} className="rounded-md bg-violet-600 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-violet-700">
                            Score
                          </button>
                        )}
                        {r.status === "scheduled" && (
                          <>
                            <button onClick={() => openAction(r.roundId, "schedule")} className="rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-muted">
                              Reschedule
                            </button>
                            <button onClick={() => handleCalendar(r)} className="rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-muted" title="Add to Google Calendar">
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                <line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                              </svg>
                            </button>
                          </>
                        )}
                        {r.status !== "completed" && r.status !== "scheduled" && (
                          <button onClick={() => openAction(r.roundId, "schedule")} className="rounded-md bg-foreground px-2 py-0.5 text-[10px] font-medium text-background hover:bg-foreground/90">
                            Schedule
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRound === r.roundId && (
                    <tr>
                      <td colSpan={8} className="bg-muted/10 px-6 py-4">
                        {actionType === "score" && (
                          <ScorePanel
                            interviewId={r.interviewId}
                            roundId={r.roundId}
                            interviewerName={r.interviewerName}
                            candidateName={r.candidateName}
                            roundType={formatRoundType(r.roundType)}
                            onDone={closeAction}
                          />
                        )}
                        {actionType === "schedule" && (
                          <SchedulePanel
                            interviewId={r.interviewId}
                            roundId={r.roundId}
                            candidateName={r.candidateName}
                            requestTitle={r.requestTitle}
                            roundType={formatRoundType(r.roundType)}
                            currentInterviewer={r.interviewerName}
                            currentDate={r.scheduledAt}
                            currentDuration={r.durationMinutes}
                            onDone={closeAction}
                          />
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center"><p className="text-sm text-muted-foreground">No interview rounds match the current filters.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
