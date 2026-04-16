import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { createResume } from "@/lib/store";

const execFileAsync = promisify(execFile);

function extractSections(text: string) {
  const sectionHeaders = [
    { key: "summary", patterns: ["SUMMARY", "PROFILE", "ABOUT", "OBJECTIVE"] },
    { key: "skills", patterns: ["TECHNICAL SKILLS", "SKILLS", "TECHNOLOGIES", "COMPETENCIES"] },
    { key: "experience", patterns: ["EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT", "PROFESSIONAL EXPERIENCE"] },
    { key: "education", patterns: ["EDUCATION", "ACADEMIC", "QUALIFICATIONS"] },
  ];

  const allPatterns = sectionHeaders.flatMap((s) => s.patterns);
  const headerRegex = new RegExp(`(?:^|\\s)(${allPatterns.join("|")})(?:\\s|$)`, "gi");
  const matches: { key: string; start: number; headerEnd: number }[] = [];
  let m;
  while ((m = headerRegex.exec(text)) !== null) {
    const matched = m[1];
    const header = sectionHeaders.find((s) =>
      s.patterns.some((p) => p.toLowerCase() === matched.toLowerCase()),
    );
    if (header) {
      matches.push({ key: header.key, start: m.index, headerEnd: m.index + m[0].length });
    }
  }

  const sections: Record<string, string> = {};
  for (let i = 0; i < matches.length; i++) {
    const end = i + 1 < matches.length ? matches[i + 1].start : text.length;
    sections[matches[i].key] = text.substring(matches[i].headerEnd, end).trim();
  }

  const summary = sections.summary || "";

  const skills = (sections.skills || "")
    .split(/[•·,|]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 50);

  const experience: { company: string; title: string; startYear: number; endYear: number | null; highlights: string[] }[] = [];
  if (sections.experience) {
    const expText = sections.experience;
    const periodRegex = /(\d{4})\s*[–—-]\s*(Present|\d{4})/gi;
    let match;
    const jobPositions: { index: number; startYear: number; endYear: number | null }[] = [];
    while ((match = periodRegex.exec(expText)) !== null) {
      jobPositions.push({
        index: match.index,
        startYear: parseInt(match[1], 10),
        endYear: match[2].toLowerCase() === "present" ? null : parseInt(match[2], 10),
      });
    }
    for (let j = 0; j < jobPositions.length; j++) {
      const pos = jobPositions[j];
      const periodEnd = expText.indexOf(pos.endYear === null ? "Present" : String(pos.endYear), pos.index) + (pos.endYear === null ? 7 : 4);
      const headerText = expText.substring(j === 0 ? 0 : jobPositions[j - 1].index + 20, pos.index).trim();
      const nextStart = j + 1 < jobPositions.length ? jobPositions[j + 1].index : expText.length;
      const bodyText = expText.substring(periodEnd, nextStart).trim();

      const tcParts = headerText.split(/\s+—\s+/);
      const title = (tcParts[0] || "").replace(/\d{4}\s*[–—-]\s*(Present|\d{4})/, "").trim();
      const company = (tcParts[1] || "").replace(/\d{4}\s*[–—-]\s*(Present|\d{4})/, "").trim();

      const highlights = bodyText
        .split(/•/)
        .map((h) => h.trim())
        .filter((h) => h.length > 10);

      experience.push({
        title: title || "Unknown",
        company: company || title || "Unknown",
        startYear: pos.startYear,
        endYear: pos.endYear,
        highlights,
      });
    }
  }

  const education: { institution: string; degree: string; field: string; year: number }[] = [];
  if (sections.education) {
    const eduParts = sections.education.split(/(?=\S+\.?\s+\S+.*?—.*?\d{4})/);
    for (const block of eduParts) {
      const yearMatch = block.match(/(\d{4})/);
      if (!yearMatch) continue;
      const parts = block.replace(/\d{4}/, "").split(/\s+—\s+/);
      const degreeField = (parts[0] || "").trim();
      const degreeParts = degreeField.match(/^(B\.?\w*\.?|M\.?\w*\.?|Ph\.?D\.?|MBA|M\.Eng\.?|B\.Tech\.?|M\.F\.A\.?|B\.F\.A\.?)\s+(.+)/i);
      education.push({
        degree: degreeParts ? degreeParts[1] : degreeField.split(" ").slice(0, 2).join(" "),
        field: degreeParts ? degreeParts[2] : degreeField,
        institution: (parts[1] || "").trim(),
        year: parseInt(yearMatch[1], 10),
      });
    }
  }

  return { summary, skills, experience, education };
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const candidateId = formData.get("candidateId") as string | null;

  if (!file || !candidateId) {
    return NextResponse.json({ error: "Missing file or candidateId" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const resumePath = join(process.cwd(), "public", "resumes", safeFileName);
  await writeFile(resumePath, buffer);

  let text: string;
  try {
    const extractScript = join(process.cwd(), "scripts", "extract-pdf-text.mjs");
    const { stdout } = await execFileAsync("node", [extractScript, resumePath], { timeout: 15000 });
    text = stdout;
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 422 });
  }

  const { summary, skills, experience, education } = extractSections(text);

  const resume = createResume({
    candidateId,
    fileName: safeFileName,
    summary,
    skills,
    education,
    experience,
  });

  return NextResponse.json({ resume, rawTextLength: text.length });
}
