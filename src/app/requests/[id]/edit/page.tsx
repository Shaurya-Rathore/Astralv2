"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getRequestById, updateRequest, addSkillToRequest, removeSkillFromRequest } from "@/lib/store";
import { RequestForm } from "@/components/request-form";
import type { RequestFormData } from "@/components/request-form";
import type { RequestSkill } from "@/lib/types";

export default function EditRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const request = getRequestById(id);
  if (!request) notFound();

  function handleSave(data: RequestFormData, skills: RequestSkill[]): string {
    updateRequest(id, {
      ...data,
      isReplacement: data.isReplacement,
      replacingWhom: data.replacingWhom || null,
      replacementReason: data.replacementReason || null,
      scopeChanged: data.scopeChanged || null,
      idealCandidateProfile: data.idealCandidateProfile || null,
      evaluationCriteria: data.evaluationCriteria ? data.evaluationCriteria.split("\n").filter(Boolean) : [],
      dealbreakers: data.dealbreakers ? data.dealbreakers.split("\n").filter(Boolean) : [],
    });

    // Sync skills: remove old ones, add new ones
    const current = getRequestById(id);
    const oldIds = current?.skills.map((s) => s.id) ?? [];
    const newIds = skills.map((s) => s.id);
    for (const oldId of oldIds) {
      if (!newIds.includes(oldId)) removeSkillFromRequest(id, oldId);
    }
    for (const skill of skills) {
      if (!oldIds.includes(skill.id)) {
        addSkillToRequest(id, skill.name, skill.required, skill.yearsMin);
      }
    }
    return id;
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-card px-6 py-5">
        <Link
          href={`/requests/${id}`}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10 12 6 8 10 4" />
          </svg>
          Back to Request
        </Link>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          Edit: {request.title}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {request.department} · {request.team}
        </p>
      </div>

      <div className="max-w-3xl px-6 py-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <RequestForm initial={request} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
