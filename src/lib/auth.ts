/**
 * Minimal role-based access model.
 *
 * For the demo, currentUser is a module-level singleton.
 * Swap to session/cookie/JWT when a real auth layer exists.
 */

export type UserRole = "recruiter" | "request_creator" | "approver" | "interviewer" | "admin";

export interface AppUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  title: string;
}

// ─── Current user (change role here to demo different views) ─────────────────

export const currentUser: AppUser = {
  id: "user-001",
  name: "Priya Patel",
  initials: "PP",
  email: "priya.patel@astral.com",
  role: "recruiter",
  title: "Senior Recruiter",
};

// ─── Permission helpers ──────────────────────────────────────────────────────

const COMP_ROLES: UserRole[] = ["recruiter", "request_creator", "approver", "admin"];

export function canViewCompensation(role: UserRole = currentUser.role): boolean {
  return COMP_ROLES.includes(role);
}

export function canEditRequest(role: UserRole = currentUser.role): boolean {
  return ["recruiter", "request_creator", "admin"].includes(role);
}

export function canApproveRequest(role: UserRole = currentUser.role): boolean {
  return ["approver", "admin"].includes(role);
}

export function canUpdateCandidateStatus(role: UserRole = currentUser.role): boolean {
  return ["recruiter", "admin"].includes(role);
}
