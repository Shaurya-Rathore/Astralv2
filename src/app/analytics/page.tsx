import { getPipelineStats, getAllScores, getRequests, getInterviews, getCandidatesEnriched } from "@/lib/store";

export default function AnalyticsPage() {
  const stats = getPipelineStats();
  const allScores = getAllScores();
  const requests = getRequests();
  const interviews = getInterviews();
  const candidates = getCandidatesEnriched();

  const resumeScores = allScores.filter((s) => s.category === "resume");
  const interviewScores = allScores.filter((s) => s.category === "interview");
  const combinedScores = allScores.filter((s) => s.category === "combined");

  const avgResume = resumeScores.length > 0 ? Math.round(resumeScores.reduce((s, c) => s + c.score, 0) / resumeScores.length) : 0;
  const avgInterview = interviewScores.length > 0 ? Math.round(interviewScores.reduce((s, c) => s + c.score, 0) / interviewScores.length) : 0;
  const avgCombined = stats.avgCombinedScore;

  const buckets: Record<string, number> = { "90–100": 0, "80–89": 0, "70–79": 0, "60–69": 0, "<60": 0 };
  for (const s of combinedScores) {
    if (s.score >= 90) buckets["90–100"]++;
    else if (s.score >= 80) buckets["80–89"]++;
    else if (s.score >= 70) buckets["70–79"]++;
    else if (s.score >= 60) buckets["60–69"]++;
    else buckets["<60"]++;
  }
  const maxBucket = Math.max(...Object.values(buckets), 1);

  const funnel = [
    { label: "Total Candidates", count: stats.totalCandidates },
    { label: "Screening", count: stats.candidatesByStatus["screening"] ?? 0 },
    { label: "Interviewing", count: stats.candidatesByStatus["interviewing"] ?? 0 },
    { label: "Offer", count: stats.offersExtended },
    { label: "Hired", count: stats.candidatesByStatus["hired"] ?? 0 },
  ];

  const requestPipelines = requests
    .filter((r) => r.status === "approved")
    .map((r) => {
      const cands = candidates.filter((c) => c.links.some((l) => l.requestId === r.id));
      const active = cands.filter((c) => !["rejected", "withdrawn", "inactive"].includes(c.status));
      return { title: r.title, total: cands.length, active: active.length, headcount: r.headcount };
    });

  return (
    <div className="flex flex-col">
      <div className="border-b border-border bg-card px-6 py-5">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Scores & Analytics</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Pipeline health, scoring trends, and hiring velocity</p>
      </div>

      <div className="px-6 py-5 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Open Requests", value: stats.openRequests },
            { label: "Approved HC", value: stats.totalApprovedHeadcount },
            { label: "Active Candidates", value: stats.totalCandidates },
            { label: "Active Interviews", value: stats.activeInterviews },
            { label: "Offers Extended", value: stats.offersExtended },
            { label: "Avg Resume Score", value: avgResume },
            { label: "Avg Interview Score", value: avgInterview },
            { label: "Avg Combined Score", value: avgCombined },
          ].map((card) => (
            <div key={card.label} className="rounded-lg border border-border bg-card p-4">
              <dt className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{card.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{card.value}</dd>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Pipeline funnel */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pipeline Funnel</h2>
            <div className="space-y-3">
              {funnel.map((stage) => (
                <div key={stage.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-foreground">{stage.label}</span>
                    <span className="text-xs font-semibold tabular-nums text-foreground">{stage.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-foreground/60 transition-all" style={{ width: `${funnel[0].count > 0 ? (stage.count / funnel[0].count) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Score distribution */}
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Combined Score Distribution</h2>
            <div className="space-y-2.5">
              {Object.entries(buckets).map(([range, count]) => (
                <div key={range}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-foreground">{range}</span>
                    <span className="text-xs font-semibold tabular-nums text-foreground">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full transition-all ${
                      range === "90–100" ? "bg-emerald-500" : range === "80–89" ? "bg-emerald-400" : range === "70–79" ? "bg-amber-400" : range === "60–69" ? "bg-orange-400" : "bg-red-400"
                    }`} style={{ width: `${(count / maxBucket) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {combinedScores.length === 0 && <p className="mt-3 text-xs text-muted-foreground">No combined scores yet.</p>}
          </section>
        </div>

        {/* Per-request pipeline */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pipeline by Request</h2>
          <div className="overflow-hidden rounded-md border border-border-subtle">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-muted/50">
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Request</th>
                  <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">HC</th>
                  <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active</th>
                  <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fill Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {requestPipelines.map((r) => (
                  <tr key={r.title}>
                    <td className="px-4 py-2.5 text-xs font-medium text-foreground">{r.title}</td>
                    <td className="px-4 py-2.5 text-right text-xs tabular-nums text-foreground">{r.headcount}</td>
                    <td className="px-4 py-2.5 text-right text-xs tabular-nums text-foreground">{r.total}</td>
                    <td className="px-4 py-2.5 text-right text-xs tabular-nums text-foreground">{r.active}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`text-xs font-semibold tabular-nums ${r.active >= r.headcount ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {r.headcount > 0 ? Math.round((r.active / r.headcount) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
