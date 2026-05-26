import { getAdminAuthStatus } from "@/lib/adminAuth";
import { getProviderStatus } from "@/lib/aiProvider";
import { getCourseReadiness, readCourseRegistry } from "@/lib/courseRegistry";
import { buildEvaluationAutomationLayer } from "@/lib/evaluationAutomation";
import { buildKnowledgeBasePublishStatus } from "@/lib/kbReleasePipeline";
import { readLaunchChecklist, type LaunchChecklistStatus } from "@/lib/launchChecklist";
import { readLtiLaunchStates } from "@/lib/ltiLaunch";
import { readPhase2GateOverrides } from "@/lib/phase2GateOverrides";
import { buildSupportCaseSummary } from "@/lib/serviceDeskCases";
import { getStorageProviderStatus } from "@/lib/storageProvider";

export type Phase2GateItem = {
  actionHref: string;
  actionLabel: string;
  area: string;
  detail: string;
  label: string;
  owner: string;
  status: "blocked" | "needs-review" | "ready";
};

export type Phase2CommandAction = {
  description: string;
  href: string;
  label: string;
  owner: string;
};

export async function buildPhase2CompletionGate() {
  const [
    registry,
    provider,
    launch,
    support,
    kbPublish,
    evaluation,
    storage,
    ltiStates,
    overrides
  ] = await Promise.all([
    readCourseRegistry(),
    Promise.resolve(getProviderStatus()),
    readLaunchChecklist(),
    buildSupportCaseSummary(),
    buildKnowledgeBasePublishStatus(),
    buildEvaluationAutomationLayer(),
    getStorageProviderStatus(),
    readLtiLaunchStates(),
    readPhase2GateOverrides()
  ]);
  const admin = getAdminAuthStatus();
  const adminLocalOnly = Boolean(overrides.adminProtectionLocalOnly);
  const course = registry.courses.find((item) => item.courseCode === "FYEC100") ?? registry.courses[0];
  const readiness = getCourseReadiness(course);
  const launchCounts = countLaunchStatuses(launch.items.map((item) => item.status));
  const productionCollections = storage.collections.filter(
    (item) => item.target === "production-approved-store"
  );
  const evaluationReady = evaluation.summary.total > 0 && evaluation.summary.failed === 0;
  const kbRegressionReady =
    Boolean(kbPublish.latestRegression) && kbPublish.latestRegression?.summary.failed === 0;
  const launchReady = launchCounts.blocked === 0 && launchCounts.passed >= 3;
  const adminReady = admin.configured || adminLocalOnly;
  const gateItems: Phase2GateItem[] = [
    {
      actionHref: "/course-routing-test",
      actionLabel: "Test routing",
      area: "Student / Moodle",
      detail: `${course.courseCode} resolves to ${course.knowledgeBasePath}; lifecycle ${course.lifecycleStatus}; pilot ${course.pilotEnabled ? "enabled" : "disabled"}.`,
      label: "Course-aware chat routing",
      owner: "Developer / LMS Administrator",
      status: readiness.ready && course.pilotEnabled ? "ready" : "needs-review"
    },
    {
      actionHref: "/moodle-embed-generator",
      actionLabel: "Generate embed pack",
      area: "Moodle/LMS",
      detail: "Moodle iframe, fallback link, student notice, lecturer note, and placement checks are available for test-course use.",
      label: "Moodle pilot placement",
      owner: "LMS Administrator",
      status: "ready"
    },
    {
      actionHref: "/provider-console",
      actionLabel: "Test provider",
      area: "AI Providers",
      detail: `${provider.provider} / ${provider.model}; configured ${provider.configured ? "yes" : "no"}.`,
      label: "AI provider configured and testable",
      owner: "Technical Lead / IT",
      status: provider.configured ? "ready" : "needs-review"
    },
    {
      actionHref: "/support-handoff-center",
      actionLabel: "Review cases",
      area: "Support",
      detail: `${support.summary.open} open case(s), ${support.summary.highPriorityOpen} high-priority open case(s). Student escalations write structured support records.`,
      label: "Human support handoff",
      owner: "Project Lead / Support Owners",
      status: "ready"
    },
    {
      actionHref: "/kb-regression-publish",
      actionLabel: "Review KB release",
      area: "Knowledge Base",
      detail: kbRegressionReady
        ? kbPublish.publishReady
          ? "Regression evidence is clean, approved suggestions exist, and rollback snapshot support is available."
          : "Regression evidence is clean. Publishing still requires approved suggestions and lecturer release notes when content changes are needed."
        : "Workflow is available; Phase 2 gate requires a clean regression evidence run before Phase 3 planning.",
      label: "KB review, test, publish, rollback",
      owner: "Lecturer / Developer",
      status: kbRegressionReady ? "ready" : "needs-review"
    },
    {
      actionHref: "/evaluation-runner",
      actionLabel: "Run evaluation",
      area: "AI Quality",
      detail: `${evaluation.summary.total} latest result(s), ${evaluation.summary.failed} failure(s), ${evaluation.summary.passRate}% pass rate.`,
      label: "Evaluation runner",
      owner: "Lecturer / Governance",
      status: evaluationReady ? "ready" : "needs-review"
    },
    {
      actionHref: "/launch-checklist-execution",
      actionLabel: "Run checklist",
      area: "Launch",
      detail: `${launchCounts.passed} passed, ${launchCounts.blocked} blocked, decision ${launch.decision}.`,
      label: "Controlled launch execution",
      owner: "Project Lead",
      status:
        launchCounts.blocked > 0
          ? "blocked"
          : launchReady
            ? "ready"
            : "needs-review"
    },
    {
      actionHref: "/pilot-archive-builder",
      actionLabel: "Build archive",
      area: "Governance",
      detail: "Archive builder exports local pilot evidence with optional redaction, manifest, counts, warnings, and checksums.",
      label: "Pilot evidence archive",
      owner: "Governance / Project Lead",
      status: "ready"
    },
    {
      actionHref: "/admin-login",
      actionLabel: "Review access",
      area: "Security",
      detail: admin.configured
        ? "ADMIN_ACCESS_TOKEN is configured; admin APIs accept token or local session."
        : adminLocalOnly
          ? `Local-only Phase 2 mode acknowledged by ${overrides.adminProtectionLocalOnly?.acceptedBy}. Configure ADMIN_ACCESS_TOKEN before hosted pilot.`
        : "Local development allows admin access without ADMIN_ACCESS_TOKEN. Configure before hosted pilot.",
      label: "Admin access control",
      owner: "Technical Lead / Governance",
      status: adminReady ? "ready" : "needs-review"
    },
    {
      actionHref: "/storage-adapter-implementation",
      actionLabel: "Review storage",
      area: "Storage",
      detail: `${storage.adapter}; ${productionCollections.filter((item) => item.present).length}/${productionCollections.length} production-target pilot collections currently have local files.`,
      label: "Storage adapter boundary",
      owner: "IT / Developer",
      status: "ready"
    },
    {
      actionHref: "/trusted-launch-preview",
      actionLabel: "Review LTI path",
      area: "Moodle/LTI",
      detail: `${ltiStates.length} local launch state record(s). LTI validation is locally testable before production Moodle trust approval.`,
      label: "LTI readiness handoff",
      owner: "LMS Administrator / IT",
      status: ltiStates.length > 0 ? "ready" : "needs-review"
    }
  ];
  const ready = gateItems.filter((item) => item.status === "ready").length;
  const blocked = gateItems.filter((item) => item.status === "blocked").length;
  const needsReview = gateItems.filter((item) => item.status === "needs-review").length;
  const complete = blocked === 0 && evaluationReady && kbRegressionReady && launchReady && adminReady;

  return {
    actions: buildCommandActions(),
    generatedAt: new Date().toISOString(),
    gateItems,
    metrics: {
      ready,
      needsReview,
      blocked,
      total: gateItems.length,
      completion: `${Math.round((ready / gateItems.length) * 100)}%`
    },
    phase3Entry: complete
      ? "Phase 2 is close enough for a controlled pilot handoff and Phase 3 discovery planning."
      : "Resolve blocked and needs-review items before declaring Phase 2 complete.",
    summary: {
      blocked,
      complete,
      needsReview,
      ready,
      total: gateItems.length
    }
  };
}

function buildCommandActions(): Phase2CommandAction[] {
  return [
    {
      description: "Student and Moodle-facing assistant entry point.",
      href: "/chat",
      label: "Student chat",
      owner: "Students / Lecturer"
    },
    {
      description: "Copy-ready Moodle iframe, fallback link, and notices.",
      href: "/moodle-embed-generator",
      label: "Moodle embed pack",
      owner: "LMS Administrator"
    },
    {
      description: "Structured cases from student escalation buttons.",
      href: "/support-handoff-center",
      label: "Support handoff",
      owner: "Support Owners"
    },
    {
      description: "Review, test, publish, and roll back course knowledge.",
      href: "/kb-regression-publish",
      label: "KB release control",
      owner: "Lecturer / Developer"
    },
    {
      description: "OpenAI, DeepSeek, or Ollama provider status and test.",
      href: "/provider-console",
      label: "Provider console",
      owner: "Technical Lead"
    },
    {
      description: "Launch checklist, decision, and local timeline.",
      href: "/launch-checklist-execution",
      label: "Launch execution",
      owner: "Project Lead"
    },
    {
      description: "Redacted pilot archive for governance review.",
      href: "/pilot-archive-builder",
      label: "Pilot archive",
      owner: "Governance"
    },
    {
      description: "Run safety and quality checks before expansion.",
      href: "/evaluation-runner",
      label: "Evaluation runner",
      owner: "Lecturer / Governance"
    }
  ];
}

function countLaunchStatuses(statuses: LaunchChecklistStatus[]) {
  return statuses.reduce<Record<LaunchChecklistStatus, number>>(
    (counts, status) => {
      counts[status] += 1;
      return counts;
    },
    {
      blocked: 0,
      "in-progress": 0,
      "not-started": 0,
      passed: 0,
      skipped: 0
    }
  );
}
