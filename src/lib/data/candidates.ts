import type {
  Candidate,
  CandidateReqLink,
  CandidateResume,
  CandidateScore,
  CandidateStatusHistory,
} from "../types";

// ─── Candidates ──────────────────────────────────────────────────────────────

export const candidates: Candidate[] = [
  {
    id: "cand-001",
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex.rivera@gmail.com",
    phone: "+1-415-555-0101",
    currentTitle: "Senior Frontend Engineer",
    currentCompany: "Stripe",
    location: "San Francisco, CA",
    linkedinUrl: "https://linkedin.com/in/alexrivera",
    githubUsername: "arivera-dev",
    yearsExperience: 7,
    status: "interviewing",
    source: "linkedin",
    avatarUrl: null,
    createdAt: "2026-02-18T10:00:00Z",
    updatedAt: "2026-03-20T14:00:00Z",
  },
  {
    id: "cand-002",
    firstName: "Jordan",
    lastName: "Okafor",
    email: "jordan.okafor@outlook.com",
    phone: "+1-646-555-0202",
    currentTitle: "Frontend Engineer II",
    currentCompany: "Datadog",
    location: "Brooklyn, NY",
    linkedinUrl: "https://linkedin.com/in/jordanokafor",
    githubUsername: "jokafor",
    yearsExperience: 4,
    status: "screening",
    source: "referral",
    avatarUrl: null,
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-03-12T11:00:00Z",
  },
  {
    id: "cand-003",
    firstName: "Mei",
    lastName: "Zhang",
    email: "mei.zhang@proton.me",
    phone: "+1-206-555-0303",
    currentTitle: "Staff Engineer",
    currentCompany: "Amazon",
    location: "Seattle, WA",
    linkedinUrl: "https://linkedin.com/in/meizhang",
    githubUsername: "mzhang-oss",
    yearsExperience: 10,
    status: "interviewing",
    source: "sourced",
    avatarUrl: null,
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-03-18T16:00:00Z",
  },
  {
    id: "cand-004",
    firstName: "Liam",
    lastName: "Fitzgerald",
    email: "liam.fitz@hey.com",
    phone: "+1-312-555-0404",
    currentTitle: "Senior Software Engineer",
    currentCompany: "Confluent",
    location: "Chicago, IL",
    linkedinUrl: "https://linkedin.com/in/liamfitz",
    githubUsername: "lfitzgerald",
    yearsExperience: 8,
    status: "offer",
    source: "linkedin",
    avatarUrl: null,
    createdAt: "2026-01-25T11:00:00Z",
    updatedAt: "2026-03-25T10:00:00Z",
  },
  {
    id: "cand-005",
    firstName: "Aisha",
    lastName: "Nakamura",
    email: "aisha.n@gmail.com",
    phone: "+1-512-555-0505",
    currentTitle: "Product Designer",
    currentCompany: "Figma",
    location: "Austin, TX",
    linkedinUrl: "https://linkedin.com/in/aishanakamura",
    githubUsername: null,
    yearsExperience: 6,
    status: "new",
    source: "application",
    avatarUrl: null,
    createdAt: "2026-03-10T14:00:00Z",
    updatedAt: "2026-03-10T14:00:00Z",
  },
  {
    id: "cand-006",
    firstName: "Rafael",
    lastName: "Costa",
    email: "rafael.costa@gmail.com",
    phone: "+1-415-555-0606",
    currentTitle: "ML Engineer",
    currentCompany: "OpenAI",
    location: "San Francisco, CA",
    linkedinUrl: "https://linkedin.com/in/rafaelcosta",
    githubUsername: "rcosta-ml",
    yearsExperience: 5,
    status: "screening",
    source: "sourced",
    avatarUrl: null,
    createdAt: "2026-03-05T09:00:00Z",
    updatedAt: "2026-03-15T13:00:00Z",
  },
  {
    id: "cand-007",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@yahoo.com",
    phone: "+1-206-555-0707",
    currentTitle: "Senior ML Engineer",
    currentCompany: "Meta",
    location: "Seattle, WA",
    linkedinUrl: "https://linkedin.com/in/priyasharma-ml",
    githubUsername: "priya-ml",
    yearsExperience: 7,
    status: "interviewing",
    source: "referral",
    avatarUrl: null,
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-03-22T15:00:00Z",
  },
  {
    id: "cand-008",
    firstName: "Emma",
    lastName: "Larsson",
    email: "emma.larsson@gmail.com",
    phone: "+1-646-555-0808",
    currentTitle: "Frontend Tech Lead",
    currentCompany: "Vercel",
    location: "New York, NY",
    linkedinUrl: "https://linkedin.com/in/emmalarsson",
    githubUsername: "elarsson",
    yearsExperience: 9,
    status: "inactive",
    source: "sourced",
    avatarUrl: null,
    createdAt: "2025-11-01T10:00:00Z",
    updatedAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "cand-009",
    firstName: "Diego",
    lastName: "Morales",
    email: "diego.morales@pm.me",
    phone: "+1-512-555-0909",
    currentTitle: "Backend Engineer",
    currentCompany: "Cloudflare",
    location: "Austin, TX",
    linkedinUrl: "https://linkedin.com/in/diegomorales",
    githubUsername: "dmorales",
    yearsExperience: 6,
    status: "rejected",
    source: "application",
    avatarUrl: null,
    createdAt: "2026-02-05T08:00:00Z",
    updatedAt: "2026-03-10T11:00:00Z",
  },
  {
    id: "cand-010",
    firstName: "Nina",
    lastName: "Volkov",
    email: "nina.volkov@gmail.com",
    phone: "+1-415-555-1010",
    currentTitle: "Senior Frontend Engineer",
    currentCompany: "Airbnb",
    location: "San Francisco, CA",
    linkedinUrl: "https://linkedin.com/in/ninavolkov",
    githubUsername: "nvolkov",
    yearsExperience: 6,
    status: "withdrawn",
    source: "linkedin",
    avatarUrl: null,
    createdAt: "2026-02-12T10:00:00Z",
    updatedAt: "2026-03-08T14:00:00Z",
  },
  {
    id: "cand-011",
    firstName: "Kwame",
    lastName: "Asante",
    email: "kwame.asante@gmail.com",
    phone: "+1-646-555-1111",
    currentTitle: "Principal Engineer",
    currentCompany: "Netflix",
    location: "Los Gatos, CA",
    linkedinUrl: "https://linkedin.com/in/kwameasante",
    githubUsername: "kasante",
    yearsExperience: 12,
    status: "interviewing",
    source: "sourced",
    avatarUrl: null,
    createdAt: "2026-02-08T09:00:00Z",
    updatedAt: "2026-03-28T11:00:00Z",
  },
  {
    id: "cand-012",
    firstName: "Sophie",
    lastName: "Dubois",
    email: "sophie.dubois@gmail.com",
    phone: "+1-312-555-1212",
    currentTitle: "Senior Product Designer",
    currentCompany: "Notion",
    location: "Chicago, IL",
    linkedinUrl: "https://linkedin.com/in/sophiedubois",
    githubUsername: null,
    yearsExperience: 8,
    status: "screening",
    source: "application",
    avatarUrl: null,
    createdAt: "2026-03-12T10:00:00Z",
    updatedAt: "2026-03-18T09:00:00Z",
  },
];

// ─── Candidate ↔ Request Links ───────────────────────────────────────────────

export const candidateReqLinks: CandidateReqLink[] = [
  // req-001 (Senior Frontend Engineer) — 4 candidates
  { id: "crl-001", candidateId: "cand-001", requestId: "req-001", matchStrength: "strong", matchReason: "7 yrs React/TS at Stripe, design system contributor", appliedAt: "2026-02-18T10:00:00Z", status: "interviewing" },
  { id: "crl-002", candidateId: "cand-002", requestId: "req-001", matchStrength: "moderate", matchReason: "4 yrs frontend at Datadog, strong referral from eng lead", appliedAt: "2026-03-01T08:00:00Z", status: "screening" },
  { id: "crl-003", candidateId: "cand-008", requestId: "req-001", matchStrength: "strong", matchReason: "9 yrs frontend, tech lead at Vercel — previously passed screening", appliedAt: "2025-11-01T10:00:00Z", status: "inactive" },
  { id: "crl-004", candidateId: "cand-010", requestId: "req-001", matchStrength: "moderate", matchReason: "6 yrs React at Airbnb, withdrew citing counter-offer", appliedAt: "2026-02-12T10:00:00Z", status: "withdrawn" },
  // req-002 (Staff Backend Engineer) — 3 candidates
  { id: "crl-005", candidateId: "cand-003", requestId: "req-002", matchStrength: "strong", matchReason: "10 yrs backend, staff eng at Amazon, Go + Kafka expertise", appliedAt: "2026-02-01T09:00:00Z", status: "interviewing" },
  { id: "crl-006", candidateId: "cand-004", requestId: "req-002", matchStrength: "strong", matchReason: "8 yrs at Confluent, deep Kafka/streaming knowledge", appliedAt: "2026-01-25T11:00:00Z", status: "offer" },
  { id: "crl-007", candidateId: "cand-009", requestId: "req-002", matchStrength: "weak", matchReason: "6 yrs backend but limited distributed systems depth", appliedAt: "2026-02-05T08:00:00Z", status: "rejected" },
  // req-003 (Product Designer) — 2 candidates
  { id: "crl-008", candidateId: "cand-005", requestId: "req-003", matchStrength: "strong", matchReason: "6 yrs product design at Figma, data viz portfolio", appliedAt: "2026-03-10T14:00:00Z", status: "new" },
  { id: "crl-009", candidateId: "cand-012", requestId: "req-003", matchStrength: "moderate", matchReason: "8 yrs design, strong systems work at Notion", appliedAt: "2026-03-12T10:00:00Z", status: "screening" },
  // req-004 (ML Engineer) — 3 candidates
  { id: "crl-010", candidateId: "cand-006", requestId: "req-004", matchStrength: "moderate", matchReason: "5 yrs ML at OpenAI, strong NLP but lighter on MLOps", appliedAt: "2026-03-05T09:00:00Z", status: "screening" },
  { id: "crl-011", candidateId: "cand-007", requestId: "req-004", matchStrength: "strong", matchReason: "7 yrs ML at Meta, shipped production recommendation models", appliedAt: "2026-02-20T10:00:00Z", status: "interviewing" },
  { id: "crl-012", candidateId: "cand-011", requestId: "req-002", matchStrength: "strong", matchReason: "12 yrs principal eng at Netflix, deep systems architecture", appliedAt: "2026-02-08T09:00:00Z", status: "interviewing" },
];

// ─── Resumes ─────────────────────────────────────────────────────────────────

export const candidateResumes: CandidateResume[] = [
  {
    id: "res-001",
    candidateId: "cand-001",
    fileName: "alex_rivera_resume.pdf",
    uploadedAt: "2026-02-18T10:05:00Z",
    summary: "Senior frontend engineer with 7 years of experience building high-performance web applications. Led Stripe's dashboard redesign serving 3M+ merchants.",
    skills: ["React", "TypeScript", "Next.js", "GraphQL", "Design Systems", "Accessibility", "Performance Optimization"],
    education: [
      { institution: "UC Berkeley", degree: "B.S.", field: "Computer Science", year: 2019 },
    ],
    experience: [
      { company: "Stripe", title: "Senior Frontend Engineer", startYear: 2022, endYear: null, highlights: ["Led dashboard redesign for 3M+ merchants", "Built shared component library used by 40+ engineers", "Reduced bundle size by 35% through code splitting"] },
      { company: "Dropbox", title: "Frontend Engineer", startYear: 2019, endYear: 2022, highlights: ["Built real-time collaboration features", "Migrated legacy jQuery codebase to React"] },
    ],
  },
  {
    id: "res-002",
    candidateId: "cand-002",
    fileName: "jordan_okafor_resume.pdf",
    uploadedAt: "2026-03-01T08:10:00Z",
    summary: "Frontend engineer with strong foundation in observability tooling and real-time data visualization at Datadog.",
    skills: ["React", "TypeScript", "D3.js", "WebSocket", "CSS-in-JS", "Testing"],
    education: [
      { institution: "Georgia Tech", degree: "B.S.", field: "Computer Science", year: 2022 },
    ],
    experience: [
      { company: "Datadog", title: "Frontend Engineer II", startYear: 2022, endYear: null, highlights: ["Built real-time metric visualization dashboard", "Shipped custom charting library handling 10K+ data points"] },
    ],
  },
  {
    id: "res-003",
    candidateId: "cand-003",
    fileName: "mei_zhang_resume.pdf",
    uploadedAt: "2026-02-01T09:15:00Z",
    summary: "Staff engineer with 10 years building distributed systems at scale. Led Amazon's event processing platform handling 100M+ daily events.",
    skills: ["Go", "Java", "Kafka", "DynamoDB", "Kubernetes", "gRPC", "System Design", "Technical Leadership"],
    education: [
      { institution: "Stanford University", degree: "M.S.", field: "Computer Science", year: 2016 },
      { institution: "Tsinghua University", degree: "B.S.", field: "Software Engineering", year: 2014 },
    ],
    experience: [
      { company: "Amazon", title: "Staff Engineer", startYear: 2020, endYear: null, highlights: ["Architected event processing platform for 100M+ daily events", "Led team of 8 engineers across 3 time zones", "Reduced p99 latency from 450ms to 85ms"] },
      { company: "Google", title: "Senior Software Engineer", startYear: 2016, endYear: 2020, highlights: ["Built Pub/Sub autoscaling system", "Designed cross-region replication strategy"] },
    ],
  },
  {
    id: "res-004",
    candidateId: "cand-004",
    fileName: "liam_fitzgerald_resume.pdf",
    uploadedAt: "2026-01-25T11:20:00Z",
    summary: "Backend specialist with deep expertise in event streaming and distributed data systems. Core contributor to Confluent's managed Kafka platform.",
    skills: ["Go", "Java", "Kafka", "PostgreSQL", "Kubernetes", "Terraform", "Event Sourcing"],
    education: [
      { institution: "University of Illinois", degree: "M.S.", field: "Computer Science", year: 2018 },
    ],
    experience: [
      { company: "Confluent", title: "Senior Software Engineer", startYear: 2020, endYear: null, highlights: ["Core contributor to managed Kafka, serving 5K+ clusters", "Designed zero-downtime migration framework", "Built cluster health monitoring reducing incidents by 60%"] },
      { company: "Uber", title: "Software Engineer", startYear: 2018, endYear: 2020, highlights: ["Built ride-matching event pipeline", "Optimized Kafka consumer group rebalancing"] },
    ],
  },
  {
    id: "res-005",
    candidateId: "cand-005",
    fileName: "aisha_nakamura_portfolio.pdf",
    uploadedAt: "2026-03-10T14:10:00Z",
    summary: "Product designer specializing in enterprise tools and data-heavy interfaces. Led Figma's analytics dashboard redesign.",
    skills: ["Figma", "Design Systems", "Data Visualization", "User Research", "Prototyping", "Accessibility"],
    education: [
      { institution: "Rhode Island School of Design", degree: "B.F.A.", field: "Graphic Design", year: 2020 },
    ],
    experience: [
      { company: "Figma", title: "Product Designer", startYear: 2022, endYear: null, highlights: ["Redesigned analytics dashboard increasing engagement by 40%", "Created data visualization component library", "Led design system governance process"] },
      { company: "Tableau", title: "UX Designer", startYear: 2020, endYear: 2022, highlights: ["Designed new chart type picker used by 500K+ users", "Conducted 50+ user research sessions"] },
    ],
  },
  {
    id: "res-006",
    candidateId: "cand-006",
    fileName: "rafael_costa_resume.pdf",
    uploadedAt: "2026-03-05T09:10:00Z",
    summary: "ML engineer with experience shipping NLP models to production at OpenAI. Strong research background with focus on practical deployment.",
    skills: ["Python", "PyTorch", "TensorFlow", "NLP", "Transformers", "Docker", "FastAPI"],
    education: [
      { institution: "MIT", degree: "M.S.", field: "Machine Learning", year: 2021 },
      { institution: "University of São Paulo", degree: "B.S.", field: "Computer Engineering", year: 2019 },
    ],
    experience: [
      { company: "OpenAI", title: "ML Engineer", startYear: 2021, endYear: null, highlights: ["Shipped fine-tuning pipeline serving 10K+ daily requests", "Optimized model inference latency by 3x", "Built evaluation framework for LLM outputs"] },
    ],
  },
  {
    id: "res-007",
    candidateId: "cand-007",
    fileName: "priya_sharma_resume.pdf",
    uploadedAt: "2026-02-20T10:15:00Z",
    summary: "Senior ML engineer who has shipped production recommendation systems at Meta scale. Strong end-to-end ML lifecycle experience.",
    skills: ["Python", "PyTorch", "MLflow", "Kubeflow", "Spark", "Feature Engineering", "A/B Testing"],
    education: [
      { institution: "Carnegie Mellon University", degree: "M.S.", field: "Machine Learning", year: 2019 },
      { institution: "IIT Bombay", degree: "B.Tech.", field: "Computer Science", year: 2017 },
    ],
    experience: [
      { company: "Meta", title: "Senior ML Engineer", startYear: 2021, endYear: null, highlights: ["Built recommendation model serving 2B+ users", "Designed feature store reducing experiment setup from 2 weeks to 2 days", "Led MLOps standardization across 3 teams"] },
      { company: "LinkedIn", title: "ML Engineer", startYear: 2019, endYear: 2021, highlights: ["Built job-matching models", "Improved candidate recommendation precision by 25%"] },
    ],
  },
  {
    id: "res-008",
    candidateId: "cand-008",
    fileName: "emma_larsson_resume.pdf",
    uploadedAt: "2025-11-01T10:10:00Z",
    summary: "Frontend tech lead with 9 years of experience. Led Vercel's developer experience team. Deep expertise in React Server Components and build tooling.",
    skills: ["React", "TypeScript", "Next.js", "Webpack", "Turborepo", "Node.js", "Design Systems"],
    education: [
      { institution: "KTH Royal Institute", degree: "M.S.", field: "Computer Science", year: 2017 },
    ],
    experience: [
      { company: "Vercel", title: "Frontend Tech Lead", startYear: 2021, endYear: null, highlights: ["Led developer experience team of 6", "Shipped Next.js integration testing framework", "Built internal component library with 100+ components"] },
      { company: "Spotify", title: "Senior Frontend Engineer", startYear: 2017, endYear: 2021, highlights: ["Built podcast player web experience", "Led migration to React from Backbone.js"] },
    ],
  },
  {
    id: "res-009",
    candidateId: "cand-011",
    fileName: "kwame_asante_resume.pdf",
    uploadedAt: "2026-02-08T09:10:00Z",
    summary: "Principal engineer with 12 years leading large-scale distributed systems. Designed Netflix's content delivery orchestration platform.",
    skills: ["Java", "Go", "Kafka", "Cassandra", "gRPC", "System Design", "Technical Leadership", "Mentoring"],
    education: [
      { institution: "MIT", degree: "M.Eng.", field: "Electrical Engineering & Computer Science", year: 2014 },
      { institution: "University of Ghana", degree: "B.S.", field: "Computer Science", year: 2012 },
    ],
    experience: [
      { company: "Netflix", title: "Principal Engineer", startYear: 2020, endYear: null, highlights: ["Designed content delivery orchestration serving 260M+ subscribers", "Led architecture review board", "Mentored 15+ senior engineers to staff/principal level"] },
      { company: "Twitter", title: "Staff Engineer", startYear: 2016, endYear: 2020, highlights: ["Built timeline ranking infrastructure", "Led Kafka migration reducing costs by $2M/year"] },
      { company: "Google", title: "Senior Software Engineer", startYear: 2014, endYear: 2016, highlights: ["Built BigQuery query optimizer components"] },
    ],
  },
  {
    id: "res-010",
    candidateId: "cand-012",
    fileName: "sophie_dubois_resume.pdf",
    uploadedAt: "2026-03-12T10:10:00Z",
    summary: "Senior product designer with 8 years focused on enterprise productivity tools. Led Notion's workspace settings and admin console redesign.",
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Information Architecture", "Workshop Facilitation"],
    education: [
      { institution: "Parsons School of Design", degree: "M.F.A.", field: "Design and Technology", year: 2018 },
    ],
    experience: [
      { company: "Notion", title: "Senior Product Designer", startYear: 2021, endYear: null, highlights: ["Redesigned workspace admin console for 30K+ enterprise teams", "Built design token system", "Led quarterly design critique program"] },
      { company: "Atlassian", title: "Product Designer", startYear: 2018, endYear: 2021, highlights: ["Designed Jira board customization features", "Shipped team dashboard used by 100K+ teams"] },
    ],
  },
];

// ─── Scores ──────────────────────────────────────────────────────────────────

export const candidateScores: CandidateScore[] = [
  // cand-001 (Alex Rivera) — for req-001
  { id: "cs-001", candidateId: "cand-001", requestId: "req-001", category: "resume", score: 88, breakdown: [{ label: "Skills Match", score: 92, weight: 0.4 }, { label: "Experience Level", score: 85, weight: 0.3 }, { label: "Education", score: 80, weight: 0.15 }, { label: "Career Trajectory", score: 90, weight: 0.15 }], scoredAt: "2026-02-19T10:00:00Z", scoredBy: "AI Resume Scorer" },
  { id: "cs-002", candidateId: "cand-001", requestId: "req-001", category: "interview", score: 82, breakdown: [{ label: "Technical Depth", score: 85, weight: 0.35 }, { label: "System Design", score: 78, weight: 0.25 }, { label: "Communication", score: 90, weight: 0.2 }, { label: "Culture Fit", score: 75, weight: 0.2 }], scoredAt: "2026-03-15T16:00:00Z", scoredBy: "Interview Panel" },
  { id: "cs-003", candidateId: "cand-001", requestId: "req-001", category: "combined", score: 85, breakdown: [{ label: "Resume Score", score: 88, weight: 0.4 }, { label: "Interview Score", score: 82, weight: 0.6 }], scoredAt: "2026-03-15T17:00:00Z", scoredBy: "System" },

  // cand-003 (Mei Zhang) — for req-002
  { id: "cs-004", candidateId: "cand-003", requestId: "req-002", category: "resume", score: 95, breakdown: [{ label: "Skills Match", score: 98, weight: 0.4 }, { label: "Experience Level", score: 95, weight: 0.3 }, { label: "Education", score: 92, weight: 0.15 }, { label: "Career Trajectory", score: 90, weight: 0.15 }], scoredAt: "2026-02-02T10:00:00Z", scoredBy: "AI Resume Scorer" },
  { id: "cs-005", candidateId: "cand-003", requestId: "req-002", category: "interview", score: 91, breakdown: [{ label: "Technical Depth", score: 95, weight: 0.35 }, { label: "System Design", score: 92, weight: 0.25 }, { label: "Communication", score: 85, weight: 0.2 }, { label: "Culture Fit", score: 88, weight: 0.2 }], scoredAt: "2026-03-10T16:00:00Z", scoredBy: "Interview Panel" },
  { id: "cs-006", candidateId: "cand-003", requestId: "req-002", category: "combined", score: 93, breakdown: [{ label: "Resume Score", score: 95, weight: 0.4 }, { label: "Interview Score", score: 91, weight: 0.6 }], scoredAt: "2026-03-10T17:00:00Z", scoredBy: "System" },

  // cand-004 (Liam Fitzgerald) — for req-002
  { id: "cs-007", candidateId: "cand-004", requestId: "req-002", category: "resume", score: 91, breakdown: [{ label: "Skills Match", score: 95, weight: 0.4 }, { label: "Experience Level", score: 88, weight: 0.3 }, { label: "Education", score: 85, weight: 0.15 }, { label: "Career Trajectory", score: 92, weight: 0.15 }], scoredAt: "2026-01-26T10:00:00Z", scoredBy: "AI Resume Scorer" },
  { id: "cs-008", candidateId: "cand-004", requestId: "req-002", category: "interview", score: 89, breakdown: [{ label: "Technical Depth", score: 92, weight: 0.35 }, { label: "System Design", score: 88, weight: 0.25 }, { label: "Communication", score: 85, weight: 0.2 }, { label: "Culture Fit", score: 90, weight: 0.2 }], scoredAt: "2026-03-20T16:00:00Z", scoredBy: "Interview Panel" },
  { id: "cs-009", candidateId: "cand-004", requestId: "req-002", category: "combined", score: 90, breakdown: [{ label: "Resume Score", score: 91, weight: 0.4 }, { label: "Interview Score", score: 89, weight: 0.6 }], scoredAt: "2026-03-20T17:00:00Z", scoredBy: "System" },

  // cand-007 (Priya Sharma) — for req-004
  { id: "cs-010", candidateId: "cand-007", requestId: "req-004", category: "resume", score: 90, breakdown: [{ label: "Skills Match", score: 92, weight: 0.4 }, { label: "Experience Level", score: 88, weight: 0.3 }, { label: "Education", score: 90, weight: 0.15 }, { label: "Career Trajectory", score: 88, weight: 0.15 }], scoredAt: "2026-02-21T10:00:00Z", scoredBy: "AI Resume Scorer" },
  { id: "cs-011", candidateId: "cand-007", requestId: "req-004", category: "interview", score: 86, breakdown: [{ label: "Technical Depth", score: 90, weight: 0.35 }, { label: "System Design", score: 82, weight: 0.25 }, { label: "Communication", score: 88, weight: 0.2 }, { label: "Culture Fit", score: 82, weight: 0.2 }], scoredAt: "2026-03-18T16:00:00Z", scoredBy: "Interview Panel" },
  { id: "cs-012", candidateId: "cand-007", requestId: "req-004", category: "combined", score: 88, breakdown: [{ label: "Resume Score", score: 90, weight: 0.4 }, { label: "Interview Score", score: 86, weight: 0.6 }], scoredAt: "2026-03-18T17:00:00Z", scoredBy: "System" },

  // cand-002 (Jordan Okafor) — resume only, for req-001
  { id: "cs-013", candidateId: "cand-002", requestId: "req-001", category: "resume", score: 74, breakdown: [{ label: "Skills Match", score: 78, weight: 0.4 }, { label: "Experience Level", score: 65, weight: 0.3 }, { label: "Education", score: 80, weight: 0.15 }, { label: "Career Trajectory", score: 75, weight: 0.15 }], scoredAt: "2026-03-02T10:00:00Z", scoredBy: "AI Resume Scorer" },

  // cand-006 (Rafael Costa) — resume only, for req-004
  { id: "cs-014", candidateId: "cand-006", requestId: "req-004", category: "resume", score: 79, breakdown: [{ label: "Skills Match", score: 82, weight: 0.4 }, { label: "Experience Level", score: 72, weight: 0.3 }, { label: "Education", score: 88, weight: 0.15 }, { label: "Career Trajectory", score: 78, weight: 0.15 }], scoredAt: "2026-03-06T10:00:00Z", scoredBy: "AI Resume Scorer" },

  // cand-008 (Emma Larsson) — resume only (inactive), for req-001
  { id: "cs-015", candidateId: "cand-008", requestId: "req-001", category: "resume", score: 92, breakdown: [{ label: "Skills Match", score: 95, weight: 0.4 }, { label: "Experience Level", score: 90, weight: 0.3 }, { label: "Education", score: 88, weight: 0.15 }, { label: "Career Trajectory", score: 92, weight: 0.15 }], scoredAt: "2025-11-02T10:00:00Z", scoredBy: "AI Resume Scorer" },

  // cand-011 (Kwame Asante) — for req-002
  { id: "cs-016", candidateId: "cand-011", requestId: "req-002", category: "resume", score: 96, breakdown: [{ label: "Skills Match", score: 95, weight: 0.4 }, { label: "Experience Level", score: 98, weight: 0.3 }, { label: "Education", score: 95, weight: 0.15 }, { label: "Career Trajectory", score: 96, weight: 0.15 }], scoredAt: "2026-02-09T10:00:00Z", scoredBy: "AI Resume Scorer" },
  { id: "cs-017", candidateId: "cand-011", requestId: "req-002", category: "interview", score: 94, breakdown: [{ label: "Technical Depth", score: 98, weight: 0.35 }, { label: "System Design", score: 96, weight: 0.25 }, { label: "Communication", score: 90, weight: 0.2 }, { label: "Culture Fit", score: 88, weight: 0.2 }], scoredAt: "2026-03-22T16:00:00Z", scoredBy: "Interview Panel" },
  { id: "cs-018", candidateId: "cand-011", requestId: "req-002", category: "combined", score: 95, breakdown: [{ label: "Resume Score", score: 96, weight: 0.4 }, { label: "Interview Score", score: 94, weight: 0.6 }], scoredAt: "2026-03-22T17:00:00Z", scoredBy: "System" },

  // cand-009 (Diego Morales) — for req-002 (rejected)
  { id: "cs-019", candidateId: "cand-009", requestId: "req-002", category: "resume", score: 62, breakdown: [{ label: "Skills Match", score: 58, weight: 0.4 }, { label: "Experience Level", score: 65, weight: 0.3 }, { label: "Education", score: 70, weight: 0.15 }, { label: "Career Trajectory", score: 60, weight: 0.15 }], scoredAt: "2026-02-06T10:00:00Z", scoredBy: "AI Resume Scorer" },

  // cand-005 (Aisha Nakamura) — for req-003
  { id: "cs-020", candidateId: "cand-005", requestId: "req-003", category: "resume", score: 87, breakdown: [{ label: "Skills Match", score: 90, weight: 0.4 }, { label: "Experience Level", score: 82, weight: 0.3 }, { label: "Education", score: 88, weight: 0.15 }, { label: "Career Trajectory", score: 85, weight: 0.15 }], scoredAt: "2026-03-11T10:00:00Z", scoredBy: "AI Resume Scorer" },

  // cand-012 (Sophie Dubois) — for req-003
  { id: "cs-021", candidateId: "cand-012", requestId: "req-003", category: "resume", score: 81, breakdown: [{ label: "Skills Match", score: 78, weight: 0.4 }, { label: "Experience Level", score: 85, weight: 0.3 }, { label: "Education", score: 82, weight: 0.15 }, { label: "Career Trajectory", score: 80, weight: 0.15 }], scoredAt: "2026-03-13T10:00:00Z", scoredBy: "AI Resume Scorer" },
];

// ─── Status History ──────────────────────────────────────────────────────────

export const candidateStatusHistory: CandidateStatusHistory[] = [
  // cand-001 (Alex Rivera)
  { id: "csh-001", candidateId: "cand-001", requestId: "req-001", fromStatus: null, toStatus: "new", changedBy: "System", note: "Application received via LinkedIn", changedAt: "2026-02-18T10:00:00Z" },
  { id: "csh-002", candidateId: "cand-001", requestId: "req-001", fromStatus: "new", toStatus: "screening", changedBy: "Priya Patel", note: "Strong resume — moving to phone screen", changedAt: "2026-02-20T09:00:00Z" },
  { id: "csh-003", candidateId: "cand-001", requestId: "req-001", fromStatus: "screening", toStatus: "interviewing", changedBy: "Priya Patel", note: "Phone screen went well. Scheduling full loop.", changedAt: "2026-03-01T11:00:00Z" },

  // cand-003 (Mei Zhang)
  { id: "csh-004", candidateId: "cand-003", requestId: "req-002", fromStatus: null, toStatus: "new", changedBy: "System", note: "Sourced by recruiter", changedAt: "2026-02-01T09:00:00Z" },
  { id: "csh-005", candidateId: "cand-003", requestId: "req-002", fromStatus: "new", toStatus: "screening", changedBy: "Priya Patel", note: "Top-tier profile, fast-tracking", changedAt: "2026-02-03T10:00:00Z" },
  { id: "csh-006", candidateId: "cand-003", requestId: "req-002", fromStatus: "screening", toStatus: "interviewing", changedBy: "Priya Patel", note: "Moving to technical interviews", changedAt: "2026-02-10T14:00:00Z" },

  // cand-004 (Liam Fitzgerald) — full pipeline to offer
  { id: "csh-007", candidateId: "cand-004", requestId: "req-002", fromStatus: null, toStatus: "new", changedBy: "System", note: "Application via LinkedIn", changedAt: "2026-01-25T11:00:00Z" },
  { id: "csh-008", candidateId: "cand-004", requestId: "req-002", fromStatus: "new", toStatus: "screening", changedBy: "Priya Patel", note: "Confluent background is a strong fit", changedAt: "2026-01-28T09:00:00Z" },
  { id: "csh-009", candidateId: "cand-004", requestId: "req-002", fromStatus: "screening", toStatus: "interviewing", changedBy: "Priya Patel", note: "Scheduling full loop", changedAt: "2026-02-05T10:00:00Z" },
  { id: "csh-010", candidateId: "cand-004", requestId: "req-002", fromStatus: "interviewing", toStatus: "offer", changedBy: "Marcus Johnson", note: "Strong hire consensus. Extending offer at $265K.", changedAt: "2026-03-25T10:00:00Z" },

  // cand-008 (Emma Larsson) — went inactive, reactivation candidate
  { id: "csh-011", candidateId: "cand-008", requestId: "req-001", fromStatus: null, toStatus: "new", changedBy: "System", note: "Sourced from Vercel engineering blog", changedAt: "2025-11-01T10:00:00Z" },
  { id: "csh-012", candidateId: "cand-008", requestId: "req-001", fromStatus: "new", toStatus: "screening", changedBy: "Priya Patel", note: "Exceptional profile, scheduling screen", changedAt: "2025-11-05T09:00:00Z" },
  { id: "csh-013", candidateId: "cand-008", requestId: "req-001", fromStatus: "screening", toStatus: "inactive", changedBy: "Priya Patel", note: "Candidate requested pause — timing not right due to Vercel project deadline", changedAt: "2026-01-15T09:00:00Z" },

  // cand-009 (Diego Morales) — rejected
  { id: "csh-014", candidateId: "cand-009", requestId: "req-002", fromStatus: null, toStatus: "new", changedBy: "System", note: "Application received", changedAt: "2026-02-05T08:00:00Z" },
  { id: "csh-015", candidateId: "cand-009", requestId: "req-002", fromStatus: "new", toStatus: "screening", changedBy: "Priya Patel", note: "Reviewing application", changedAt: "2026-02-08T10:00:00Z" },
  { id: "csh-016", candidateId: "cand-009", requestId: "req-002", fromStatus: "screening", toStatus: "rejected", changedBy: "Marcus Johnson", note: "Insufficient distributed systems experience for staff-level role", changedAt: "2026-03-10T11:00:00Z" },

  // cand-010 (Nina Volkov) — withdrawn
  { id: "csh-017", candidateId: "cand-010", requestId: "req-001", fromStatus: null, toStatus: "new", changedBy: "System", note: "Sourced via LinkedIn", changedAt: "2026-02-12T10:00:00Z" },
  { id: "csh-018", candidateId: "cand-010", requestId: "req-001", fromStatus: "new", toStatus: "screening", changedBy: "Priya Patel", note: "Moving to phone screen", changedAt: "2026-02-15T09:00:00Z" },
  { id: "csh-019", candidateId: "cand-010", requestId: "req-001", fromStatus: "screening", toStatus: "withdrawn", changedBy: "Nina Volkov", note: "Accepted counter-offer from Airbnb", changedAt: "2026-03-08T14:00:00Z" },

  // cand-007 (Priya Sharma)
  { id: "csh-020", candidateId: "cand-007", requestId: "req-004", fromStatus: null, toStatus: "new", changedBy: "System", note: "Referral from team member", changedAt: "2026-02-20T10:00:00Z" },
  { id: "csh-021", candidateId: "cand-007", requestId: "req-004", fromStatus: "new", toStatus: "screening", changedBy: "Priya Patel", note: "Strong referral, expediting", changedAt: "2026-02-22T09:00:00Z" },
  { id: "csh-022", candidateId: "cand-007", requestId: "req-004", fromStatus: "screening", toStatus: "interviewing", changedBy: "Priya Patel", note: "Technical screen passed with flying colors", changedAt: "2026-03-05T10:00:00Z" },

  // cand-011 (Kwame Asante)
  { id: "csh-023", candidateId: "cand-011", requestId: "req-002", fromStatus: null, toStatus: "new", changedBy: "System", note: "Sourced — principal engineer at Netflix", changedAt: "2026-02-08T09:00:00Z" },
  { id: "csh-024", candidateId: "cand-011", requestId: "req-002", fromStatus: "new", toStatus: "screening", changedBy: "Priya Patel", note: "Exceptional candidate, priority scheduling", changedAt: "2026-02-10T09:00:00Z" },
  { id: "csh-025", candidateId: "cand-011", requestId: "req-002", fromStatus: "screening", toStatus: "interviewing", changedBy: "Priya Patel", note: "Moving to full interview loop", changedAt: "2026-02-20T10:00:00Z" },
];
