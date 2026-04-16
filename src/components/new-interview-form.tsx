"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInterview } from "@/lib/store";
import type { InterviewType, MeetingType } from "@/lib/types";

interface NewInterviewFormProps {
  candidateId: string;
  requestOptions: { id: string; title: string }[];
}

const ROUND_TYPES: { value: InterviewType; label: string }[] = [
  { value: "phone_screen", label: "Phone Screen" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "system_design", label: "System Design" },
  { value: "hiring_manager", label: "Hiring Manager" },
  { value: "panel", label: "Panel" },
  { value: "culture_fit", label: "Culture Fit" },
];

const inputClass = "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";
const selectClass = "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export function NewInterviewForm({ candidateId, requestOptions }: NewInterviewFormProps) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [requestId, setRequestId] = useState(requestOptions[0]?.id ?? "");
  const [roundType, setRoundType] = useState<InterviewType>("phone_screen");
  const [interviewerName, setInterviewerName] = useState("");
  const [interviewerTitle, setInterviewerTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [meetingType, setMeetingType] = useState<MeetingType>("video");
  const router = useRouter();

  function handleCreate() {
    if (!requestId || !interviewerName || !scheduledAt) return;
    createInterview({
      candidateId,
      requestId,
      rounds: [{
        type: roundType,
        interviewerName,
        interviewerTitle: interviewerTitle || "Interviewer",
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        meetingType,
      }],
    });
    setDone(true);
    setOpen(false);
    router.refresh();
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="2.5 6 5 8.5 9.5 3.5" /></svg>
        Interview Scheduled
      </span>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
      >
        + New Interview
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Schedule Interview</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Request</label>
          <select className={selectClass} value={requestId} onChange={(e) => setRequestId(e.target.value)}>
            {requestOptions.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Round Type</label>
          <select className={selectClass} value={roundType} onChange={(e) => setRoundType(e.target.value as InterviewType)}>
            {ROUND_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Interviewer Name</label>
          <input className={inputClass} value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} placeholder="Jane Smith" required />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Interviewer Title</label>
          <input className={inputClass} value={interviewerTitle} onChange={(e) => setInterviewerTitle(e.target.value)} placeholder="Senior Engineer" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Date & Time</label>
          <input type="datetime-local" className={inputClass} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Duration</label>
          <select className={selectClass} value={duration} onChange={(e) => setDuration(parseInt(e.target.value, 10))}>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Meeting Type</label>
          <select className={selectClass} value={meetingType} onChange={(e) => setMeetingType(e.target.value as MeetingType)}>
            <option value="video">Video</option>
            <option value="phone">Phone</option>
            <option value="in_person">In Person</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleCreate} className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90">Schedule</button>
        <button onClick={() => setOpen(false)} className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">Cancel</button>
      </div>
    </div>
  );
}
