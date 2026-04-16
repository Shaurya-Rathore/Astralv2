---
name: github-skill-extractor
description: Build or use GitHub-based skill inference for candidates using evidence-backed repository and contribution signals.
disable-model-invocation: true
---

When invoked:

Goal:
Infer candidate skills from GitHub with evidence and confidence.

Rules:
- Treat GitHub skill output as inferred evidence, not truth.
- Prefer public, inspectable signals.
- Return structured JSON with:
  - inferredSkills: [{ skill, confidence, evidence }]
  - repoHighlights
  - languagesSummary
  - activitySummary
  - caveats

Use these evidence sources:
- repository languages
- repository metadata and topics
- package/config files from repository contents
- contribution patterns and repository mix
- repository activity/statistics
- README and workflow/tooling references when useful

Output must always include:
- evidence snippets
- confidence score
- clear caveats
