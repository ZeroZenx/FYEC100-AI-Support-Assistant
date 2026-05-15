import fs from "fs/promises";
import path from "path";
import {
  getMoodleContextQueryString,
  MoodleLaunchSource,
  MoodleRole
} from "@/lib/moodleContext";

const SIMULATOR_PATH = path.join(
  process.cwd(),
  "data",
  "moodle-launch-simulator.json"
);

type ScenarioStatus = "ready" | "planned" | "watch";
type CheckStatus = "ready" | "watch";

export type MoodleLaunchSimulatorScenario = {
  id: string;
  title: string;
  role: MoodleRole;
  launchSource: MoodleLaunchSource;
  moodlePlacement: string;
  coursePage: string;
  expectedBehavior: string;
  status: ScenarioStatus;
};

type MoodleLaunchSimulatorCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  owner: string;
  evidence: string;
};

type MoodleLaunchSimulatorRecord = {
  version: string;
  simulatorStatus: "ready" | "watch";
  targetCourse: {
    courseId: string;
    courseShortName: string;
    courseFullName: string;
    pilotLocation: string;
  };
  defaultPreview: {
    role: MoodleRole;
    launchSource: MoodleLaunchSource;
    moodlePlacement: string;
    coursePage: string;
  };
  scenarios: MoodleLaunchSimulatorScenario[];
  requiredChecks: MoodleLaunchSimulatorCheck[];
  notes: string[];
};

export async function buildMoodleLaunchSimulator() {
  const record = await readSimulatorRecord();
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:4100";
  const moodleOrigin = process.env.MOODLE_ORIGIN ?? "";
  const fallbackUrl = `${appBaseUrl}/embed`;
  const scenarioPreviews = record.scenarios.map((scenario) => {
    const previewUrl = buildPreviewUrl(appBaseUrl, record, scenario);

    return {
      ...scenario,
      previewUrl,
      iframeSnippet: `<iframe src="${previewUrl}" width="100%" height="760" style="border:0; width:100%; min-height:760px;" title="FYEC100 AI Academic Support Assistant"></iframe>`
    };
  });
  const requiredChecks = record.requiredChecks.map((check) =>
    check.id === "MLC-005" && moodleOrigin
      ? {
          ...check,
          status: "ready" as const,
          evidence: `MOODLE_ORIGIN is configured as ${moodleOrigin}.`
        }
      : check
  );
  const summary = {
    scenarios: scenarioPreviews.length,
    readyScenarios: scenarioPreviews.filter((scenario) => scenario.status === "ready")
      .length,
    plannedScenarios: scenarioPreviews.filter(
      (scenario) => scenario.status === "planned"
    ).length,
    readyChecks: requiredChecks.filter((check) => check.status === "ready").length,
    watchChecks: requiredChecks.filter((check) => check.status === "watch").length
  };

  return {
    exportPath: "/api/admin/moodle-launch-simulator.md",
    fallbackUrl,
    generatedAt: new Date().toISOString(),
    moodleOrigin: moodleOrigin || null,
    record: {
      ...record,
      requiredChecks
    },
    scenarioPreviews,
    statusMessage:
      summary.watchChecks > 0
        ? "Launch simulator is ready for local testing, with Moodle origin still needing hosted-pilot configuration."
        : "Launch simulator is ready for controlled Moodle pilot rehearsal.",
    summary,
    trustBoundary:
      "Simulator context is URL-based pilot context only. It must not be treated as authenticated Moodle identity, enrolment, or role validation."
  };
}

export async function renderMoodleLaunchSimulatorMarkdown() {
  const simulator = await buildMoodleLaunchSimulator();

  return [
    "# FYEC100 Moodle Pilot Launch Simulator",
    "",
    `Generated: ${new Date(simulator.generatedAt).toLocaleString()}`,
    "",
    "## Summary",
    "",
    `- Status: ${simulator.record.simulatorStatus}`,
    `- Scenarios: ${simulator.summary.scenarios}`,
    `- Ready scenarios: ${simulator.summary.readyScenarios}`,
    `- Planned scenarios: ${simulator.summary.plannedScenarios}`,
    `- Watch checks: ${simulator.summary.watchChecks}`,
    `- Moodle origin: ${simulator.moodleOrigin ?? "Not configured"}`,
    "",
    "## Target Course",
    "",
    `- Course ID: ${simulator.record.targetCourse.courseId}`,
    `- Course short name: ${simulator.record.targetCourse.courseShortName}`,
    `- Course full name: ${simulator.record.targetCourse.courseFullName}`,
    `- Pilot location: ${simulator.record.targetCourse.pilotLocation}`,
    "",
    "## Scenario Preview Links",
    "",
    ...simulator.scenarioPreviews.flatMap((scenario) => [
      `### ${scenario.id}: ${scenario.title}`,
      "",
      `- Status: ${scenario.status}`,
      `- Role: ${scenario.role}`,
      `- Launch source: ${scenario.launchSource}`,
      `- Moodle placement: ${scenario.moodlePlacement}`,
      `- Course page: ${scenario.coursePage}`,
      `- Preview URL: ${scenario.previewUrl}`,
      `- Expected behavior: ${scenario.expectedBehavior}`,
      ""
    ]),
    "## Required Checks",
    "",
    ...simulator.record.requiredChecks.map(
      (check) =>
        `- [${check.status}] ${check.id} - ${check.label} (${check.owner}): ${check.evidence}`
    ),
    "",
    "## Fallback Link",
    "",
    simulator.fallbackUrl,
    "",
    "## Trust Boundary",
    "",
    simulator.trustBoundary,
    "",
    "## Notes",
    "",
    ...simulator.record.notes.map((note) => `- ${note}`),
    ""
  ].join("\n");
}

async function readSimulatorRecord(): Promise<MoodleLaunchSimulatorRecord> {
  const raw = await fs.readFile(SIMULATOR_PATH, "utf8");
  const parsed = JSON.parse(raw) as MoodleLaunchSimulatorRecord;

  return {
    ...parsed,
    scenarios: parsed.scenarios ?? [],
    requiredChecks: parsed.requiredChecks ?? [],
    notes: parsed.notes ?? []
  };
}

function buildPreviewUrl(
  appBaseUrl: string,
  record: MoodleLaunchSimulatorRecord,
  scenario: MoodleLaunchSimulatorScenario
) {
  const contextQuery = getMoodleContextQueryString({
    courseId: record.targetCourse.courseId,
    courseShortName: record.targetCourse.courseShortName,
    launchSource: scenario.launchSource,
    role: scenario.role
  });
  const params = new URLSearchParams(contextQuery);

  params.set("moodlePlacement", scenario.moodlePlacement);
  params.set("coursePage", scenario.coursePage);

  return `${appBaseUrl}/embed?${params.toString()}`;
}
