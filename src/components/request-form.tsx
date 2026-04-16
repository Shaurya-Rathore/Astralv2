"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Request, RequestPriority, EmploymentType, RequestSkill, ScopeChange } from "@/lib/types";
import { canViewCompensation } from "@/lib/auth";

interface RequestFormProps {
  initial?: Request;
  onSave: (data: RequestFormData, skills: RequestSkill[]) => string; // returns request id
}

export interface RequestFormData {
  title: string;
  department: string;
  team: string;
  hiringManagerId: string;
  hiringManagerName: string;
  priority: RequestPriority;
  employmentType: EmploymentType;
  location: string;
  remote: boolean;
  headcount: number;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  description: string;
  targetStartDate: string;
  isReplacement: boolean;
  replacingWhom: string;
  replacementReason: string;
  scopeChanged: ScopeChange | "";
  idealCandidateProfile: string;
  evaluationCriteria: string;
  dealbreakers: string;
}

const PRIORITY_OPTIONS: { value: RequestPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
];

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";
const labelClass = "block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1";
const selectClass =
  "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export function RequestForm({ initial, onSave }: RequestFormProps) {
  const router = useRouter();
  const showComp = canViewCompensation();

  const [form, setForm] = useState<RequestFormData>({
    title: initial?.title ?? "",
    department: initial?.department ?? "",
    team: initial?.team ?? "",
    hiringManagerId: initial?.hiringManagerId ?? "hm-001",
    hiringManagerName: initial?.hiringManagerName ?? "",
    priority: initial?.priority ?? "medium",
    employmentType: initial?.employmentType ?? "full_time",
    location: initial?.location ?? "",
    remote: initial?.remote ?? true,
    headcount: initial?.headcount ?? 1,
    salaryMin: initial?.salaryMin ?? 100000,
    salaryMax: initial?.salaryMax ?? 150000,
    currency: initial?.currency ?? "USD",
    description: initial?.description ?? "",
    targetStartDate: initial?.targetStartDate ?? "",
    isReplacement: initial?.isReplacement ?? false,
    replacingWhom: initial?.replacingWhom ?? "",
    replacementReason: initial?.replacementReason ?? "",
    scopeChanged: initial?.scopeChanged ?? "",
    idealCandidateProfile: initial?.idealCandidateProfile ?? "",
    evaluationCriteria: initial?.evaluationCriteria?.join("\n") ?? "",
    dealbreakers: initial?.dealbreakers?.join("\n") ?? "",
  });

  // ─── Skill editor state ──────────────────────────────────────────────────
  const [skills, setSkills] = useState(initial?.skills ?? []);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillRequired, setNewSkillRequired] = useState(true);
  const [newSkillYears, setNewSkillYears] = useState("");

  function addSkill() {
    if (!newSkillName.trim()) return;
    setSkills((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        requestId: initial?.id ?? "new",
        name: newSkillName.trim(),
        required: newSkillRequired,
        yearsMin: newSkillYears ? parseInt(newSkillYears, 10) : null,
      },
    ]);
    setNewSkillName("");
    setNewSkillYears("");
  }

  function removeSkill(id: string) {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  function set<K extends keyof RequestFormData>(key: K, value: RequestFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = onSave(form, skills);
    router.push(`/requests/${id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title + Department row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Job Title</label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Senior Frontend Engineer"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Department</label>
          <input
            className={inputClass}
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
            placeholder="Engineering"
            required
          />
        </div>
      </div>

      {/* Team + Hiring Manager */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Team</label>
          <input
            className={inputClass}
            value={form.team}
            onChange={(e) => set("team", e.target.value)}
            placeholder="Web Platform"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Hiring Manager</label>
          <input
            className={inputClass}
            value={form.hiringManagerName}
            onChange={(e) => set("hiringManagerName", e.target.value)}
            placeholder="Sarah Chen"
            required
          />
        </div>
      </div>

      {/* Priority + Type + Headcount */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Priority</label>
          <select
            className={selectClass}
            value={form.priority}
            onChange={(e) => set("priority", e.target.value as RequestPriority)}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Employment Type</label>
          <select
            className={selectClass}
            value={form.employmentType}
            onChange={(e) => set("employmentType", e.target.value as EmploymentType)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Headcount</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={form.headcount}
            onChange={(e) => set("headcount", parseInt(e.target.value, 10) || 1)}
          />
        </div>
      </div>

      {/* Location + Remote */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Location</label>
          <input
            className={inputClass}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="San Francisco, CA"
            required
          />
        </div>
        <div className="flex items-end gap-2 pb-0.5">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.remote}
              onChange={(e) => set("remote", e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Remote OK
          </label>
        </div>
      </div>

      {/* Compensation — only for comp-visible roles */}
      {showComp && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Salary Min</label>
            <input
              type="number"
              className={inputClass}
              value={form.salaryMin}
              onChange={(e) => set("salaryMin", parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div>
            <label className={labelClass}>Salary Max</label>
            <input
              type="number"
              className={inputClass}
              value={form.salaryMax}
              onChange={(e) => set("salaryMax", parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <input
              className={inputClass}
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Target Start Date */}
      <div className="max-w-xs">
        <label className={labelClass}>Target Start Date</label>
        <input
          type="date"
          className={inputClass}
          value={form.targetStartDate}
          onChange={(e) => set("targetStartDate", e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the role, responsibilities, and what success looks like..."
          required
          rows={3}
        />
      </div>

      {/* ─── Semantic Candidate Profile (for resume reviewers) ─────────── */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ideal Candidate Profile
          </h3>
          <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400">
            For Resume Review
          </span>
        </div>
        <div>
          <label className={labelClass}>What does the ideal candidate look like?</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={form.idealCandidateProfile}
            onChange={(e) => set("idealCandidateProfile", e.target.value)}
            placeholder="Describe the ideal candidate beyond just skills — what experience, mindset, and track record should a reviewer look for in resumes?"
            rows={3}
          />
        </div>
        <div>
          <label className={labelClass}>Evaluation Criteria (one per line)</label>
          <textarea
            className={`${inputClass} min-h-[60px] resize-y`}
            value={form.evaluationCriteria}
            onChange={(e) => set("evaluationCriteria", e.target.value)}
            placeholder={"Shipped production ML models at >1K QPS\nEnd-to-end ML lifecycle ownership\nFeature engineering rigor"}
            rows={3}
          />
        </div>
        <div>
          <label className={labelClass}>Dealbreakers (one per line)</label>
          <textarea
            className={`${inputClass} min-h-[60px] resize-y`}
            value={form.dealbreakers}
            onChange={(e) => set("dealbreakers", e.target.value)}
            placeholder={"Only notebook/research experience, no production\nCannot explain latency vs throughput trade-offs"}
            rows={2}
          />
        </div>
      </div>

      {/* ─── Replacement Info ─────────────────────────────────────────── */}
      <div className="space-y-4 rounded-lg border border-border-subtle bg-muted/30 p-4">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isReplacement}
            onChange={(e) => set("isReplacement", e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          This is a replacement hire
        </label>

        {form.isReplacement && (
          <div className="space-y-4 pl-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Replacing Whom</label>
                <input
                  className={inputClass}
                  value={form.replacingWhom}
                  onChange={(e) => set("replacingWhom", e.target.value)}
                  placeholder="Name of departing employee"
                />
              </div>
              <div>
                <label className={labelClass}>Scope Change</label>
                <select
                  className={selectClass}
                  value={form.scopeChanged}
                  onChange={(e) => set("scopeChanged", e.target.value as ScopeChange | "")}
                >
                  <option value="">Select...</option>
                  <option value="same">Same scope</option>
                  <option value="expanded">Expanded scope</option>
                  <option value="reduced">Reduced scope</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Reason for Replacement</label>
              <textarea
                className={`${inputClass} min-h-[60px] resize-y`}
                value={form.replacementReason}
                onChange={(e) => set("replacementReason", e.target.value)}
                placeholder="Why is this role being backfilled? Include context for approvers."
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── Skills Editor ──────────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>Skills</label>
        {skills.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${
                  skill.required
                    ? "bg-foreground/5 text-foreground ring-1 ring-foreground/10"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {skill.name}
                {skill.yearsMin && (
                  <span className="text-[10px] opacity-60">{skill.yearsMin}+ yr</span>
                )}
                {skill.required && (
                  <span className="text-[9px] font-bold uppercase text-red-500">req</span>
                )}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="ml-0.5 text-muted-foreground hover:text-foreground"
                >
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="3" x2="9" y2="9" />
                    <line x1="9" y1="3" x2="3" y2="9" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <input
              className={inputClass}
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Skill name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
          </div>
          <div className="w-20">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={newSkillYears}
              onChange={(e) => setNewSkillYears(e.target.value)}
              placeholder="Yrs"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-foreground whitespace-nowrap">
            <input
              type="checkbox"
              checked={newSkillRequired}
              onChange={(e) => setNewSkillRequired(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border"
            />
            Required
          </label>
          <button
            type="button"
            onClick={addSkill}
            className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Add
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 border-t border-border pt-5">
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          {initial ? "Save Changes" : "Create Request"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
