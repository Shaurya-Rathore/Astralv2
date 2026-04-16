import { notFound } from "next/navigation";
import Link from "next/link";
import { getRequestById, getApprovalsByRequest, getCandidatesByRequest } from "@/lib/store";
import { RequestStatusChip, PriorityChip, EmploymentTypeChip, CandidateStatusChip } from "@/components/ui/chips";
import { ApprovalProgress } from "@/components/ui/approval-progress";
import { LinkedInPostAction } from "@/components/ui/placeholder-action";
import { RequestStatusActions } from "@/components/request-status-actions";
import { canViewCompensation, canEditRequest } from "@/lib/auth";

function formatSalary(min: number, max: number, currency: string) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  return `${fmt(min)} – ${fmt(max)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = getRequestById(id);
  if (!request) notFound();

  const approvals = getApprovalsByRequest(id);
  const candidates = getCandidatesByRequest(id);

  return (
    <div className="flex flex-col">
      {/* Back nav + header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <Link
          href="/requests"
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10 12 6 8 10 4" />
          </svg>
          All Requests
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">
                {request.title}
              </h1>
              <RequestStatusChip status={request.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {request.department} · {request.team} · {request.hiringManagerName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PriorityChip priority={request.priority} />
            <EmploymentTypeChip type={request.employmentType} />
            {canEditRequest() && (
              <Link
                href={`/requests/${id}/edit`}
                className="rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Edit
              </Link>
            )}
          </div>
        </div>

        <div className="mt-3">
          <RequestStatusActions requestId={id} currentStatus={request.status} />
        </div>
      </div>

      {/* Body — two column layout */}
      <div className="grid grid-cols-3 gap-6 px-6 py-6">
        {/* Left column — main info */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </h2>
            <p className="text-sm leading-relaxed text-foreground">
              {request.description}
            </p>
          </section>

          {/* Ideal Candidate Profile (for resume reviewers) */}
          {(request.idealCandidateProfile || request.evaluationCriteria.length > 0 || request.dealbreakers.length > 0) && (
            <section className="rounded-lg border border-blue-200 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20 p-5">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ideal Candidate Profile
                </h2>
                <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-400">
                  For Resume Review
                </span>
              </div>
              {request.idealCandidateProfile && (
                <p className="text-sm leading-relaxed text-foreground">
                  {request.idealCandidateProfile}
                </p>
              )}
              {request.evaluationCriteria.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-1.5 text-[11px] font-semibold text-muted-foreground">Evaluation Criteria</h3>
                  <ul className="space-y-1">
                    {request.evaluationCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {request.dealbreakers.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400">Dealbreakers</h3>
                  <ul className="space-y-1">
                    {request.dealbreakers.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Skills */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Required Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {request.skills.map((skill) => (
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
                    <span className="text-[10px] opacity-60">
                      {skill.yearsMin}+ yr
                    </span>
                  )}
                  {skill.required && (
                    <span className="text-[9px] font-bold uppercase text-red-500">
                      req
                    </span>
                  )}
                </span>
              ))}
            </div>
          </section>

          {/* Matched Candidates */}
          <section className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Matched Candidates
              </h2>
              <span className="text-xs tabular-nums text-muted-foreground">
                {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
              </span>
            </div>

            {candidates.length > 0 ? (
              <div className="divide-y divide-border-subtle">
                {candidates.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <Link href={`/candidates/${c.id}`} className="flex items-center gap-3 group/cand">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground group-hover/cand:underline">
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {c.currentTitle} at {c.currentCompany}
                        </span>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          c.link.matchStrength === "strong"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : c.link.matchStrength === "moderate"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                        }`}
                      >
                        {c.link.matchStrength}
                      </span>
                      <CandidateStatusChip status={c.link.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No candidates matched to this request yet.
              </p>
            )}
          </section>
        </div>

        {/* Right column — metadata + approval */}
        <div className="space-y-6">
          {/* Key details */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground">Headcount</dt>
                <dd className="text-sm font-medium text-foreground">{request.headcount}</dd>
              </div>
              {canViewCompensation() && (
                <div>
                  <dt className="text-[11px] font-medium text-muted-foreground">Compensation</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {formatSalary(request.salaryMin, request.salaryMax, request.currency)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground">Location</dt>
                <dd className="text-sm text-foreground">
                  {request.location}
                  {request.remote && (
                    <span className="ml-1.5 text-xs text-muted-foreground">(Remote OK)</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground">Target Start</dt>
                <dd className="text-sm text-foreground">{formatDate(request.targetStartDate)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground">Created</dt>
                <dd className="text-sm text-foreground">{formatDate(request.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-muted-foreground">Last Updated</dt>
                <dd className="text-sm text-foreground">{formatDate(request.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          {/* Replacement info */}
          {request.isReplacement && (
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Replacement Details
              </h2>
              <dl className="space-y-3">
                {request.replacingWhom && (
                  <div>
                    <dt className="text-[11px] font-medium text-muted-foreground">Replacing</dt>
                    <dd className="text-sm font-medium text-foreground">{request.replacingWhom}</dd>
                  </div>
                )}
                {request.scopeChanged && (
                  <div>
                    <dt className="text-[11px] font-medium text-muted-foreground">Scope</dt>
                    <dd className="text-sm text-foreground">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${
                        request.scopeChanged === "same"
                          ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          : request.scopeChanged === "expanded"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      }`}>
                        {request.scopeChanged === "same" ? "Same scope" : request.scopeChanged === "expanded" ? "Expanded scope" : "Reduced scope"}
                      </span>
                    </dd>
                  </div>
                )}
                {request.replacementReason && (
                  <div>
                    <dt className="text-[11px] font-medium text-muted-foreground">Reason</dt>
                    <dd className="text-sm leading-relaxed text-foreground">{request.replacementReason}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Approval chain */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Approval Chain
            </h2>
            <ApprovalProgress approvals={approvals} />
          </section>

          {/* LinkedIn posting placeholder */}
          {request.status === "approved" && (
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Job Posting
              </h2>
              <LinkedInPostAction status={request.linkedInPostStatus} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
