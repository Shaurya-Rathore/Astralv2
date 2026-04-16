"use client";

import { useState } from "react";
import { submitRoundFeedback, scheduleRound } from "@/lib/store";
import { generateGoogleCalendarUrl, downloadICS } from "@/lib/calendar";
import type { InterviewFeedback, MeetingType } from "@/lib/types";

const inputClass = "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";
const labelClass = "block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1";
const selectClass = "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

// ─── Score / Feedback Panel ──────────────────────────────────────────────────

interface ScorePanelProps {
  interviewId: string;
  roundId: string;
  interviewerName: string;
  candidateName: string;
  roundType: string;
  onDone: () => void;
}

export function ScorePanel({ interviewId, roundId, interviewerName, candidateName, roundType, onDone }: ScorePanelProps) {
  const [score, setScore] = useState(3);
  const [rec, setRec] = useState<InterviewFeedback["recommendation"]>("hire");
  const [strengths, setStrengths] = useState("");
  const [concerns, setConcerns] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitRoundFeedback(interviewId, roundId, {
      overallScore: score,
      recommendation: rec,
      strengths: strengths.split("\n").filter(Boolean),
      concerns: concerns.split("\n").filter(Boolean),
      notes,
      interviewerName,
    });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-2">
        <p className="text-xs text-muted-foreground">
          Scoring <span className="font-medium text-foreground">{candidateName}</span> — {roundType}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Overall Score (1–5)</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setScore(n)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                  score === n
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Recommendation</label>
          <select className={selectClass} value={rec} onChange={(e) => setRec(e.target.value as InterviewFeedback["recommendation"])}>
            <option value="strong_hire">Strong Hire</option>
            <option value="hire">Hire</option>
            <option value="lean_hire">Lean Hire</option>
            <option value="lean_no_hire">Lean No Hire</option>
            <option value="no_hire">No Hire</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Strengths (one per line)</label>
        <textarea className={`${inputClass} min-h-[50px] resize-y`} value={strengths} onChange={(e) => setStrengths(e.target.value)} placeholder={"Clear communicator\nDeep technical knowledge"} rows={2} />
      </div>

      <div>
        <label className={labelClass}>Concerns (one per line)</label>
        <textarea className={`${inputClass} min-h-[50px] resize-y`} value={concerns} onChange={(e) => setConcerns(e.target.value)} placeholder="Limited experience with X" rows={2} />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea className={`${inputClass} min-h-[50px] resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Overall assessment and context..." rows={2} required />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="rounded-md bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90">
          Submit Score
        </button>
        <button type="button" onClick={onDone} className="rounded-md px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Schedule Panel ──────────────────────────────────────────────────────────

interface SchedulePanelProps {
  interviewId: string;
  roundId: string;
  candidateName: string;
  requestTitle: string;
  roundType: string;
  currentInterviewer: string;
  currentDate: string;
  currentDuration: number;
  onDone: () => void;
}

export function SchedulePanel({
  interviewId, roundId, candidateName, requestTitle, roundType,
  currentInterviewer, currentDate, currentDuration, onDone,
}: SchedulePanelProps) {
  const [date, setDate] = useState(currentDate ? currentDate.slice(0, 10) : "");
  const [time, setTime] = useState(currentDate ? currentDate.slice(11, 16) : "10:00");
  const [duration, setDuration] = useState(currentDuration || 60);
  const [tz, setTz] = useState("America/Los_Angeles");
  const [meeting, setMeeting] = useState<MeetingType>("video");
  const [interviewer, setInterviewer] = useState(currentInterviewer);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const scheduledAt = `${date}T${time}:00Z`;
    scheduleRound(interviewId, roundId, {
      scheduledAt,
      durationMinutes: duration,
      timezone: tz,
      meetingType: meeting,
      interviewerName: interviewer || undefined,
    });
    setSaved(true);
  }

  function handleAddToGoogle() {
    const scheduledAt = `${date}T${time}:00Z`;
    const url = generateGoogleCalendarUrl({
      title: `Interview: ${candidateName} — ${roundType}`,
      description: `${requestTitle}\nRound: ${roundType}\nInterviewer: ${interviewer}`,
      startTime: scheduledAt,
      durationMinutes: duration,
      location: meeting === "in_person" ? "Office" : null,
      timezone: tz,
    });
    window.open(url, "_blank");
  }

  function handleDownloadICS() {
    const scheduledAt = `${date}T${time}:00Z`;
    downloadICS({
      title: `Interview: ${candidateName} — ${roundType}`,
      description: `${requestTitle}\nRound: ${roundType}\nInterviewer: ${interviewer}`,
      startTime: scheduledAt,
      durationMinutes: duration,
      location: meeting === "in_person" ? "Office" : null,
      timezone: tz,
    }, `interview-${candidateName.replace(/\s/g, "-").toLowerCase()}.ics`);
  }

  if (saved) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="2.5 6 5 8.5 9.5 3.5" /></svg>
            Scheduled
          </span>
          <span className="text-xs text-muted-foreground">{date} at {time} · {duration}min · {meeting}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAddToGoogle} className="rounded-md border border-border px-3 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted">
            Add to Google Calendar
          </button>
          <button onClick={handleDownloadICS} className="rounded-md border border-border px-3 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-muted">
            Download .ics
          </button>
          <button onClick={onDone} className="rounded-md px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Schedule <span className="font-medium text-foreground">{candidateName}</span> — {roundType} for {requestTitle}
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Time</label>
          <input type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Duration</label>
          <select className={selectClass} value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
            <option value={90}>90 min</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Timezone</label>
          <select className={selectClass} value={tz} onChange={(e) => setTz(e.target.value)}>
            <option value="America/Los_Angeles">Pacific</option>
            <option value="America/Denver">Mountain</option>
            <option value="America/Chicago">Central</option>
            <option value="America/New_York">Eastern</option>
            <option value="Europe/London">GMT</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Meeting Type</label>
          <select className={selectClass} value={meeting} onChange={(e) => setMeeting(e.target.value as MeetingType)}>
            <option value="video">Video</option>
            <option value="phone">Phone</option>
            <option value="in_person">In Person</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Interviewer</label>
          <input className={inputClass} value={interviewer} onChange={(e) => setInterviewer(e.target.value)} placeholder="Name" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="rounded-md bg-foreground px-4 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90">
          Confirm Schedule
        </button>
        <button type="button" onClick={onDone} className="rounded-md px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
}
