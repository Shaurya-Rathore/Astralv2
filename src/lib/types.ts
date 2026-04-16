// ─── Enums & Literals ────────────────────────────────────────────────────────

export type RequestStatus = "draft" | "pending_approval" | "approved" | "rejected" | "on_hold" | "filled" | "cancelled";
export type RequestPriority = "critical" | "high" | "medium" | "low";
export type EmploymentType = "full_time" | "part_time" | "contract" | "intern";

export type CandidateStatus = "new" | "screening" | "interviewing" | "offer" | "hired" | "rejected" | "withdrawn" | "inactive" | "reactivated";
export type CandidateMatchStrength = "strong" | "moderate" | "weak";

export type InterviewStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
export type InterviewType = "phone_screen" | "technical" | "behavioral" | "system_design" | "hiring_manager" | "panel" | "culture_fit";

export type OutreachChannel = "email" | "linkedin" | "phone" | "referral" | "internal";
export type OutreachOutcome = "sent" | "opened" | "replied" | "interested" | "declined" | "no_response" | "bounced";

export type LinkedInPostStatus = "not_posted" | "draft" | "scheduled" | "posted";
export type SchedulingStatus = "not_started" | "in_progress" | "confirmed" | "needs_reschedule";

export type ScopeChange = "same" | "expanded" | "reduced";
export type ScoreCategory = "resume" | "interview" | "combined";

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Request {
  id: string;
  title: string;
  department: string;
  team: string;
  hiringManagerId: string;
  hiringManagerName: string;
  status: RequestStatus;
  priority: RequestPriority;
  employmentType: EmploymentType;
  location: string;
  remote: boolean;
  headcount: number;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  description: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  targetStartDate: string;
  linkedInPostStatus: LinkedInPostStatus;
  isReplacement: boolean;
  replacingWhom: string | null;
  replacementReason: string | null;
  scopeChanged: ScopeChange | null;
  idealCandidateProfile: string | null;
  evaluationCriteria: string[];
  dealbreakers: string[];
  skills: RequestSkill[];
}

export interface RequestSkill {
  id: string;
  requestId: string;
  name: string;
  required: boolean;
  yearsMin: number | null;
}

export interface RequestApproval {
  id: string;
  requestId: string;
  approverName: string;
  approverRole: string;
  status: "pending" | "approved" | "rejected";
  comment: string | null;
  decidedAt: string | null;
  createdAt: string;
}

// ─── Candidates ──────────────────────────────────────────────────────────────

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentTitle: string;
  currentCompany: string;
  location: string;
  linkedinUrl: string | null;
  githubUsername: string | null;
  yearsExperience: number;
  status: CandidateStatus;
  source: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateReqLink {
  id: string;
  candidateId: string;
  requestId: string;
  matchStrength: CandidateMatchStrength;
  matchReason: string;
  appliedAt: string;
  status: CandidateStatus;
}

export interface CandidateResume {
  id: string;
  candidateId: string;
  fileName: string;
  uploadedAt: string;
  summary: string;
  skills: string[];
  education: { institution: string; degree: string; field: string; year: number }[];
  experience: { company: string; title: string; startYear: number; endYear: number | null; highlights: string[] }[];
}

export interface CandidateScore {
  id: string;
  candidateId: string;
  requestId: string;
  category: ScoreCategory;
  score: number; // 0–100
  breakdown: { label: string; score: number; weight: number }[];
  scoredAt: string;
  scoredBy: string;
}

export interface CandidateStatusHistory {
  id: string;
  candidateId: string;
  requestId: string | null;
  fromStatus: CandidateStatus | null;
  toStatus: CandidateStatus;
  changedBy: string;
  note: string | null;
  changedAt: string;
}

// ─── Interviews ──────────────────────────────────────────────────────────────

export interface Interview {
  id: string;
  candidateId: string;
  requestId: string;
  status: InterviewStatus;
  scheduledAt: string;
  durationMinutes: number;
  location: string | null; // null = virtual
  meetingLink: string | null;
  createdAt: string;
  schedulingStatus: SchedulingStatus;
  schedulingNotes: string | null;
  rounds: InterviewRound[];
}

export type MeetingType = "video" | "phone" | "in_person";

export interface InterviewRound {
  id: string;
  interviewId: string;
  type: InterviewType;
  interviewerName: string;
  interviewerTitle: string;
  order: number;
  status: InterviewStatus;
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  meetingType: MeetingType;
  feedback: InterviewFeedback | null;
}

export interface InterviewFeedback {
  id: string;
  roundId: string;
  interviewerName: string;
  overallScore: number; // 1–5
  recommendation: "strong_hire" | "hire" | "lean_hire" | "lean_no_hire" | "no_hire";
  strengths: string[];
  concerns: string[];
  notes: string;
  submittedAt: string;
}

// ─── Outreach ────────────────────────────────────────────────────────────────

export interface OutreachEvent {
  id: string;
  candidateId: string;
  requestId: string | null;
  channel: OutreachChannel;
  outcome: OutreachOutcome;
  subject: string;
  body: string | null;
  sentBy: string;
  sentAt: string;
  respondedAt: string | null;
}

// ─── GitHub Enrichment ───────────────────────────────────────────────────────

export interface GitHubInferredSkill {
  skill: string;
  confidence: number; // 0–1
  evidence: string;
}

// ─── Reactivation ────────────────────────────────────────────────────────────

export type ReactivationLabel =
  | "Strong Prior Interview"
  | "Silver Medalist"
  | "Final Round Previously"
  | "Rejected for Timing";

export interface EnrichedCandidate extends Candidate {
  links: CandidateReqLink[];
  resume: CandidateResume | null;
  bestCombinedScore: number | null;
  scores: CandidateScore[];
  hasResume: boolean;
}

export interface ReactivationSuggestion {
  candidate: Candidate;
  link: CandidateReqLink;
  requestTitle: string;
  labels: ReactivationLabel[];
  bestScore: number | null;
}

// ─── GitHub Enrichment ───────────────────────────────────────────────────────

export interface GitHubProfile {
  username: string;
  inferredSkills: GitHubInferredSkill[];
  repoHighlights: { name: string; description: string; language: string; stars: number }[];
  languagesSummary: Record<string, number>; // language → % of repos
  activitySummary: string;
  caveats: string[];
}
