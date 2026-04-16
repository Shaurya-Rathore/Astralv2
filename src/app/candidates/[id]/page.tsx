import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getCandidateById,
  getLinksForCandidate,
  getResumeByCandidate,
  getScoresForCandidate,
  getStatusHistory,
  getRequestById,
  getInterviewsByCandidate,
  getCombinedScore,
  getOutreachByCandidate,
  getReactivationForCandidate,
  getRequestOptions,
} from "@/lib/store";
import { CandidateStatusChip, MatchStrengthChip, ScoreBar, ReactivationLabelChip } from "@/components/ui/chips";
import { ReactivateButton } from "@/components/reactivate-button";
import { StatusActionBar } from "@/components/status-action-bar";
import { NewInterviewForm } from "@/components/new-interview-form";
import { ResumeUpload } from "@/components/resume-upload";
import { currentUser } from "@/lib/auth";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRoundType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const recommendationStyle: Record<string, string> = {
  strong_hire: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  hire: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  lean_hire: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  lean_no_hire: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  no_hire: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const outcomeStyle: Record<string, string> = {
  sent: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  opened: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  replied: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  interested: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  declined: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  no_response: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
  bounced: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = getCandidateById(id);
  if (!candidate) notFound();

  const links = getLinksForCandidate(id);
  const resume = getResumeByCandidate(id);
  const allScores = getScoresForCandidate(id);
  const history = getStatusHistory(id);
  const interviews = getInterviewsByCandidate(id);
  const outreach = getOutreachByCandidate(id);
  const reactivations = getReactivationForCandidate(id);
  const requestOptions = getRequestOptions();

  const resumeScores = allScores.filter((s) => s.category === "resume");
  const interviewScores = allScores.filter((s) => s.category === "interview");
  const combinedScores = allScores.filter((s) => s.category === "combined");
  const bestResume = resumeScores.length > 0 ? Math.max(...resumeScores.map((s) => s.score)) : null;
  const bestInterview = interviewScores.length > 0 ? Math.max(...interviewScores.map((s) => s.score)) : null;
  const bestCombined = combinedScores.length > 0 ? Math.max(...combinedScores.map((s) => s.score)) : null;

  const resumeUrl = resume ? `/resumes/${resume.fileName}` : null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <Link
          href="/candidates"
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10 12 6 8 10 4" />
          </svg>
          All Candidates
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {candidate.firstName[0]}{candidate.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-semibold text-foreground tracking-tight">
                  {candidate.firstName} {candidate.lastName}
                </h1>
                <CandidateStatusChip status={candidate.status} />
                {reactivations.length > 0 && (
                  <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                    REACTIVATION CANDIDATE
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {candidate.currentTitle} at {candidate.currentCompany} · {candidate.location}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>{candidate.yearsExperience} years experience</p>
            <p>Source: {candidate.source}</p>
            <div className="mt-1.5 flex items-center justify-end gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
                {currentUser.initials}
              </div>
              <span className="text-[11px]">{currentUser.name}</span>
            </div>
          </div>
        </div>

        <StatusActionBar
          candidateId={candidate.id}
          currentStatus={candidate.status}
          requestId={links[0]?.requestId}
          layout="full"
        />
      </div>

      {/* Body */}
      <div className="grid grid-cols-3 gap-6 px-6 py-6">
        {/* Left column */}
        <div className="col-span-2 space-y-6">

          {/* Reactivation Signals */}
          {reactivations.length > 0 && (
            <section className="rounded-lg border border-dashed border-violet-300 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/30 p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-400">
                Reactivation Signals
              </h2>
              {reactivations.map((r) => (
                <div key={`${r.candidate.id}-${r.link.requestId}`} className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    {r.labels.map((label) => (
                      <ReactivationLabelChip key={label} label={label} />
                    ))}
                    <span className="text-xs text-muted-foreground">for {r.requestTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.bestScore !== null && <ScoreBar score={r.bestScore} />}
                    {candidate.status !== "reactivated" && (
                      <ReactivateButton
                        candidateId={candidate.id}
                        requestId={r.link.requestId}
                        suggestionLabels={r.labels}
                        size="md"
                      />
                    )}
                    {candidate.status === "reactivated" && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400">
                        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="2.5 6 5 8.5 9.5 3.5" /></svg>
                        Reactivated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Score Summary */}
          {allScores.length > 0 && (
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Score Overview
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-md border border-border-subtle p-3 text-center">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Resume</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{bestResume ?? "—"}</dd>
                </div>
                <div className="rounded-md border border-border-subtle p-3 text-center">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">Interview</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{bestInterview ?? "—"}</dd>
                </div>
                <div className="rounded-md border border-foreground/10 bg-foreground/5 p-3 text-center">
                  <dt className="text-[10px] font-medium uppercase tracking-wider text-foreground">Combined</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{bestCombined ?? "—"}</dd>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                Combined score = Resume (40% weight) + Interview (60% weight). Best score across all linked requests shown above.
              </p>
            </section>
          )}

          {/* Score Breakdown */}
          {allScores.length > 0 && (
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Score Breakdown
              </h2>
              <div className="space-y-4">
                {allScores.map((s) => {
                  const req = getRequestById(s.requestId);
                  return (
                    <div key={s.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            s.category === "combined" ? "bg-foreground/10 text-foreground"
                            : s.category === "resume" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                            : "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400"
                          }`}>{s.category}</span>
                          <span className="text-xs text-muted-foreground">{req?.title} · {s.scoredBy} · {formatDate(s.scoredAt)}</span>
                        </div>
                        <ScoreBar score={s.score} />
                      </div>
                      {s.breakdown.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 pl-4">
                          {s.breakdown.map((b) => (
                            <div key={b.label} className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">{b.label}</span>
                              <span className="text-[11px] font-medium tabular-nums text-foreground">
                                {b.score} <span className="text-muted-foreground/50">({Math.round(b.weight * 100)}%)</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Matched Requests */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Matched Requests</h2>
            {links.length > 0 ? (
              <div className="divide-y divide-border-subtle">
                {links.map((link) => {
                  const req = getRequestById(link.requestId);
                  const score = getCombinedScore(id, link.requestId);
                  return (
                    <div key={link.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MatchStrengthChip strength={link.matchStrength} />
                          <Link href={`/requests/${link.requestId}`} className="text-sm font-medium text-foreground hover:underline">{req?.title ?? link.requestId}</Link>
                          <CandidateStatusChip status={link.status} />
                        </div>
                        {score !== null && <ScoreBar score={score} />}
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{link.matchReason}</p>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-muted-foreground">Not matched to any requests yet.</p>}
          </section>

          {/* Interview History Timeline */}
          {interviews.length > 0 && (
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interview History</h2>
              <div className="space-y-5">
                {interviews.map((int) => {
                  const req = getRequestById(int.requestId);
                  return (
                    <div key={int.id}>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link href={`/requests/${int.requestId}`} className="text-xs font-medium text-foreground hover:underline">{req?.title}</Link>
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            int.status === "completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : int.status === "in_progress" ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                          }`}>{int.status.replace("_", " ")}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{int.rounds.filter((r) => r.status === "completed").length}/{int.rounds.length} rounds</span>
                      </div>
                      <div className="space-y-2.5 border-l-2 border-border-subtle pl-4">
                        {int.rounds.map((round) => (
                          <div key={round.id} className="relative">
                            <div
                              className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-card"
                              style={{ backgroundColor: round.status === "completed" ? "rgb(16 185 129)" : round.status === "scheduled" ? "rgb(59 130 246)" : "rgb(161 161 170)" }}
                            />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{formatRoundType(round.type)}</span>
                                <span className="text-xs text-foreground">{round.interviewerName}</span>
                                <span className="text-[11px] text-muted-foreground">{round.interviewerTitle}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-muted-foreground">{formatDateTime(round.scheduledAt)}</span>
                                <span className="text-[11px] text-muted-foreground">{round.durationMinutes}min</span>
                              </div>
                            </div>
                            {round.feedback && (
                              <div className="mt-2 rounded-md border border-border-subtle bg-muted/30 p-3">
                                <div className="flex items-center gap-2">
                                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${recommendationStyle[round.feedback.recommendation] ?? "bg-zinc-100 text-zinc-500"}`}>
                                    {round.feedback.recommendation.replace(/_/g, " ")}
                                  </span>
                                  <span className="text-[11px] font-semibold tabular-nums text-foreground">{round.feedback.overallScore}/5</span>
                                </div>
                                {round.feedback.strengths.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">Strengths</span>
                                    <ul className="mt-0.5">
                                      {round.feedback.strengths.map((s, i) => <li key={i} className="text-[11px] leading-relaxed text-muted-foreground">+ {s}</li>)}
                                    </ul>
                                  </div>
                                )}
                                {round.feedback.concerns.length > 0 && (
                                  <div className="mt-1.5">
                                    <span className="text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">Concerns</span>
                                    <ul className="mt-0.5">
                                      {round.feedback.concerns.map((c, i) => <li key={i} className="text-[11px] leading-relaxed text-muted-foreground">- {c}</li>)}
                                    </ul>
                                  </div>
                                )}
                                <p className="mt-1.5 text-[11px] italic leading-relaxed text-muted-foreground">{round.feedback.notes}</p>
                              </div>
                            )}
                            {!round.feedback && round.status === "scheduled" && (
                              <p className="mt-1 text-[11px] text-muted-foreground">Scheduled — awaiting completion</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* New Interview */}
          <NewInterviewForm candidateId={id} requestOptions={requestOptions} />

          {/* Outreach History */}
          {outreach.length > 0 && (
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outreach History</h2>
              <div className="space-y-2.5">
                {outreach.map((o) => (
                  <div key={o.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-foreground/20" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">{o.channel}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${outcomeStyle[o.outcome] ?? "bg-zinc-100 text-zinc-500"}`}>{o.outcome.replace("_", " ")}</span>
                        <span className="text-[11px] text-muted-foreground">{formatDate(o.sentAt)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-foreground">{o.subject}</p>
                      <p className="text-[11px] text-muted-foreground">by {o.sentBy}{o.respondedAt && <> · responded {formatDate(o.respondedAt)}</>}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Resume */}
          {resume && (
            <section className="rounded-lg border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resume Summary</h2>
                <div className="flex items-center gap-2">
                  {resumeUrl && (
                    <>
                      <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted">View Resume</a>
                      <a href={resumeUrl} download={resume.fileName} className="rounded-md bg-foreground px-2.5 py-1 text-[11px] font-medium text-background transition-colors hover:bg-foreground/90">Download</a>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{resume.summary}</p>
              <div className="mt-4">
                <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {resume.skills.map((skill) => <span key={skill} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{skill}</span>)}
                </div>
              </div>
              {resume.experience.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Experience</h3>
                  {resume.experience.map((exp) => (
                    <div key={`${exp.company}-${exp.startYear}`}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-medium text-foreground">{exp.title} at {exp.company}</span>
                        <span className="text-[11px] text-muted-foreground">{exp.startYear}–{exp.endYear ?? "Present"}</span>
                      </div>
                      <ul className="mt-1 space-y-0.5">
                        {exp.highlights.map((h, i) => <li key={i} className="text-[11px] leading-relaxed text-muted-foreground">· {h}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {resume.education.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Education</h3>
                  {resume.education.map((edu) => <p key={`${edu.institution}-${edu.year}`} className="text-xs text-foreground">{edu.degree} {edu.field}, {edu.institution} ({edu.year})</p>)}
                </div>
              )}
            </section>
          )}

          {/* Status History */}
          {history.length > 0 && (
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status History</h2>
              <div className="space-y-2.5">
                {history.map((h) => (
                  <div key={h.id} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-foreground/20" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        {h.fromStatus && (<><CandidateStatusChip status={h.fromStatus} /><span className="text-[11px] text-muted-foreground">→</span></>)}
                        <CandidateStatusChip status={h.toStatus} />
                        <span className="text-[11px] text-muted-foreground">by {h.changedBy} · {formatDate(h.changedAt)}</span>
                      </div>
                      {h.note && <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Resume Actions */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resume</h2>
            {resume ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-medium text-foreground">{resume.fileName}</p>
                    <p className="text-[11px] text-muted-foreground">Uploaded {formatDate(resume.uploadedAt)}</p>
                  </div>
                </div>
                {resumeUrl && (
                  <div className="flex gap-2">
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-md border border-border px-3 py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-muted">View</a>
                    <a href={resumeUrl} download={resume.fileName} className="flex-1 rounded-md bg-foreground px-3 py-1.5 text-center text-xs font-medium text-background transition-colors hover:bg-foreground/90">Download</a>
                  </div>
                )}
              </div>
            ) : <p className="text-xs text-muted-foreground">No resume uploaded</p>}
            <div className="mt-3">
              <ResumeUpload candidateId={id} hasExisting={!!resume} />
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</h2>
            <dl className="space-y-2.5">
              <div><dt className="text-[11px] font-medium text-muted-foreground">Email</dt><dd className="text-sm text-foreground">{candidate.email}</dd></div>
              <div><dt className="text-[11px] font-medium text-muted-foreground">Phone</dt><dd className="text-sm text-foreground">{candidate.phone}</dd></div>
              {candidate.linkedinUrl && <div><dt className="text-[11px] font-medium text-muted-foreground">LinkedIn</dt><dd className="text-sm text-foreground truncate">{candidate.linkedinUrl}</dd></div>}
              {candidate.githubUsername && <div><dt className="text-[11px] font-medium text-muted-foreground">GitHub</dt><dd className="text-sm text-foreground">{candidate.githubUsername}</dd></div>}
            </dl>
          </section>

          {/* Owner & Details */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h2>
            <dl className="space-y-2.5">
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground">Recruiter Owner</dt>
                <dd className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">{currentUser.initials}</div>
                  <span className="text-sm text-foreground">{currentUser.name}</span>
                </dd>
              </div>
              <div><dt className="text-[11px] font-medium text-muted-foreground">Status</dt><dd><CandidateStatusChip status={candidate.status} /></dd></div>
              <div><dt className="text-[11px] font-medium text-muted-foreground">Location</dt><dd className="text-sm text-foreground">{candidate.location}</dd></div>
              <div><dt className="text-[11px] font-medium text-muted-foreground">Experience</dt><dd className="text-sm text-foreground">{candidate.yearsExperience} years</dd></div>
              <div><dt className="text-[11px] font-medium text-muted-foreground">Source</dt><dd className="text-sm text-foreground capitalize">{candidate.source}</dd></div>
              <div><dt className="text-[11px] font-medium text-muted-foreground">Added</dt><dd className="text-sm text-foreground">{formatDate(candidate.createdAt)}</dd></div>
              <div><dt className="text-[11px] font-medium text-muted-foreground">Last Updated</dt><dd className="text-sm text-foreground">{formatDate(candidate.updatedAt)}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
