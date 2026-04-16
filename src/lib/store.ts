/**
 * In-memory store with query/mutation helpers.
 *
 * Every function here is synchronous today but returns plain values
 * that are easy to swap to `async` + fetch when a real API exists.
 * Mutations work on the module-level arrays so changes persist
 * for the lifetime of the dev-server process.
 */

import type {
  Request,
  RequestStatus,
  RequestSkill,
  RequestApproval,
  Candidate,
  CandidateReqLink,
  CandidateResume,
  CandidateScore,
  CandidateStatusHistory,
  CandidateStatus,
  Interview,
  OutreachEvent,
  ScoreCategory,
  EnrichedCandidate,
  ReactivationSuggestion,
  ReactivationLabel,
} from "./types";

import {
  requests,
  requestApprovals,
  candidates,
  candidateReqLinks,
  candidateResumes,
  candidateScores,
  candidateStatusHistory,
  interviews,
  outreachEvents,
} from "./data";

// ─── ID helpers ──────────────────────────────────────────────────────────────

let _seq = 1000;
const nextId = (prefix: string) => `${prefix}-${String(++_seq).padStart(4, "0")}`;
const now = () => new Date().toISOString();

// ─── Requests ────────────────────────────────────────────────────────────────

export function getRequests(status?: RequestStatus): Request[] {
  if (!status) return [...requests];
  return requests.filter((r) => r.status === status);
}

export function getRequestById(id: string): Request | undefined {
  return requests.find((r) => r.id === id);
}

export function getApprovalsByRequest(requestId: string): RequestApproval[] {
  return requestApprovals.filter((a) => a.requestId === requestId);
}

export function approveRequest(
  requestId: string,
  approverName: string,
  approverRole: string,
  comment?: string,
): RequestApproval {
  const approval: RequestApproval = {
    id: nextId("ra"),
    requestId,
    approverName,
    approverRole,
    status: "approved",
    comment: comment ?? null,
    decidedAt: now(),
    createdAt: now(),
  };
  requestApprovals.push(approval);

  // If all pending approvals for this request are resolved, update request status
  const pending = requestApprovals.filter(
    (a) => a.requestId === requestId && a.status === "pending",
  );
  if (pending.length === 0) {
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      req.status = "approved";
      req.updatedAt = now();
    }
  }
  return approval;
}

export function rejectRequest(
  requestId: string,
  approverName: string,
  approverRole: string,
  comment?: string,
): RequestApproval {
  const approval: RequestApproval = {
    id: nextId("ra"),
    requestId,
    approverName,
    approverRole,
    status: "rejected",
    comment: comment ?? null,
    decidedAt: now(),
    createdAt: now(),
  };
  requestApprovals.push(approval);

  const req = requests.find((r) => r.id === requestId);
  if (req) {
    req.status = "rejected";
    req.updatedAt = now();
  }
  return approval;
}

// ─── Candidates ──────────────────────────────────────────────────────────────

export function createCandidate(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentTitle: string;
  currentCompany: string;
  location: string;
  linkedinUrl?: string | null;
  githubUsername?: string | null;
  yearsExperience: number;
  source: string;
}): Candidate {
  const candidate: Candidate = {
    ...data,
    id: nextId("cand"),
    status: "new",
    linkedinUrl: data.linkedinUrl ?? null,
    githubUsername: data.githubUsername ?? null,
    avatarUrl: null,
    createdAt: now(),
    updatedAt: now(),
  };
  candidates.push(candidate);
  return candidate;
}

export function linkCandidateToRequest(
  candidateId: string,
  requestId: string,
  matchStrength: import("./types").CandidateMatchStrength,
  matchReason: string,
): CandidateReqLink {
  const link: CandidateReqLink = {
    id: nextId("crl"),
    candidateId,
    requestId,
    matchStrength,
    matchReason,
    appliedAt: now(),
    status: "new",
  };
  candidateReqLinks.push(link);
  return link;
}

export function getCandidates(status?: CandidateStatus): Candidate[] {
  if (!status) return [...candidates];
  return candidates.filter((c) => c.status === status);
}

export function getCandidateById(id: string): Candidate | undefined {
  return candidates.find((c) => c.id === id);
}

export function getCandidatesByRequest(requestId: string): (Candidate & { link: CandidateReqLink })[] {
  const links = candidateReqLinks.filter((l) => l.requestId === requestId);
  return links
    .map((link) => {
      const candidate = candidates.find((c) => c.id === link.candidateId);
      if (!candidate) return null;
      return { ...candidate, link };
    })
    .filter(Boolean) as (Candidate & { link: CandidateReqLink })[];
}

export function getLinksForCandidate(candidateId: string): CandidateReqLink[] {
  return candidateReqLinks.filter((l) => l.candidateId === candidateId);
}

// ─── Resumes ─────────────────────────────────────────────────────────────────

export function getResumeByCandidate(candidateId: string): CandidateResume | undefined {
  return candidateResumes.find((r) => r.candidateId === candidateId);
}

export function createResume(data: {
  candidateId: string;
  fileName: string;
  summary: string;
  skills: string[];
  education: CandidateResume["education"];
  experience: CandidateResume["experience"];
}): CandidateResume {
  const existing = candidateResumes.findIndex((r) => r.candidateId === data.candidateId);
  const resume: CandidateResume = {
    id: nextId("res"),
    candidateId: data.candidateId,
    fileName: data.fileName,
    uploadedAt: now(),
    summary: data.summary,
    skills: data.skills,
    education: data.education,
    experience: data.experience,
  };
  if (existing !== -1) {
    candidateResumes[existing] = resume;
  } else {
    candidateResumes.push(resume);
  }
  return resume;
}

// ─── Scores ──────────────────────────────────────────────────────────────────

export function getScoresForCandidate(
  candidateId: string,
  requestId?: string,
): CandidateScore[] {
  return candidateScores.filter(
    (s) =>
      s.candidateId === candidateId &&
      (!requestId || s.requestId === requestId),
  );
}

export function getScoresByCategory(category: ScoreCategory): CandidateScore[] {
  return candidateScores.filter((s) => s.category === category);
}

export function getAllScores(): CandidateScore[] {
  return [...candidateScores];
}

// ─── Status History ──────────────────────────────────────────────────────────

export function getStatusHistory(candidateId: string): CandidateStatusHistory[] {
  return candidateStatusHistory
    .filter((h) => h.candidateId === candidateId)
    .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
}

export function reactivateCandidate(
  candidateId: string,
  requestId: string,
  changedBy: string,
  opts?: { note?: string; suggestionLabels?: string[] },
): CandidateStatusHistory {
  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) throw new Error(`Candidate ${candidateId} not found`);

  const previousStatus = candidate.status;
  candidate.status = "reactivated";
  candidate.updatedAt = now();

  // Update existing link or create a new one
  let link = candidateReqLinks.find(
    (l) => l.candidateId === candidateId && l.requestId === requestId,
  );
  if (link) {
    link.status = "reactivated";
  } else {
    link = {
      id: nextId("crl"),
      candidateId,
      requestId,
      matchStrength: "moderate",
      matchReason: "Reactivated candidate — previously in pipeline",
      appliedAt: now(),
      status: "reactivated",
    };
    candidateReqLinks.push(link);
  }

  // Build history note with suggestion context
  let historyNote = opts?.note ?? "Candidate reactivated for reconsideration";
  if (opts?.suggestionLabels && opts.suggestionLabels.length > 0) {
    historyNote += ` (Suggested: ${opts.suggestionLabels.join(", ")})`;
  }

  const entry: CandidateStatusHistory = {
    id: nextId("csh"),
    candidateId,
    requestId,
    fromStatus: previousStatus,
    toStatus: "reactivated",
    changedBy,
    note: historyNote,
    changedAt: now(),
  };
  candidateStatusHistory.push(entry);
  return entry;
}

export function updateCandidateStatus(
  candidateId: string,
  toStatus: CandidateStatus,
  changedBy: string,
  requestId?: string,
  note?: string,
): CandidateStatusHistory {
  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) throw new Error(`Candidate ${candidateId} not found`);

  const previousStatus = candidate.status;
  candidate.status = toStatus;
  candidate.updatedAt = now();

  if (requestId) {
    const link = candidateReqLinks.find(
      (l) => l.candidateId === candidateId && l.requestId === requestId,
    );
    if (link) link.status = toStatus;
  }

  const entry: CandidateStatusHistory = {
    id: nextId("csh"),
    candidateId,
    requestId: requestId ?? null,
    fromStatus: previousStatus,
    toStatus,
    changedBy,
    note: note ?? null,
    changedAt: now(),
  };
  candidateStatusHistory.push(entry);
  return entry;
}

// ─── Interviews ──────────────────────────────────────────────────────────────

export function createInterview(data: {
  candidateId: string;
  requestId: string;
  rounds: {
    type: import("./types").InterviewType;
    interviewerName: string;
    interviewerTitle: string;
    scheduledAt: string;
    durationMinutes: number;
    timezone: string;
    meetingType: import("./types").MeetingType;
  }[];
}): Interview {
  const interviewId = nextId("int");
  const interview: Interview = {
    id: interviewId,
    candidateId: data.candidateId,
    requestId: data.requestId,
    status: "scheduled",
    scheduledAt: data.rounds[0]?.scheduledAt ?? now(),
    durationMinutes: data.rounds.reduce((sum, r) => sum + r.durationMinutes, 0),
    location: null,
    meetingLink: null,
    createdAt: now(),
    schedulingStatus: "confirmed",
    schedulingNotes: null,
    rounds: data.rounds.map((r, i) => ({
      id: nextId("ir"),
      interviewId,
      type: r.type,
      interviewerName: r.interviewerName,
      interviewerTitle: r.interviewerTitle,
      order: i + 1,
      status: "scheduled" as import("./types").InterviewStatus,
      scheduledAt: r.scheduledAt,
      durationMinutes: r.durationMinutes,
      timezone: r.timezone,
      meetingType: r.meetingType,
      feedback: null,
    })),
  };
  interviews.push(interview);
  return interview;
}

export function getInterviews(): Interview[] {
  return [...interviews];
}

export function getInterviewsByCandidate(candidateId: string): Interview[] {
  return interviews.filter((i) => i.candidateId === candidateId);
}

export function getInterviewsByRequest(requestId: string): Interview[] {
  return interviews.filter((i) => i.requestId === requestId);
}

export function getInterviewById(id: string): Interview | undefined {
  return interviews.find((i) => i.id === id);
}

// ─── Outreach ────────────────────────────────────────────────────────────────

export function getOutreachByCandidate(candidateId: string): OutreachEvent[] {
  return outreachEvents
    .filter((o) => o.candidateId === candidateId)
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

export function getOutreachEvents(): OutreachEvent[] {
  return [...outreachEvents];
}

// ─── Analytics helpers ───────────────────────────────────────────────────────

export function getPipelineStats() {
  const total = candidates.length;
  const byStatus = candidates.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const combinedScores = candidateScores.filter((s) => s.category === "combined");
  const avgCombined =
    combinedScores.length > 0
      ? Math.round(combinedScores.reduce((sum, s) => sum + s.score, 0) / combinedScores.length)
      : 0;

  const openRequests = requests.filter((r) => r.status === "approved" || r.status === "pending_approval").length;
  const totalHeadcount = requests
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + r.headcount, 0);

  return {
    totalCandidates: total,
    candidatesByStatus: byStatus,
    avgCombinedScore: avgCombined,
    openRequests,
    totalApprovedHeadcount: totalHeadcount,
    activeInterviews: interviews.filter((i) => i.status === "in_progress" || i.status === "scheduled").length,
    offersExtended: candidates.filter((c) => c.status === "offer").length,
  };
}

export function updateRequestStatus(requestId: string, status: RequestStatus): void {
  const req = requests.find((r) => r.id === requestId);
  if (!req) throw new Error(`Request ${requestId} not found`);
  req.status = status;
  req.updatedAt = now();
}

// ─── Request CRUD ────────────────────────────────────────────────────────────

export function createRequest(
  data: Omit<Request, "id" | "createdAt" | "updatedAt" | "status" | "linkedInPostStatus" | "isReplacement" | "replacingWhom" | "replacementReason" | "scopeChanged" | "skills"> & {
    isReplacement?: boolean;
    replacingWhom?: string | null;
    replacementReason?: string | null;
    scopeChanged?: import("./types").ScopeChange | null;
    skills?: import("./types").RequestSkill[];
  },
): Request {
  const req: Request = {
    ...data,
    id: nextId("req"),
    status: "draft",
    linkedInPostStatus: "not_posted",
    isReplacement: data.isReplacement ?? false,
    replacingWhom: data.replacingWhom ?? null,
    replacementReason: data.replacementReason ?? null,
    scopeChanged: data.scopeChanged ?? null,
    skills: data.skills ?? [],
    createdAt: now(),
    updatedAt: now(),
  };
  requests.push(req);
  return req;
}

export function updateRequest(
  id: string,
  data: Partial<Omit<Request, "id" | "createdAt" | "skills">>,
): Request {
  const req = requests.find((r) => r.id === id);
  if (!req) throw new Error(`Request ${id} not found`);
  Object.assign(req, data, { updatedAt: now() });
  return req;
}

// ─── Skill mutations ─────────────────────────────────────────────────────────

export function addSkillToRequest(
  requestId: string,
  name: string,
  required: boolean,
  yearsMin: number | null,
): RequestSkill {
  const req = requests.find((r) => r.id === requestId);
  if (!req) throw new Error(`Request ${requestId} not found`);

  const skill: RequestSkill = {
    id: nextId("rs"),
    requestId,
    name,
    required,
    yearsMin,
  };
  req.skills.push(skill);
  req.updatedAt = now();
  return skill;
}

export function removeSkillFromRequest(requestId: string, skillId: string): void {
  const req = requests.find((r) => r.id === requestId);
  if (!req) throw new Error(`Request ${requestId} not found`);

  const idx = req.skills.findIndex((s) => s.id === skillId);
  if (idx !== -1) {
    req.skills.splice(idx, 1);
    req.updatedAt = now();
  }
}

// ─── Enriched candidate queries ──────────────────────────────────────────────

export function getRequestOptions(): { id: string; title: string }[] {
  return requests.map((r) => ({ id: r.id, title: r.title }));
}

export function getCombinedScore(candidateId: string, requestId: string): number | null {
  const scores = candidateScores.filter(
    (s) => s.candidateId === candidateId && s.requestId === requestId,
  );
  const combined = scores.find((s) => s.category === "combined");
  if (combined) return combined.score;
  const resume = scores.find((s) => s.category === "resume");
  const interview = scores.find((s) => s.category === "interview");
  if (resume && interview) return Math.round(resume.score * 0.4 + interview.score * 0.6);
  if (resume) return resume.score;
  return null;
}

export function getCandidatesEnriched(): EnrichedCandidate[] {
  return candidates.map((c) => {
    const links = candidateReqLinks.filter((l) => l.candidateId === c.id);
    const resume = candidateResumes.find((r) => r.candidateId === c.id) ?? null;
    const scores = candidateScores.filter((s) => s.candidateId === c.id);
    const combinedScores = scores.filter((s) => s.category === "combined");
    const resumeScores = scores.filter((s) => s.category === "resume");
    const bestCombined =
      combinedScores.length > 0
        ? Math.max(...combinedScores.map((s) => s.score))
        : resumeScores.length > 0
          ? Math.max(...resumeScores.map((s) => s.score))
          : null;
    return { ...c, links, resume, bestCombinedScore: bestCombined, scores, hasResume: resume !== null };
  });
}

// ─── Reactivation suggestions ────────────────────────────────────────────────

export const PIPELINE_STAGES: CandidateStatus[] = ["new", "screening", "interviewing", "offer", "hired"];

export function getNextPipelineStage(current: CandidateStatus): CandidateStatus | null {
  const effective = current === "reactivated" ? "new" : current;
  const idx = PIPELINE_STAGES.indexOf(effective);
  if (idx === -1 || idx >= PIPELINE_STAGES.length - 1) return null;
  return PIPELINE_STAGES[idx + 1];
}

function highestStage(candidateId: string, requestId: string): CandidateStatus {
  const history = candidateStatusHistory.filter(
    (h) => h.candidateId === candidateId && h.requestId === requestId,
  );
  let best: CandidateStatus = "new";
  for (const h of history) {
    if (PIPELINE_STAGES.indexOf(h.toStatus) > PIPELINE_STAGES.indexOf(best)) {
      best = h.toStatus;
    }
  }
  return best;
}

const TIMING_KEYWORDS = ["timing", "counter-offer", "counter offer", "pause", "not right", "deadline"];

export function getReactivationSuggestions(): ReactivationSuggestion[] {
  const eligible = candidateReqLinks.filter((l) =>
    ["rejected", "withdrawn", "inactive"].includes(l.status),
  );

  const suggestions: ReactivationSuggestion[] = [];

  for (const link of eligible) {
    const candidate = candidates.find((c) => c.id === link.candidateId);
    const request = requests.find((r) => r.id === link.requestId);
    if (!candidate || !request) continue;

    const labels: ReactivationLabel[] = [];
    const scores = candidateScores.filter(
      (s) => s.candidateId === link.candidateId && s.requestId === link.requestId,
    );
    const interviewScore = scores.find((s) => s.category === "interview");
    const resumeScore = scores.find((s) => s.category === "resume");
    const bestScore = getCombinedScore(link.candidateId, link.requestId);
    const stage = highestStage(link.candidateId, link.requestId);

    // Strong Prior Interview: interview score >= 80
    if (interviewScore && interviewScore.score >= 80) {
      labels.push("Strong Prior Interview");
    }

    // Silver Medalist: rejected but reached interviewing+ with score >= 75
    if (
      link.status === "rejected" &&
      PIPELINE_STAGES.indexOf(stage) >= PIPELINE_STAGES.indexOf("interviewing") &&
      bestScore !== null &&
      bestScore >= 75
    ) {
      labels.push("Silver Medalist");
    }

    // Final Round Previously: reached interviewing stage
    if (PIPELINE_STAGES.indexOf(stage) >= PIPELINE_STAGES.indexOf("interviewing")) {
      labels.push("Final Round Previously");
    }

    // Rejected for Timing: withdrawn/inactive with timing-related notes
    if (["withdrawn", "inactive"].includes(link.status)) {
      const history = candidateStatusHistory.filter(
        (h) => h.candidateId === link.candidateId && h.requestId === link.requestId,
      );
      const hasTimingNote = history.some(
        (h) => h.note && TIMING_KEYWORDS.some((kw) => h.note!.toLowerCase().includes(kw)),
      );
      if (hasTimingNote) {
        labels.push("Rejected for Timing");
      }
    }

    if (labels.length > 0) {
      suggestions.push({
        candidate,
        link,
        requestTitle: request.title,
        labels,
        bestScore,
      });
    }
  }

  return suggestions.sort((a, b) => {
    if (b.labels.length !== a.labels.length) return b.labels.length - a.labels.length;
    return (b.bestScore ?? 0) - (a.bestScore ?? 0);
  });
}

export function getReactivationForCandidate(candidateId: string): ReactivationSuggestion[] {
  return getReactivationSuggestions().filter((s) => s.candidate.id === candidateId);
}

// ─── Interview mutations ─────────────────────────────────────────────────────

export function submitRoundFeedback(
  interviewId: string,
  roundId: string,
  feedback: {
    overallScore: number;
    recommendation: import("./types").InterviewFeedback["recommendation"];
    strengths: string[];
    concerns: string[];
    notes: string;
    interviewerName: string;
  },
): void {
  const interview = interviews.find((i) => i.id === interviewId);
  if (!interview) throw new Error(`Interview ${interviewId} not found`);
  const round = interview.rounds.find((r) => r.id === roundId);
  if (!round) throw new Error(`Round ${roundId} not found`);

  round.feedback = {
    id: nextId("if"),
    roundId,
    interviewerName: feedback.interviewerName,
    overallScore: feedback.overallScore,
    recommendation: feedback.recommendation,
    strengths: feedback.strengths,
    concerns: feedback.concerns,
    notes: feedback.notes,
    submittedAt: now(),
  };
  round.status = "completed";

  // Create/update interview CandidateScore from all completed round feedback
  const completedRounds = interview.rounds.filter((r) => r.feedback);
  if (completedRounds.length > 0) {
    const avgScore = Math.round(
      completedRounds.reduce((sum, r) => sum + r.feedback!.overallScore, 0) / completedRounds.length * 20,
    ); // Convert 1-5 scale to 0-100
    const breakdown = completedRounds.map((r) => ({
      label: r.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      score: r.feedback!.overallScore * 20,
      weight: 1 / completedRounds.length,
    }));

    const existing = candidateScores.find(
      (s) => s.candidateId === interview.candidateId && s.requestId === interview.requestId && s.category === "interview",
    );
    if (existing) {
      existing.score = avgScore;
      existing.breakdown = breakdown;
      existing.scoredAt = now();
      existing.scoredBy = feedback.interviewerName;
    } else {
      candidateScores.push({
        id: nextId("cs"),
        candidateId: interview.candidateId,
        requestId: interview.requestId,
        category: "interview",
        score: avgScore,
        breakdown,
        scoredAt: now(),
        scoredBy: feedback.interviewerName,
      });
    }

    // Recalculate combined score
    const resumeScore = candidateScores.find(
      (s) => s.candidateId === interview.candidateId && s.requestId === interview.requestId && s.category === "resume",
    );
    const interviewScore = avgScore;
    const combinedVal = resumeScore
      ? Math.round(resumeScore.score * 0.4 + interviewScore * 0.6)
      : interviewScore;
    const existingCombined = candidateScores.find(
      (s) => s.candidateId === interview.candidateId && s.requestId === interview.requestId && s.category === "combined",
    );
    if (existingCombined) {
      existingCombined.score = combinedVal;
      existingCombined.scoredAt = now();
    } else {
      candidateScores.push({
        id: nextId("cs"),
        candidateId: interview.candidateId,
        requestId: interview.requestId,
        category: "combined",
        score: combinedVal,
        breakdown: [],
        scoredAt: now(),
        scoredBy: feedback.interviewerName,
      });
    }
  }

  // Update interview-level status if all rounds complete
  const allComplete = interview.rounds.every((r) => r.status === "completed");
  if (allComplete) interview.status = "completed";
}

export function scheduleRound(
  interviewId: string,
  roundId: string,
  data: {
    scheduledAt: string;
    durationMinutes: number;
    timezone: string;
    meetingType: import("./types").MeetingType;
    interviewerName?: string;
    interviewerTitle?: string;
  },
): void {
  const interview = interviews.find((i) => i.id === interviewId);
  if (!interview) throw new Error(`Interview ${interviewId} not found`);
  const round = interview.rounds.find((r) => r.id === roundId);
  if (!round) throw new Error(`Round ${roundId} not found`);

  round.scheduledAt = data.scheduledAt;
  round.durationMinutes = data.durationMinutes;
  round.timezone = data.timezone;
  round.meetingType = data.meetingType;
  round.status = "scheduled";
  if (data.interviewerName) round.interviewerName = data.interviewerName;
  if (data.interviewerTitle) round.interviewerTitle = data.interviewerTitle;

  // Update interview scheduling status
  const allScheduled = interview.rounds.every((r) => r.status !== "in_progress" && r.scheduledAt);
  interview.schedulingStatus = allScheduled ? "confirmed" : "in_progress";
}
