/**
 * Calendar provider abstraction.
 *
 * Generates ICS content and provider-specific URLs for demo.
 * Swap generateCalendarUrl to use real Google Calendar / Microsoft
 * Graph API when OAuth is available.
 */

export type CalendarProvider = "google" | "outlook" | "ics";

interface CalendarEvent {
  title: string;
  description: string;
  startTime: string; // ISO 8601
  durationMinutes: number;
  location: string | null;
  timezone: string;
}

function toICSDate(isoDate: string): string {
  return new Date(isoDate).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function addMinutes(isoDate: string, minutes: number): string {
  const d = new Date(isoDate);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

/** Generate a downloadable ICS file content string */
export function generateICS(event: CalendarEvent): string {
  const start = toICSDate(event.startTime);
  const end = toICSDate(addMinutes(event.startTime, event.durationMinutes));
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Astral//Hiring Control Tower//EN",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location ?? "Virtual"}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Generate a Google Calendar "Add Event" URL */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const start = toICSDate(event.startTime);
  const end = toICSDate(addMinutes(event.startTime, event.durationMinutes));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
    location: event.location ?? "Virtual",
    ctz: event.timezone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Generate an Outlook Web "Add Event" URL */
export function generateOutlookUrl(event: CalendarEvent): string {
  const start = new Date(event.startTime).toISOString();
  const end = addMinutes(event.startTime, event.durationMinutes);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    body: event.description,
    startdt: start,
    enddt: end,
    location: event.location ?? "Virtual",
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/** Trigger ICS file download in the browser */
export function downloadICS(event: CalendarEvent, filename: string = "interview.ics"): void {
  const content = generateICS(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Provider router — returns a URL or triggers download based on provider.
 *
 * In production, replace the google/outlook branches with real OAuth-based
 * calendar API calls (Google Calendar API v3, Microsoft Graph /me/events).
 */
export function addToCalendar(event: CalendarEvent, provider: CalendarProvider): string | void {
  switch (provider) {
    case "google":
      return generateGoogleCalendarUrl(event);
    case "outlook":
      return generateOutlookUrl(event);
    case "ics":
      downloadICS(event);
      return;
  }
}
