import { appendFile, copyFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { readEvaluationDataset } from "@/lib/evaluationAutomation";
import { buildKnowledgeFeedbackSuggestions } from "@/lib/kbFeedbackLoop";

const KB_PATH = path.join(process.cwd(), "data", "fyec100-knowledge-base.md");
const SNAPSHOT_DIR = path.join(process.cwd(), "data", "kb-snapshots");
const REGRESSION_PATH = path.join(process.cwd(), "data", "kb-regression-results.jsonl");
const PUBLISH_LOG_PATH = path.join(process.cwd(), "data", "kb-publish-events.jsonl");

export async function runKnowledgeBaseRegression() {
  const [dataset, suggestions, knowledgeBase] = await Promise.all([
    readEvaluationDataset(),
    buildKnowledgeFeedbackSuggestions(),
    readFile(KB_PATH, "utf8")
  ]);
  const approved = suggestions.suggestions.filter((item) => item.status === "approved");
  const results = dataset.prompts.map((prompt) => {
    const requiresRefusal = prompt.requiresRefusal;
    const relatedSuggestion = approved.find((item) =>
      prompt.prompt.toLowerCase().includes(item.topic.toLowerCase().split(" ")[0])
    );
    const checks = {
      fallbackStillPresent: /lecturer|lms administrator|official/i.test(knowledgeBase),
      guardrailStillPresent: /not write|full assignment|academic integrity|grade/i.test(knowledgeBase),
      hasApprovedSuggestion: approved.length > 0 ? Boolean(relatedSuggestion) || !/missing|moodle|assignment/i.test(prompt.prompt) : true,
      refusesWhenRequired: requiresRefusal ? /cannot|not write|integrity/i.test(knowledgeBase) : true
    };

    return {
      checks,
      id: crypto.randomUUID(),
      passed: Object.values(checks).every(Boolean),
      promptId: prompt.id,
      prompt: prompt.prompt,
      relatedSuggestionId: relatedSuggestion?.id || "",
      timestamp: new Date().toISOString()
    };
  });
  const summary = {
    failed: results.filter((item) => !item.passed).length,
    passed: results.filter((item) => item.passed).length,
    total: results.length
  };
  const run = {
    id: `KBRUN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    results,
    summary,
    timestamp: new Date().toISOString()
  };

  await appendFile(REGRESSION_PATH, `${JSON.stringify(run)}\n`, "utf8");

  return run;
}

export async function readKnowledgeBaseRegressionRuns() {
  try {
    const content = await readFile(REGRESSION_PATH, "utf8");
    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Awaited<ReturnType<typeof runKnowledgeBaseRegression>>)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    return [];
  }
}

export async function buildKnowledgeBasePublishStatus() {
  const [runs, suggestions] = await Promise.all([
    readKnowledgeBaseRegressionRuns(),
    buildKnowledgeFeedbackSuggestions()
  ]);
  const latest = runs[0];
  const approvedSuggestions = suggestions.suggestions.filter((item) => item.status === "approved");

  return {
    approvedSuggestions,
    generatedAt: new Date().toISOString(),
    latestRegression: latest || null,
    publishReady: approvedSuggestions.length > 0 && Boolean(latest) && latest.summary.failed === 0,
    requirements: [
      { label: "Approved KB suggestion", pass: approvedSuggestions.length > 0 },
      { label: "Regression run complete", pass: Boolean(latest) },
      { label: "No regression failures", pass: Boolean(latest) && latest.summary.failed === 0 },
      { label: "Rollback snapshot will be created", pass: true }
    ]
  };
}

export async function publishApprovedKnowledgeBaseChanges(input: {
  approvedBy: string;
  releaseNote: string;
}) {
  const status = await buildKnowledgeBasePublishStatus();
  if (!status.publishReady) {
    return {
      ok: false,
      message: "Knowledge base is not publish-ready. Approve suggestions and pass regression first.",
      status
    };
  }

  const snapshotName = `fyec100-knowledge-base-${Date.now()}.md`;
  const snapshotPath = path.join(SNAPSHOT_DIR, snapshotName);
  await mkdir(SNAPSHOT_DIR, { recursive: true });
  await copyFile(KB_PATH, snapshotPath);
  const current = await readFile(KB_PATH, "utf8");
  const addition = [
    "",
    "## Approved Pilot Clarifications",
    "",
    ...status.approvedSuggestions.flatMap((item) => [
      `### ${item.topic}`,
      item.draftWording,
      ""
    ])
  ].join("\n");
  await writeFile(KB_PATH, `${current.trim()}\n${addition}\n`, "utf8");
  const event = {
    approvedBy: input.approvedBy || "Project Lead / Lecturer",
    id: `KBPUB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    releaseNote: input.releaseNote || "Published approved feedback-driven FYEC100 clarifications.",
    snapshotPath: `data/kb-snapshots/${snapshotName}`,
    timestamp: new Date().toISOString()
  };
  await appendFile(PUBLISH_LOG_PATH, `${JSON.stringify(event)}\n`, "utf8");

  return {
    event,
    ok: true,
    message: "Knowledge base changes published with rollback snapshot.",
    status
  };
}
