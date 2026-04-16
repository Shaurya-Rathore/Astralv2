"use client";

import Link from "next/link";
import { createRequest, addSkillToRequest } from "@/lib/store";
import { RequestForm } from "@/components/request-form";
import type { RequestFormData } from "@/components/request-form";
import type { RequestSkill } from "@/lib/types";

export default function NewRequestPage() {
  function handleSave(data: RequestFormData, skills: RequestSkill[]): string {
    const req = createRequest({
      ...data,
      isReplacement: data.isReplacement,
      replacingWhom: data.replacingWhom || null,
      replacementReason: data.replacementReason || null,
      scopeChanged: data.scopeChanged || null,
      idealCandidateProfile: data.idealCandidateProfile || null,
      evaluationCriteria: data.evaluationCriteria ? data.evaluationCriteria.split("\n").filter(Boolean) : [],
      dealbreakers: data.dealbreakers ? data.dealbreakers.split("\n").filter(Boolean) : [],
    } as Parameters<typeof createRequest>[0]);
    for (const s of skills) {
      addSkillToRequest(req.id, s.name, s.required, s.yearsMin);
    }
    return req.id;
  }

  return (
    <div className="flex flex-col">
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
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          New Hiring Request
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Fill in the details to create a new hiring request.
        </p>
      </div>

      <div className="max-w-3xl px-6 py-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <RequestForm onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
