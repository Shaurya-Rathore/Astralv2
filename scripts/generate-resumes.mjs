/**
 * Generate realistic PDF resumes for all seed candidates.
 * Run: node scripts/generate-resumes.mjs
 */
import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "resumes");
mkdirSync(outDir, { recursive: true });

const candidates = [
  {
    fileName: "alex_rivera_resume.pdf",
    name: "Alex Rivera",
    email: "alex.rivera@email.com",
    phone: "(415) 555-0142",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexrivera",
    github: "alexrivera-dev",
    summary: "Senior frontend engineer with 7 years of experience building high-performance web applications. Led Stripe's dashboard redesign serving 3M+ merchants. Passionate about design systems, accessibility, and developer experience.",
    skills: ["React", "TypeScript", "Next.js", "GraphQL", "Design Systems", "Accessibility", "Performance Optimization", "Webpack", "Tailwind CSS", "Jest"],
    experience: [
      { company: "Stripe", title: "Senior Frontend Engineer", period: "2022 – Present", highlights: ["Led dashboard redesign for 3M+ merchants, increasing task completion rate by 22%", "Built shared component library used by 40+ engineers across 6 teams", "Reduced bundle size by 35% through code splitting and lazy loading", "Mentored 3 junior engineers through structured 1:1 program"] },
      { company: "Dropbox", title: "Frontend Engineer", period: "2019 – 2022", highlights: ["Built real-time collaboration features using WebSocket and CRDT", "Migrated legacy jQuery codebase to React, improving dev velocity by 40%", "Implemented comprehensive E2E test suite with Playwright"] },
    ],
    education: [{ institution: "UC Berkeley", degree: "B.S. Computer Science", year: "2019" }],
  },
  {
    fileName: "jordan_okafor_resume.pdf",
    name: "Jordan Okafor",
    email: "jordan.okafor@email.com",
    phone: "(404) 555-0198",
    location: "Atlanta, GA",
    linkedin: "linkedin.com/in/jordanokafor",
    summary: "Frontend engineer with strong foundation in observability tooling and real-time data visualization. Currently building monitoring dashboards at Datadog that process millions of data points per second.",
    skills: ["React", "TypeScript", "D3.js", "WebSocket", "CSS-in-JS", "Testing", "Canvas API", "Node.js", "GraphQL"],
    experience: [
      { company: "Datadog", title: "Frontend Engineer II", period: "2022 – Present", highlights: ["Built real-time metric visualization dashboard handling 10K+ concurrent data streams", "Shipped custom charting library with Canvas rendering for sub-16ms frame times", "Designed WebSocket connection pooling reducing server load by 45%", "Led adoption of Storybook across 3 frontend teams"] },
    ],
    education: [{ institution: "Georgia Tech", degree: "B.S. Computer Science", year: "2022" }],
  },
  {
    fileName: "mei_zhang_resume.pdf",
    name: "Mei Zhang",
    email: "mei.zhang@email.com",
    phone: "(206) 555-0234",
    location: "Seattle, WA",
    linkedin: "linkedin.com/in/meizhang",
    summary: "Staff engineer with 10 years building distributed systems at scale. Led Amazon's event processing platform handling 100M+ daily events. Deep expertise in stream processing, consensus protocols, and operational excellence.",
    skills: ["Go", "Java", "Kafka", "DynamoDB", "Kubernetes", "gRPC", "System Design", "Technical Leadership", "Terraform", "AWS"],
    experience: [
      { company: "Amazon", title: "Staff Engineer", period: "2020 – Present", highlights: ["Architected event processing platform for 100M+ daily events across 12 regions", "Led team of 8 engineers across 3 time zones", "Reduced p99 latency from 450ms to 85ms through partition optimization", "Designed disaster recovery strategy achieving 99.999% uptime"] },
      { company: "Google", title: "Senior Software Engineer", period: "2016 – 2020", highlights: ["Built Pub/Sub autoscaling system handling 50TB/day throughput", "Designed cross-region replication strategy for Cloud Spanner", "Published internal paper on deterministic simulation testing"] },
    ],
    education: [
      { institution: "Stanford University", degree: "M.S. Computer Science", year: "2016" },
      { institution: "Tsinghua University", degree: "B.S. Software Engineering", year: "2014" },
    ],
  },
  {
    fileName: "liam_fitzgerald_resume.pdf",
    name: "Liam Fitzgerald",
    email: "liam.fitzgerald@email.com",
    phone: "(512) 555-0176",
    location: "Austin, TX",
    linkedin: "linkedin.com/in/liamfitz",
    summary: "Backend specialist with deep expertise in event streaming and distributed data systems. Core contributor to Confluent's managed Kafka platform serving 5K+ production clusters worldwide.",
    skills: ["Go", "Java", "Kafka", "PostgreSQL", "Kubernetes", "Terraform", "Event Sourcing", "Docker", "Prometheus"],
    experience: [
      { company: "Confluent", title: "Senior Software Engineer", period: "2020 – Present", highlights: ["Core contributor to managed Kafka, serving 5K+ clusters globally", "Designed zero-downtime migration framework for cluster upgrades", "Built cluster health monitoring system reducing incidents by 60%", "Open-source contributor to Apache Kafka (12 merged PRs)"] },
      { company: "Uber", title: "Software Engineer", period: "2018 – 2020", highlights: ["Built ride-matching event pipeline processing 1M+ events/min", "Optimized Kafka consumer group rebalancing cutting rebalance time by 70%"] },
    ],
    education: [{ institution: "University of Illinois", degree: "M.S. Computer Science", year: "2018" }],
  },
  {
    fileName: "aisha_nakamura_portfolio.pdf",
    name: "Aisha Nakamura",
    email: "aisha.nakamura@email.com",
    phone: "(415) 555-0221",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/aishanakamura",
    summary: "Product designer specializing in enterprise tools and data-heavy interfaces. Led Figma's analytics dashboard redesign. Passionate about making complex data accessible through thoughtful information architecture.",
    skills: ["Figma", "Design Systems", "Data Visualization", "User Research", "Prototyping", "Accessibility", "Motion Design", "Sketch"],
    experience: [
      { company: "Figma", title: "Product Designer", period: "2022 – Present", highlights: ["Redesigned analytics dashboard increasing user engagement by 40%", "Created data visualization component library used across 8 products", "Led design system governance process for 30+ designers", "Conducted 20+ usability studies informing product roadmap"] },
      { company: "Tableau", title: "UX Designer", period: "2020 – 2022", highlights: ["Designed new chart type picker used by 500K+ users", "Conducted 50+ user research sessions across 6 countries", "Improved onboarding completion rate by 35%"] },
    ],
    education: [{ institution: "Rhode Island School of Design", degree: "B.F.A. Graphic Design", year: "2020" }],
  },
  {
    fileName: "rafael_costa_resume.pdf",
    name: "Rafael Costa",
    email: "rafael.costa@email.com",
    phone: "(617) 555-0189",
    location: "Boston, MA",
    linkedin: "linkedin.com/in/rafaelcosta",
    github: "rafcosta-ml",
    summary: "ML engineer with experience shipping NLP models to production at OpenAI. Strong research background with focus on practical deployment, model optimization, and evaluation frameworks.",
    skills: ["Python", "PyTorch", "TensorFlow", "NLP", "Transformers", "Docker", "FastAPI", "CUDA", "MLflow", "Ray"],
    experience: [
      { company: "OpenAI", title: "ML Engineer", period: "2021 – Present", highlights: ["Shipped fine-tuning pipeline serving 10K+ daily requests with 99.9% uptime", "Optimized model inference latency by 3x through quantization and batching", "Built evaluation framework for LLM outputs used by 40+ researchers", "Led migration from TensorFlow to PyTorch for training infrastructure"] },
    ],
    education: [
      { institution: "MIT", degree: "M.S. Machine Learning", year: "2021" },
      { institution: "University of São Paulo", degree: "B.S. Computer Engineering", year: "2019" },
    ],
  },
  {
    fileName: "priya_sharma_resume.pdf",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "(650) 555-0167",
    location: "Menlo Park, CA",
    linkedin: "linkedin.com/in/priyasharma-ml",
    summary: "Senior ML engineer who has shipped production recommendation systems at Meta scale. Strong end-to-end ML lifecycle experience from feature engineering to A/B testing to deployment.",
    skills: ["Python", "PyTorch", "MLflow", "Kubeflow", "Spark", "Feature Engineering", "A/B Testing", "SQL", "Airflow"],
    experience: [
      { company: "Meta", title: "Senior ML Engineer", period: "2021 – Present", highlights: ["Built recommendation model serving 2B+ users across Feed and Reels", "Designed feature store reducing experiment setup from 2 weeks to 2 days", "Led MLOps standardization across 3 teams (15 engineers)", "Improved model refresh pipeline reducing staleness from 24h to 2h"] },
      { company: "LinkedIn", title: "ML Engineer", period: "2019 – 2021", highlights: ["Built job-matching models improving candidate recommendation precision by 25%", "Designed real-time feature pipeline processing 500K events/sec"] },
    ],
    education: [
      { institution: "Carnegie Mellon University", degree: "M.S. Machine Learning", year: "2019" },
      { institution: "IIT Bombay", degree: "B.Tech. Computer Science", year: "2017" },
    ],
  },
  {
    fileName: "emma_larsson_resume.pdf",
    name: "Emma Larsson",
    email: "emma.larsson@email.com",
    phone: "(646) 555-0154",
    location: "New York, NY",
    linkedin: "linkedin.com/in/emmalarsson",
    github: "emmalarsson",
    summary: "Frontend tech lead with 9 years of experience. Led Vercel's developer experience team. Deep expertise in React Server Components, build tooling, and scaling frontend architecture for large organizations.",
    skills: ["React", "TypeScript", "Next.js", "Webpack", "Turborepo", "Node.js", "Design Systems", "Playwright", "Vite"],
    experience: [
      { company: "Vercel", title: "Frontend Tech Lead", period: "2021 – Present", highlights: ["Led developer experience team of 6, shipping Next.js integration testing framework", "Built internal component library with 100+ components and 95% test coverage", "Designed incremental migration strategy from Pages Router to App Router", "Speaker at Next.js Conf 2024 and React Summit 2025"] },
      { company: "Spotify", title: "Senior Frontend Engineer", period: "2017 – 2021", highlights: ["Built podcast player web experience serving 200M+ monthly users", "Led migration from Backbone.js to React across 3 squads", "Established frontend performance monitoring with Core Web Vitals"] },
    ],
    education: [{ institution: "KTH Royal Institute of Technology", degree: "M.S. Computer Science", year: "2017" }],
  },
  {
    fileName: "kwame_asante_resume.pdf",
    name: "Kwame Asante",
    email: "kwame.asante@email.com",
    phone: "(408) 555-0211",
    location: "Los Gatos, CA",
    linkedin: "linkedin.com/in/kwameasante",
    summary: "Principal engineer with 12 years leading large-scale distributed systems. Designed Netflix's content delivery orchestration platform. Proven track record of mentoring engineers to staff+ levels.",
    skills: ["Java", "Go", "Kafka", "Cassandra", "gRPC", "System Design", "Technical Leadership", "Mentoring", "AWS", "Terraform"],
    experience: [
      { company: "Netflix", title: "Principal Engineer", period: "2020 – Present", highlights: ["Designed content delivery orchestration serving 260M+ subscribers globally", "Led architecture review board evaluating 50+ proposals/quarter", "Mentored 15+ senior engineers to staff/principal level", "Reduced CDN origin load by 40% through intelligent prefetching"] },
      { company: "Twitter", title: "Staff Engineer", period: "2016 – 2020", highlights: ["Built timeline ranking infrastructure processing 500K tweets/sec", "Led Kafka migration reducing infrastructure costs by $2M/year", "Designed cross-datacenter consistency model for tweet storage"] },
      { company: "Google", title: "Senior Software Engineer", period: "2014 – 2016", highlights: ["Built BigQuery query optimizer components improving query speed by 30%", "Contributed to Dremel paper implementation"] },
    ],
    education: [
      { institution: "MIT", degree: "M.Eng. EECS", year: "2014" },
      { institution: "University of Ghana", degree: "B.S. Computer Science", year: "2012" },
    ],
  },
  {
    fileName: "sophie_dubois_resume.pdf",
    name: "Sophie Dubois",
    email: "sophie.dubois@email.com",
    phone: "(212) 555-0198",
    location: "New York, NY",
    linkedin: "linkedin.com/in/sophiedubois",
    summary: "Senior product designer with 8 years focused on enterprise productivity tools. Led Notion's workspace settings and admin console redesign. Expert in design systems, information architecture, and cross-functional collaboration.",
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Information Architecture", "Workshop Facilitation", "Framer", "Abstract"],
    experience: [
      { company: "Notion", title: "Senior Product Designer", period: "2021 – Present", highlights: ["Redesigned workspace admin console for 30K+ enterprise teams", "Built design token system adopted across all product surfaces", "Led quarterly design critique program for 20+ designers", "Shipped permission model UI reducing support tickets by 35%"] },
      { company: "Atlassian", title: "Product Designer", period: "2018 – 2021", highlights: ["Designed Jira board customization features for 100K+ teams", "Shipped team dashboard used by 100K+ teams worldwide", "Led cross-team design system contribution process"] },
    ],
    education: [{ institution: "Parsons School of Design", degree: "M.F.A. Design and Technology", year: "2018" }],
  },
];

function generateResume(candidate) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 50 });
    const stream = createWriteStream(join(outDir, candidate.fileName));
    doc.pipe(stream);

    const blue = "#1a56db";
    const black = "#111827";
    const gray = "#6b7280";
    const lightGray = "#e5e7eb";

    // Name
    doc.font("Helvetica-Bold").fontSize(22).fillColor(black).text(candidate.name, { align: "left" });
    doc.moveDown(0.2);

    // Contact line
    const contactParts = [candidate.email, candidate.phone, candidate.location];
    if (candidate.linkedin) contactParts.push(candidate.linkedin);
    if (candidate.github) contactParts.push(`github.com/${candidate.github}`);
    doc.font("Helvetica").fontSize(9).fillColor(gray).text(contactParts.join("  •  "), { align: "left" });
    doc.moveDown(0.4);

    // Divider
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor(lightGray).lineWidth(1).stroke();
    doc.moveDown(0.5);

    // Summary
    doc.font("Helvetica-Bold").fontSize(11).fillColor(blue).text("SUMMARY");
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(9.5).fillColor(black).text(candidate.summary, { lineGap: 2 });
    doc.moveDown(0.6);

    // Skills
    doc.font("Helvetica-Bold").fontSize(11).fillColor(blue).text("TECHNICAL SKILLS");
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(9.5).fillColor(black).text(candidate.skills.join("  •  "), { lineGap: 2 });
    doc.moveDown(0.6);

    // Experience
    doc.font("Helvetica-Bold").fontSize(11).fillColor(blue).text("EXPERIENCE");
    doc.moveDown(0.3);
    for (const job of candidate.experience) {
      doc.font("Helvetica-Bold").fontSize(10).fillColor(black).text(job.title, { continued: true });
      doc.font("Helvetica").fontSize(10).fillColor(gray).text(`  —  ${job.company}`, { continued: true });
      doc.font("Helvetica").fontSize(9).fillColor(gray).text(`    ${job.period}`, { align: "right" });
      doc.moveDown(0.2);
      for (const h of job.highlights) {
        doc.font("Helvetica").fontSize(9.5).fillColor(black).text(`•  ${h}`, { indent: 12, lineGap: 1.5 });
      }
      doc.moveDown(0.4);
    }

    // Education
    doc.font("Helvetica-Bold").fontSize(11).fillColor(blue).text("EDUCATION");
    doc.moveDown(0.3);
    for (const edu of candidate.education) {
      doc.font("Helvetica-Bold").fontSize(10).fillColor(black).text(edu.degree, { continued: true });
      doc.font("Helvetica").fontSize(10).fillColor(gray).text(`  —  ${edu.institution}`, { continued: true });
      doc.font("Helvetica").fontSize(9).fillColor(gray).text(`    ${edu.year}`, { align: "right" });
      doc.moveDown(0.15);
    }

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

console.log("Generating resumes...");
for (const c of candidates) {
  await generateResume(c);
  console.log(`  ✓ ${c.fileName}`);
}
console.log(`\nDone! Generated ${candidates.length} resumes in public/resumes/`);
