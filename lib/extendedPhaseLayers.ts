import { getProviderStatus } from "@/lib/aiProvider";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";
import { buildEvaluationAutomationLayer } from "@/lib/evaluationAutomation";
import {
  metric,
  recordCard,
  renderHtmlReport
} from "@/lib/htmlReport";
import { getKnowledgeBaseApplyChecklist } from "@/lib/knowledgeBaseApplyChecklist";
import { getKnowledgeBaseChangeRequests } from "@/lib/knowledgeBaseChangeRequests";
import { getKnowledgeBaseDraftUpdates } from "@/lib/knowledgeBaseDraftUpdates";
import { getKnowledgeBaseMetadata } from "@/lib/knowledgeBase";
import { getKnowledgeBaseReleases } from "@/lib/knowledgeBaseReleases";
import { getKnowledgeBaseReviewStatus } from "@/lib/knowledgeBaseReview";
import { getLtiReadiness } from "@/lib/ltiReadiness";
import { buildPilotAnalytics } from "@/lib/pilotAnalytics";
import { readPilotFeedbackRecords, readPilotFeedbackSummary } from "@/lib/pilotFeedback";
import { getPilotSignoffStatus } from "@/lib/pilotSignoff";
import {
  buildServiceDeskLayer,
  buildStudentExperienceLayer
} from "@/lib/productionLayers";
import { getStorageProviderStatus } from "@/lib/storageProvider";
import { buildSupportTriage } from "@/lib/supportTriage";

export type ExtendedRecord = {
  detail: string;
  label: string;
  owner: string;
  status: string;
};

export async function buildLecturerContentIntelligenceLayer() {
  const [feedback, triage, changes, student] = await Promise.all([
    readPilotFeedbackRecords(),
    buildSupportTriage(),
    getKnowledgeBaseChangeRequests(),
    buildStudentExperienceLayer()
  ]);
  const clusters = clusterFeedback(feedback);
  const highRiskGaps = changes.pending.filter((change) => change.priority === "high");

  return {
    clarificationQueue: [
      ...triage.queue.slice(0, 5).map((entry) =>
        item(entry.category, entry.owner, entry.priority, `${entry.question} Suggested clarification: ${entry.recommendedAction}`)
      ),
      item("Moodle announcement candidate", "Lecturer / LMS Administrator", "review", "Clarify FYEC100 expectations, acceptable AI support, and where students should go for human help.")
    ],
    clusters,
    generatedAt: new Date().toISOString(),
    interventions: [
      item("Quick class reminder", "Lecturer", "review", "Use when repeated questions point to a misunderstood course expectation."),
      item("Moodle announcement", "Lecturer / LMS Administrator", "review", "Use when the same LMS or assignment-boundary issue appears across students."),
      item("Short orientation note", "Lecturer", "ready", "Use for first-week FYEC100 habits, planning, and responsible AI guidance."),
      item("Mini-workshop", "Project Lead / Lecturer", "watch", "Use if study planning or academic integrity confusion remains frequent."),
      item("Knowledge base update", "Lecturer / Developer", highRiskGaps.length ? "review" : "ready", "Move confirmed gaps into the KB draft and release control process."),
      item("Keep human-led", "Lecturer", "review", "Keep grading, policy exceptions, personal student issues, and ambiguous assignment interpretation with staff.")
    ],
    metrics: {
      clusters: clusters.length,
      feedbackRecords: feedback.length,
      triageItems: triage.queue.length,
      highRiskGaps: highRiskGaps.length,
      promptStarters: student.promptStarters.length
    },
    severity: changes.pending.map((change) =>
      item(change.title, change.owner, change.priority, `${change.knowledgeBaseSection}: ${change.recommendedChange || change.rationale}`)
    )
  };
}

export async function buildEnterpriseReleaseManagementLayer() {
  const [deployment, evaluation, checklist, releases] = await Promise.all([
    getDeploymentReadiness(),
    buildEvaluationAutomationLayer(),
    getKnowledgeBaseApplyChecklist(),
    getKnowledgeBaseReleases()
  ]);

  return {
    approvalGate: [
      item("Build passed", "Developer", "ready", "Latest production build verification should be attached before release."),
      item("Smoke passed", "Developer / System Administrator", "ready", "Run npm run smoke:pilot against the target URL before release."),
      item("Evaluation passed", "Lecturer / Governance", evaluation.summary.failed ? "review" : "ready", `${evaluation.summary.failed} automated evaluation failure(s).`),
      item("KB approved", "Lecturer / Content Owner", checklist.readyToApply ? "ready" : "review", checklist.statusMessage),
      item("Rollback ready", "System Administrator", "review", "Record previous commit, backup location, rollback trigger, and recovery smoke result."),
      item("Owner approved", "Project Lead", "review", "Sponsor, IT, LMS, lecturer, governance, and developer approvals should match release scope.")
    ],
    calendar: [
      item("Teaching-week sensitivity", "Project Lead / Lecturer", "review", "Avoid disruptive releases near assessment deadlines or first-day orientation windows."),
      item("Release window", "System Administrator", "review", "Schedule outside peak Moodle usage where possible."),
      item("Blackout periods", "Project Sponsor", "planned", "Define no-change dates for exams, major assignments, and institutional maintenance."),
      item("Post-release review", "Project Lead", "ready", "Review support signals, smoke result, and rollback readiness after each release.")
    ],
    changelog: [
      item("App release notes", "Developer", "ready", "Summarize route, API, guardrail, auth, deployment, and report changes in plain language."),
      item("KB release notes", "Lecturer / Developer", releases.summary.total ? "ready" : "watch", `${releases.summary.total} knowledge base release note record(s).`),
      item("Audience notes", "Project Lead", "review", "Separate sponsor, lecturer, LMS admin, IT, governance, and student-facing changes.")
    ],
    generatedAt: new Date().toISOString(),
    metrics: {
      deploymentWarnings: deployment.summary.warn,
      deploymentFailures: deployment.summary.fail,
      evaluationPassRate: `${evaluation.summary.passRate}%`,
      kbPublishReady: checklist.readyToApply ? "Yes" : "No",
      kbReleaseNotes: releases.summary.total
    },
    register: [
      item("App release", "Developer", "ready", "Track commit hash, build result, smoke result, changed pages, and changed APIs."),
      item("Knowledge base release", "Lecturer / Developer", "review", "Track approved content changes, release notes, and rollback snapshot."),
      item("Moodle placement change", "LMS Administrator", "review", "Track iframe/block/LTI placement, affected course shell, and rollback action."),
      item("Provider config change", "Technical Lead / Governance", "review", "Track provider, model, data handling approval, and fallback decision."),
      item("Auth/storage/infrastructure change", "IT / Governance", "review", "Track production risk, owner approval, and rollback evidence.")
    ],
    rollback: [
      item("Rollback trigger", "Project Lead / IT", "review", "App unavailable, Moodle frame blocked, unsafe response, privacy concern, provider failure, or high support backlog."),
      item("Previous version", "Developer", "ready", "Record previous commit hash and last known-good build."),
      item("Backup location", "System Administrator", "review", "Record .env, local data, KB snapshot, logs, and release evidence location."),
      item("Recovery smoke", "Developer / System Administrator", "ready", "Run smoke suite after rollback before restoring Moodle placement.")
    ]
  };
}

export async function buildAiBenchmarkCostLayer() {
  const [provider, evaluation, analytics] = await Promise.all([
    Promise.resolve(getProviderStatus()),
    buildEvaluationAutomationLayer(),
    buildPilotAnalytics()
  ]);
  const estimatedMonthlyRequests = Math.max(analytics.summary.totalFeedback * 20, 250);

  return {
    approval: [
      item("OpenAI", "Governance / Technical Lead", provider.provider === "openai" && evaluation.summary.failed === 0 ? "pilot-only" : "review", "Approve only after quality, privacy, data handling, and cost review."),
      item("DeepSeek", "Governance / Technical Lead", provider.provider === "deepseek" && evaluation.summary.failed === 0 ? "pilot-only" : "review", "Use same safety dataset and hosted-provider review before student use."),
      item("Ollama/local", "System Administrator / Governance", provider.provider === "ollama" ? "pilot-only" : "available", "Useful for local testing where VM capacity and model behavior are acceptable."),
      item("Fallback-only", "Project Sponsor / IT", "review", "Keep fallback decisions explicit when preferred provider is unavailable or fails safety checks.")
    ],
    cost: [
      item("Pilot request estimate", "Project Sponsor / Technical Lead", "review", `${estimatedMonthlyRequests} estimated monthly pilot requests for planning only.`),
      item("Scaled course estimate", "Project Sponsor / IT", "planned", "Multiply by active courses, enrolment, pilot weeks, and expected student usage."),
      item("Hosted provider tradeoff", "Governance / IT", "review", "Review data handling, contract, reliability, latency, and usage cost."),
      item("Local model tradeoff", "System Administrator", "review", "Review VM CPU/RAM/GPU capacity, support burden, quality, and uptime.")
    ],
    generatedAt: new Date().toISOString(),
    metrics: {
      activeProvider: provider.provider,
      configured: provider.configured ? "Yes" : "No",
      evaluationPrompts: evaluation.dataset.prompts.length,
      evaluationPassRate: `${evaluation.summary.passRate}%`,
      estimatedMonthlyRequests
    },
    reliability: [
      item("Latency tracking", "Technical Lead", "planned", "Record response time by provider during benchmark runs."),
      item("Failure count", "Technical Lead", "planned", "Track timeout, provider error, fallback, and local model unavailable events."),
      item("Fallback usage", "Project Lead / Technical Lead", "review", "Review whether fallback responses still meet FYEC100 support expectations."),
      item("Local availability", "System Administrator", provider.provider === "ollama" ? "review" : "planned", "Track whether Ollama is reachable on the VM or local host.")
    ],
    runs: [
      item("Approved FYEC100 prompt set", "Lecturer / Governance", "ready", `${evaluation.dataset.prompts.length} evaluation prompt(s) available.`),
      item("OpenAI benchmark", "Technical Lead", "available", "Run against approved dataset without real student data."),
      item("DeepSeek benchmark", "Technical Lead", "available", "Run against approved dataset without real student data."),
      item("Ollama benchmark", "System Administrator", "available", "Run locally when model and host are configured."),
      item("Future provider benchmark", "IT / Governance", "planned", "Add provider to registry before testing.")
    ],
    scorecard: [
      item("Accuracy and grounding", "Lecturer", evaluation.summary.failed ? "review" : "ready", "Compare responses against approved FYEC100 knowledge base."),
      item("Assignment-writing refusal", "Governance / Lecturer", "ready", "Check refusal behavior on risky prompts."),
      item("No grading claims", "Governance / Lecturer", "ready", "Confirm providers do not claim to grade work."),
      item("Escalation quality", "Project Lead", "review", "Check whether responses route students to lecturer, LMS admin, or IT when needed."),
      item("Tone", "Lecturer", "review", "Check first-year friendly language and boundaries.")
    ]
  };
}

export async function buildKnowledgeGovernanceLayer() {
  const [metadata, review, drafts, changes] = await Promise.all([
    getKnowledgeBaseMetadata(),
    getKnowledgeBaseReviewStatus(),
    getKnowledgeBaseDraftUpdates(),
    getKnowledgeBaseChangeRequests()
  ]);

  const openDraftCount = drafts.summary.draft + drafts.summary.pendingReview;

  return {
    currency: [
      item("FYEC100 knowledge base", "Lecturer / Developer", review.readyForPilot ? "ready" : "review", `${metadata.wordCount} word(s). ${review.statusMessage}`),
      item("Open draft changes", "Lecturer / Developer", openDraftCount ? "review" : "ready", `${openDraftCount} open draft update(s).`),
      item("Pending change requests", "Lecturer / Content Owner", changes.summary.pending ? "review" : "ready", `${changes.summary.pending} pending request(s).`),
      item("Next review date", "Lecturer / Governance", "planned", "Set a review cadence before multi-course expansion.")
    ],
    generatedAt: new Date().toISOString(),
    metrics: {
      kbWords: metadata.wordCount,
      approvedForPilot: review.readyForPilot ? "Yes" : "No",
      openDrafts: openDraftCount,
      pendingChanges: changes.summary.pending,
      highPriorityRisks: changes.summary.highPriorityPending
    },
    ownership: [
      item("FYEC100 content owner", "Lecturer / Content Owner", "review", "Owns approved course knowledge and assignment-boundary wording."),
      item("Reviewer", "Lecturer / Project Lead", "review", "Reviews content changes before publication."),
      item("Approver", "Project Sponsor / Lecturer", "review", "Approves AI-facing course knowledge for student use."),
      item("Source authority", "Lecturer / LMS Administrator", "ready", "Moodle course shell, course outline, approved FAQ, integrity policy, and LMS support notes.")
    ],
    policy: [
      item("Moodle course shell", "LMS Administrator / Lecturer", "approved-source", "Use only approved FYEC100 materials visible in Moodle."),
      item("Course outline", "Lecturer", "approved-source", "Use for expectations, course structure, and assessment boundaries."),
      item("Lecturer-approved FAQ", "Lecturer", "approved-source", "Use for repeated course questions after review."),
      item("Academic integrity policy", "Governance / Lecturer", "approved-source", "Use for responsible AI and assignment-boundary guidance."),
      item("Unsupported sources", "Governance", "restricted", "Do not infer policy from informal student messages or unapproved documents.")
    ],
    riskRegister: changes.pending.length
      ? changes.pending.map((change) =>
          item(change.title, change.owner, change.priority, change.rationale)
        )
      : [
          item("Unsupported claims", "Lecturer / Governance", "ready", "No active unsupported-claim risk is queued, but monitor new course content."),
          item("Old deadlines", "Lecturer / LMS Administrator", "watch", "Avoid fixed deadline claims unless the current Moodle shell confirms them."),
          item("Assignment-specific risk", "Lecturer", "review", "Keep interpretation of graded assignment requirements human-led.")
        ],
    workflow: [
      item("Propose", "Lecturer / Support Owner", "ready", "Record content need, source, and reason."),
      item("Review", "Lecturer / Content Owner", "review", "Check accuracy, integrity boundaries, and source authority."),
      item("Approve", "Project Lead / Lecturer", "review", "Confirm release note, fallback, and smoke evidence."),
      item("Publish", "Developer", "planned", "Apply approved content through release control."),
      item("Archive", "Developer / Governance", "planned", "Keep prior version and release evidence.")
    ]
  };
}

export async function buildSupportIntegrationLayer() {
  const [triage, serviceDesk] = await Promise.all([
    buildSupportTriage(),
    buildServiceDeskLayer()
  ]);

  return {
    connectors: [
      item("Email / Outlook mailbox", "IT / Project Lead", "planned", "Prepare a future connector for approved support mailbox routing."),
      item("Teams channel", "Project Lead / IT", "planned", "Prepare a future connector for support review notifications."),
      item("Microsoft Forms", "LMS Administrator / Project Lead", "planned", "Can collect structured student feedback if approved."),
      item("SharePoint list", "IT / Governance", "planned", "Potential approved storage path for support cases and evidence."),
      item("Ticketing system", "IT", "planned", "Future integration if COSTAATT uses a formal service desk system.")
    ],
    destinations: [
      item("Lecturer follow-up", "Lecturer", "ready", "Assignment interpretation, course policy, grades, and academic judgement."),
      item("LMS administrator", "LMS Administrator", "ready", "Moodle navigation, course shell placement, access to LMS materials."),
      item("IT help desk", "System Administrator", "review", "Technical access, hosted app availability, browser/device issues."),
      item("Academic support", "Project Lead / Student Support", "planned", "Study planning, transition support, and learning skills referrals."),
      item("Governance/privacy", "Governance Reviewer", "review", "Privacy concerns, sensitive data, and inappropriate stored records."),
      item("Project team", "Project Lead", "ready", "Pilot operations, decisions, risks, and cross-owner triage.")
    ],
    generatedAt: new Date().toISOString(),
    handoffTemplates: [
      item("Safe summary", "Support Owner", "ready", "Summarize issue type, course, urgency, and requested help without grades, passwords, IDs, or private details."),
      item("Lecturer handoff", "Lecturer", "review", "Include question theme and where the student should check official Moodle guidance."),
      item("LMS handoff", "LMS Administrator", "review", "Include Moodle page/placement issue and device/browser context if available."),
      item("Technical handoff", "System Administrator", "review", "Include URL, timestamp, browser, error message, and reproduction steps.")
    ],
    metrics: {
      activeCases: serviceDesk.metrics.activeCases,
      highPriority: serviceDesk.metrics.highPriority,
      destinations: 6,
      connectorScaffolds: 5,
      triageItems: triage.queue.length
    },
    routingRules: [
      item("Academic integrity concern", "Lecturer / Governance", "review", "Route to lecturer and governance if risk is repeated or severe."),
      item("Missing course information", "Lecturer / Developer", "review", "Route to content owner and KB workflow."),
      item("LMS navigation issue", "LMS Administrator", "ready", "Route to LMS admin with Moodle location and student-facing guidance."),
      item("Technical issue", "System Administrator / Developer", "review", "Route to IT/developer with health and logs context."),
      item("General FYEC100 support", "Lecturer / Project Lead", "ready", "Keep within approved course support and human escalation guidance.")
    ],
    sla: [
      item("High priority", "Project Lead", serviceDesk.metrics.highPriority ? "review" : "ready", "Review before next pilot window."),
      item("Medium priority", "Support Owner", "review", "Review in weekly pilot support cycle."),
      item("Low priority", "Pilot Review Team", "ready", "Summarize during post-pilot support review."),
      item("Overdue risk", "Project Lead", serviceDesk.metrics.highPriority ? "review" : "ready", serviceDesk.metrics.highPriority ? "High-priority item exists." : "No high-priority item currently active.")
    ]
  };
}

export async function buildUatLayer() {
  const [deployment, evaluation, kbReview, signoff] = await Promise.all([
    getDeploymentReadiness(),
    buildEvaluationAutomationLayer(),
    getKnowledgeBaseReviewStatus(),
    getPilotSignoffStatus()
  ]);
  const blocked =
    deployment.summary.fail + evaluation.summary.failed + (kbReview.readyForPilot ? 0 : 1);

  return {
    accessibilityMobile: [
      item("Keyboard navigation", "Developer / Accessibility Reviewer", "review", "Tab through chat, reports, feedback, and embedded Moodle views."),
      item("Iframe mobile view", "LMS Administrator", "review", "Confirm assistant is usable inside Moodle on phones."),
      item("Readable text", "Accessibility Reviewer", "ready", "Confirm headings, body text, controls, and status messages are readable."),
      item("Contrast", "Developer", "ready", "Confirm COSTAATT palette meets readable contrast expectations."),
      item("Human support visibility", "Lecturer / LMS Administrator", "review", "Students should know when to contact lecturer, LMS admin, or IT.")
    ],
    generatedAt: new Date().toISOString(),
    issueRegister: [
      item("Critical issue", "Project Lead", blocked ? "review" : "ready", blocked ? `${blocked} launch gate blocker(s) detected.` : "No automated critical UAT blocker detected."),
      item("Evidence link", "Tester / Project Lead", "planned", "Capture screenshot, route, role, expected behavior, actual behavior, owner, and retest status."),
      item("Retest status", "Project Lead", "planned", "Failed or blocked items require owner assignment and retest.")
    ],
    launchGate: [
      item("No critical UAT issues", "Project Lead", blocked ? "blocked" : "ready", `${blocked} blocker(s) from automated readiness checks.`),
      item("Smoke passed", "Developer", "ready", "Smoke suite should be attached to launch evidence."),
      item("Provider approved", "Governance / IT", evaluation.summary.failed ? "review" : "ready", `${evaluation.summary.failed} evaluation failure(s).`),
      item("KB approved", "Lecturer", kbReview.readyForPilot ? "ready" : "review", kbReview.statusMessage),
      item("Moodle embed tested", "LMS Administrator", deployment.moodleOrigin ? "review" : "blocked", deployment.moodleOrigin ? "Moodle origin is configured." : "MOODLE_ORIGIN is not configured."),
      item("Support ready", "Project Lead", "review", "Confirm support destinations, owners, and escalation SLAs."),
      item("Rollback ready", "System Administrator", "review", "Confirm rollback trigger, previous version, and smoke test command.")
    ],
    metrics: {
      scripts: 7,
      blocked,
      deploymentWarnings: deployment.summary.warn,
      evaluationPassRate: `${evaluation.summary.passRate}%`,
      kbReady: kbReview.readyForPilot ? "Yes" : "No",
      signoffReady: signoff.approvedForControlledPilot ? "Yes" : "No"
    },
    scripts: [
      item("Student UAT", "Student Tester / Lecturer", "review", "Ask FYEC100 question, use prompt starter, see integrity boundary, submit feedback, find human help."),
      item("Lecturer UAT", "Lecturer", "review", "Review content gap, evaluation result, lecturer brief, and KB release workflow."),
      item("LMS admin UAT", "LMS Administrator", "review", "Test Moodle iframe, placement, launch diagnostics, and fallback link."),
      item("IT/system admin UAT", "System Administrator", "review", "Run health, deployment, Windows scripts, IIS, logs, smoke, and rollback checks."),
      item("Governance UAT", "Governance Reviewer", "review", "Review privacy, retention, audit, provider, safety, and sign-off evidence."),
      item("Project lead UAT", "Project Lead", "review", "Review support queue, risks, closeout, role dashboards, and launch readiness."),
      item("Sponsor UAT", "Project Sponsor", "review", "Review executive status, benefits, risks, decision record, and launch gate.")
    ],
    tracker: [
      item("Not started", "Project Lead", "watch", "Assign scripts before formal UAT window."),
      item("In progress", "Tester", "review", "Capture evidence and issues as each role tests."),
      item("Passed", "Project Lead", "ready", "Passed scripts can move to launch gate evidence."),
      item("Failed / blocked", "Owner", blocked ? "blocked" : "watch", "Failed scripts require owner and retest."),
      item("Needs retest", "Tester / Owner", "planned", "Retest after fix and record result.")
    ]
  };
}

export async function buildLaunchControlLayer() {
  const [deployment, provider, lti, analytics, feedback] = await Promise.all([
    getDeploymentReadiness(),
    Promise.resolve(getProviderStatus()),
    Promise.resolve(getLtiReadiness()),
    buildPilotAnalytics(),
    readPilotFeedbackSummary()
  ]);
  const launchBlocked =
    deployment.summary.fail > 0 || lti.summary.warnings > 0 || !provider.configured;

  return {
    checklist: [
      item("Confirm app health", "System Administrator", deployment.summary.fail ? "blocked" : "ready", `${deployment.summary.fail} deployment failure(s).`),
      item("Enable Moodle placement", "LMS Administrator", deployment.moodleOrigin ? "review" : "blocked", deployment.moodleOrigin ? "Moodle origin configured." : "MOODLE_ORIGIN must be configured."),
      item("Verify iframe/LTI launch", "LMS Administrator / Developer", lti.summary.warnings ? "review" : "ready", `${lti.summary.warnings} LTI warning(s).`),
      item("Send notices", "Project Lead / Lecturer", "review", "Send student, lecturer, LMS admin, IT standby, and sponsor notices."),
      item("Monitor support", "Project Lead", analytics.summary.escalationCandidates ? "review" : "ready", `${analytics.summary.escalationCandidates} escalation candidate(s).`),
      item("Run smoke test", "Developer", "ready", "Run smoke test during launch window and record result."),
      item("Log decision", "Project Sponsor / Project Lead", "review", "Record go, pause, rollback, or continue monitoring decision.")
    ],
    commandCenter: [
      item("Launch status", "Project Sponsor / Project Lead", launchBlocked ? "blocked" : "review", launchBlocked ? "Launch has unresolved automated blockers." : "Launch can proceed after human sign-off."),
      item("Moodle placement status", "LMS Administrator", deployment.moodleOrigin ? "review" : "blocked", deployment.moodleOrigin || "Moodle origin not configured."),
      item("App health", "System Administrator", deployment.summary.fail ? "blocked" : "ready", `${deployment.summary.warn} warning(s), ${deployment.summary.fail} failure(s).`),
      item("Provider status", "Technical Lead", provider.configured ? "ready" : "review", `${provider.provider} / ${provider.model}`),
      item("Support readiness", "Project Lead", "review", `${feedback.total} feedback record(s) available for support trend review.`),
      item("Rollback readiness", "System Administrator", "review", "Confirm previous commit, backups, Moodle disable step, and smoke command.")
    ],
    communications: [
      item("Student notice", "Lecturer / LMS Administrator", "review", "Explain what the assistant can help with, what it cannot do, privacy-light pilot note, and human help route."),
      item("Lecturer note", "Project Lead", "review", "Summarize support boundaries, common escalation paths, and monitoring expectations."),
      item("LMS admin notice", "Project Lead", "review", "Confirm placement, fallback link, iframe/LTI checks, and launch window."),
      item("IT standby note", "System Administrator", "review", "Confirm health checks, service restart, logs, and rollback procedure."),
      item("Sponsor update", "Project Lead", "review", "Summarize launch status, risks, blockers, and decision points."),
      item("Fallback/rollback message", "Project Lead / LMS Administrator", "review", "Prepare Moodle message if assistant is paused or hidden.")
    ],
    generatedAt: new Date().toISOString(),
    metrics: {
      launchBlocked: launchBlocked ? "Yes" : "No",
      deploymentWarnings: deployment.summary.warn,
      ltiWarnings: lti.summary.warnings,
      providerConfigured: provider.configured ? "Yes" : "No",
      supportSignals: feedback.total,
      escalationCandidates: analytics.summary.escalationCandidates
    },
    postLaunch: [
      item("What happened", "Project Lead", "planned", "Record launch timeline, enablement step, smoke result, and Moodle behavior."),
      item("Issues found", "Support Owners", "planned", "Record support load, technical issues, content gaps, and student confusion."),
      item("Student signals", "Lecturer / Project Lead", "planned", "Review helpfulness, feedback, common needs, and integrity boundaries."),
      item("Lessons learned", "Pilot Review Team", "planned", "Capture what should change before scale."),
      item("Next actions", "Project Sponsor / Project Lead", "review", "Continue, revise, expand, pause, or roll back.")
    ],
    rollbackTriggers: [
      item("App unavailable", "System Administrator", "blocked-trigger", "Hide Moodle placement and restore last approved version."),
      item("Moodle frame blocked", "LMS Administrator", "blocked-trigger", "Use fallback link or disable placement until frame policy is fixed."),
      item("Provider failure", "Technical Lead", "review-trigger", "Switch to approved fallback or pause assistant."),
      item("Unsafe AI behavior", "Lecturer / Governance", "blocked-trigger", "Pause pilot and review guardrails/evaluation."),
      item("Privacy issue", "Governance", "blocked-trigger", "Stop pilot and follow privacy escalation process."),
      item("High support backlog", "Project Lead", "review-trigger", "Pause scale-up until support load is manageable.")
    ]
  };
}

export async function renderLecturerIntelligenceHtml() {
  const layer = await buildLecturerContentIntelligenceLayer();
  return html("FYEC100 Lecturer Content Intelligence Pack", "Common question clustering, lecturer clarification queue, teaching interventions, content gap severity, and recommended actions.", layer.generatedAt, [
    ["Common Question Clustering", metrics(layer.metrics) + cards(layer.clusters)],
    ["Lecturer Clarification Queue", cards(layer.clarificationQueue)],
    ["Teaching Intervention Planner", cards(layer.interventions)],
    ["Content Gap Severity Scoring", cards(layer.severity)]
  ]);
}

export async function renderEnterpriseReleaseHtml() {
  const layer = await buildEnterpriseReleaseManagementLayer();
  return html("FYEC100 Enterprise Release Management Pack", "Release register, approval gates, changelog, rollback evidence, release calendar, and production release readiness.", layer.generatedAt, [
    ["Release Register", metrics(layer.metrics) + cards(layer.register)],
    ["Release Approval Gate", cards(layer.approvalGate)],
    ["Changelog Workspace", cards(layer.changelog)],
    ["Rollback Evidence Register", cards(layer.rollback)],
    ["Release Calendar", cards(layer.calendar)]
  ]);
}

export async function renderBenchmarkGovernanceHtml() {
  const layer = await buildAiBenchmarkCostLayer();
  return html("FYEC100 AI Model Benchmark and Cost Governance Pack", "Provider benchmarks, quality and safety scorecard, reliability tracking, cost estimates, and approval recommendations.", layer.generatedAt, [
    ["Benchmark Run Workspace", metrics(layer.metrics) + cards(layer.runs)],
    ["Quality and Safety Scorecard", cards(layer.scorecard)],
    ["Latency and Reliability Tracker", cards(layer.reliability)],
    ["Cost Estimate Dashboard", cards(layer.cost)],
    ["Provider Approval Recommendation", cards(layer.approval)]
  ]);
}

export async function renderKnowledgeGovernanceHtml() {
  const layer = await buildKnowledgeGovernanceLayer();
  return html("COSTAATT Institutional Knowledge Governance Pack", "Knowledge ownership, approved source policy, currency review, governance workflow, and cross-course knowledge risks.", layer.generatedAt, [
    ["Knowledge Ownership Registry", metrics(layer.metrics) + cards(layer.ownership)],
    ["Approved Source Policy", cards(layer.policy)],
    ["Content Currency Dashboard", cards(layer.currency)],
    ["Knowledge Governance Workflow", cards(layer.workflow)],
    ["Cross-Course Knowledge Risk Register", cards(layer.riskRegister)]
  ]);
}

export async function renderSupportIntegrationHtml() {
  const layer = await buildSupportIntegrationLayer();
  return html("FYEC100 Enterprise Student Support Integration Pack", "Support destinations, escalation routing, handoff templates, connector scaffolds, SLA ownership, and privacy boundaries.", layer.generatedAt, [
    ["Support Destination Registry", metrics(layer.metrics) + cards(layer.destinations)],
    ["Escalation Routing Rules", cards(layer.routingRules)],
    ["Support Handoff Template Builder", cards(layer.handoffTemplates)],
    ["Service Desk Connector Scaffold", cards(layer.connectors)],
    ["Escalation SLA and Ownership Dashboard", cards(layer.sla)]
  ]);
}

export async function renderUatEvidenceHtml() {
  const layer = await buildUatLayer();
  return html("FYEC100 Production User Acceptance Testing Pack", "Role-based UAT scripts, tracker, issue register, accessibility/mobile checklist, launch gate, and sign-off evidence.", layer.generatedAt, [
    ["UAT Test Script Library", metrics(layer.metrics) + cards(layer.scripts)],
    ["Role-Based UAT Tracker", cards(layer.tracker)],
    ["UAT Issue Register", cards(layer.issueRegister)],
    ["Accessibility and Mobile UAT Checklist", cards(layer.accessibilityMobile)],
    ["Launch Acceptance Gate", cards(layer.launchGate)]
  ]);
}

export async function renderLaunchControlHtml() {
  const layer = await buildLaunchControlLayer();
  return html("FYEC100 Production Launch Control Pack", "Launch-day command center, communications, live checklist, rollback triggers, post-launch review, and project evidence.", layer.generatedAt, [
    ["Launch Day Command Center", metrics(layer.metrics) + cards(layer.commandCenter)],
    ["Launch Communications Workspace", cards(layer.communications)],
    ["Live Launch Checklist", cards(layer.checklist)],
    ["Rollback Trigger Monitor", cards(layer.rollbackTriggers)],
    ["Post-Launch Review Workspace", cards(layer.postLaunch)]
  ]);
}

function clusterFeedback(feedback: Awaited<ReturnType<typeof readPilotFeedbackRecords>>): ExtendedRecord[] {
  const themes = [
    ["Assignment expectations", "Lecturer", "review", ["assignment", "expectation", "rubric"]],
    ["Moodle navigation", "LMS Administrator", "review", ["moodle", "lms", "find", "navigation"]],
    ["Study planning", "Lecturer / Academic Support", "ready", ["study", "plan", "week", "time"]],
    ["Academic integrity", "Lecturer / Governance", "review", ["integrity", "plagiarism", "ai", "assignment"]],
    ["Deadlines", "Lecturer / LMS Administrator", "watch", ["deadline", "due", "date"]],
    ["Course concepts", "Lecturer", "review", ["concept", "explain", "understand"]]
  ] as const;

  return themes.map(([label, owner, status, keywords]) => {
    const count = feedback.filter((record) => {
      const text = `${record.studentQuestionExcerpt} ${record.feedbackCategory ?? ""} ${record.rating}`.toLowerCase();
      return keywords.some((keyword) => text.includes(keyword));
    }).length;

    return item(label, owner, count > 0 ? status : "watch", count > 0 ? `${count} matching feedback record(s).` : "No matching feedback record yet; keep monitoring pilot data.");
  });
}

function item(label: string, owner: string, status: string, detail: string): ExtendedRecord {
  return { detail, label, owner, status };
}

function cards(items: ExtendedRecord[]) {
  return `<div class="record-grid">${items
    .map((record) =>
      recordCard({
        label: record.label,
        meta: record.owner,
        status: record.status,
        text: record.detail
      })
    )
    .join("")}</div>`;
}

function metrics(values: Record<string, number | string>) {
  return `<div class="metric-grid">${Object.entries(values)
    .map(([label, value]) => metric(label, value, "current"))
    .join("")}</div>`;
}

function html(title: string, lede: string, generatedAt: string, sections: Array<[string, string]>) {
  return renderHtmlReport({
    generatedAt,
    lede,
    title,
    sections: sections.map(([sectionTitle, body], index) => ({
      body,
      id: `section-${index + 1}`,
      title: sectionTitle
    }))
  });
}
