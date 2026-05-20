import Link from "next/link";
import { PageShell } from "@/components/PageShell";

type ReportItem = {
  category: string;
  description: string;
  htmlPath?: string;
  markdownPath: string;
  owner: string;
  title: string;
};

const featuredReport = {
  description:
    "The best starting point for human review. It combines executive status, pilot mode, Moodle security, support triage, cleanup guidance, and a technical system flow diagram in one readable HTML packet.",
  htmlPath: "/api/admin/pilot-export-bundle.html",
  markdownPath: "/api/admin/pilot-export-bundle.md",
  title: "FYEC100 Pilot Export Bundle"
};

const reportGroups: Array<{ description: string; reports: ReportItem[]; title: string }> = [
  {
    title: "Operations, Sponsor Review, Moodle Experience, Migration, Quality, Scaling, and Provider Governance",
    description:
      "The next institutional scale-out layers for keeping the system alive, briefing sponsors, improving Moodle fit, preparing production migration, evaluating AI quality, scaling beyond FYEC100, and governing providers.",
    reports: [
      { category: "Operations", description: "App, provider, Moodle/LTI, storage, service desk, rate limit, and readiness health signals.", htmlPath: "/operational-health", markdownPath: "/api/admin/operations-handoff.html", owner: "System Administrator / Technical Lead", title: "Operational Health Dashboard" },
      { category: "Operations", description: "Provider failures, LTI validation failures, route errors, rate-limit events, failed access, and support spikes.", htmlPath: "/incident-capture", markdownPath: "/api/admin/operations-handoff.html", owner: "Technical Lead / Project Lead", title: "Error and Incident Event Capture" },
      { category: "Operations", description: "Alert ownership for provider, LTI, support backlog, audit write, Moodle iframe, and rate-limit issues.", htmlPath: "/alerts-plan", markdownPath: "/api/admin/operations-handoff.html", owner: "COSTAATT IT / LMS Administrator", title: "Operational Alerts Plan" },
      { category: "Operations", description: "Action center for restart, env checks, smoke tests, Moodle config review, evidence export, and stop-pilot actions.", htmlPath: "/runbook-action-center", markdownPath: "/api/admin/operations-handoff.html", owner: "System Administrator / Developer", title: "Runbook Action Center" },
      { category: "Operations", description: "Windows service, IIS proxy, logs, backup, rollback, and smoke command operations view.", htmlPath: "/windows-vm-operations", markdownPath: "/api/admin/operations-handoff.html", owner: "System Administrator", title: "Windows VM Operations Dashboard" },
      { category: "Operations", description: "COSTAATT IT handoff export with health, alerts, incidents, Windows VM notes, and owners.", htmlPath: "/operations-handoff", markdownPath: "/api/admin/operations-handoff.html", owner: "COSTAATT IT", title: "Operations Handoff HTML Pack" },
      { category: "Sponsor Review", description: "Leadership view of current pilot status, readiness, student value signals, risks, decisions, and milestone.", htmlPath: "/sponsor-dashboard", markdownPath: "/api/admin/sponsor-review-pack.html", owner: "Project Sponsor", title: "Sponsor Executive Dashboard" },
      { category: "Sponsor Review", description: "Major decisions for Moodle, provider, retention, support, KB releases, hosting, and auth.", htmlPath: "/decision-log", markdownPath: "/api/admin/sponsor-review-pack.html", owner: "Project Lead", title: "Decision Log" },
      { category: "Sponsor Review", description: "Expected benefits versus early pilot evidence and value signals.", htmlPath: "/benefits-realization", markdownPath: "/api/admin/sponsor-review-pack.html", owner: "Project Sponsor / Project Lead", title: "Benefits Realization Tracker" },
      { category: "Sponsor Review", description: "Leadership heatmap for technical, academic, privacy, operational, and adoption risk.", htmlPath: "/risk-issue-heatmap", markdownPath: "/api/admin/sponsor-review-pack.html", owner: "Governance / Project Lead", title: "Risk and Issue Heatmap" },
      { category: "Sponsor Review", description: "Completed layers, active build stage, next stage, and formal sign-off points.", htmlPath: "/milestone-timeline", markdownPath: "/api/admin/sponsor-review-pack.html", owner: "Project Lead", title: "Milestone Timeline" },
      { category: "Sponsor Review", description: "Meeting-ready sponsor export with summary, evidence, risks, decisions, blockers, next actions, and sign-off.", htmlPath: "/sponsor-review-pack", markdownPath: "/api/admin/sponsor-review-pack.html", owner: "Project Sponsor", title: "Sponsor Review HTML Pack" },
      { category: "Moodle Course Experience", description: "Placement options for course home, orientation, assignments, weekly modules, support block, and FAQ.", htmlPath: "/moodle-placement-planner", markdownPath: "/api/admin/moodle-course-experience-pack.html", owner: "LMS Administrator / Lecturer", title: "Moodle Placement Planner" },
      { category: "Moodle Course Experience", description: "Student path through FYEC100 Moodle, study support, integrity guidance, feedback, and escalation.", htmlPath: "/student-journey-preview", markdownPath: "/api/admin/moodle-course-experience-pack.html", owner: "Lecturer / LMS Administrator", title: "Student Journey Preview" },
      { category: "Moodle Course Experience", description: "Lecturer view of common questions, content gaps, responsible AI issues, and announcement ideas.", htmlPath: "/lecturer-course-support", markdownPath: "/api/admin/moodle-course-experience-pack.html", owner: "Lecturer", title: "Lecturer Course Support View" },
      { category: "Moodle Course Experience", description: "Copy-ready Moodle block text, iframe snippets, fallback links, student notices, and lecturer notes.", htmlPath: "/moodle-assets-v2", markdownPath: "/api/admin/moodle-course-experience-pack.html", owner: "LMS Administrator", title: "Moodle Copy and Embed Assets v2" },
      { category: "Moodle Course Experience", description: "Checks for Moodle fit, iframe sizing, mobile, navigation, clarity, and human support visibility.", htmlPath: "/course-experience-qa", markdownPath: "/api/admin/moodle-course-experience-pack.html", owner: "LMS Administrator / Developer", title: "Course Experience QA Checklist" },
      { category: "Moodle Course Experience", description: "HTML export for LMS admin and lecturer review before live course placement.", htmlPath: "/moodle-course-experience-pack", markdownPath: "/api/admin/moodle-course-experience-pack.html", owner: "LMS Administrator / Lecturer", title: "Moodle Course Experience HTML Pack" },
      { category: "Migration", description: "What can stay as-is, what must change, and what needs approval before production.", htmlPath: "/migration-readiness", markdownPath: "/api/admin/production-handover-pack.html", owner: "Project Lead / Technical Lead", title: "Migration Readiness Dashboard" },
      { category: "Migration", description: "Local to Moodle test to staging to production checks.", htmlPath: "/environment-promotion", markdownPath: "/api/admin/production-handover-pack.html", owner: "System Administrator", title: "Environment Promotion Checklist" },
      { category: "Migration", description: "Production variables, URLs, secrets, Windows/IIS assumptions, Moodle values, storage decisions, and ownership.", htmlPath: "/production-config-blueprint", markdownPath: "/api/admin/production-handover-pack.html", owner: "Technical Lead / IT", title: "Production Configuration Blueprint" },
      { category: "Migration", description: "Pilot data export, retention, deletion, anonymization, and production storage movement.", htmlPath: "/data-migration-plan", markdownPath: "/api/admin/production-handover-pack.html", owner: "Governance / IT", title: "Data Migration Plan" },
      { category: "Migration", description: "Go-live and rollback plan with triggers, owners, timing, and communication notes.", htmlPath: "/cutover-rollback", markdownPath: "/api/admin/production-handover-pack.html", owner: "Project Lead / IT", title: "Cutover and Rollback Plan" },
      { category: "Migration", description: "Production handover export for IT, LMS, governance, sponsor, and developer review.", htmlPath: "/production-handover-pack", markdownPath: "/api/admin/production-handover-pack.html", owner: "Project Sponsor / IT", title: "Production Handover Pack" },
      { category: "AI Quality", description: "FYEC100 evaluation prompts for course expectations, LMS, study support, responsible AI, and out-of-scope handling.", htmlPath: "/evaluation-question-set", markdownPath: "/api/admin/ai-quality-review-pack.html", owner: "Lecturer / Governance", title: "Evaluation Question Set" },
      { category: "AI Quality", description: "Rubric for accurate, grounded, clear, safe, integrity-aware, and correctly escalated responses.", htmlPath: "/response-quality-rubric", markdownPath: "/api/admin/ai-quality-review-pack.html", owner: "Lecturer", title: "Response Quality Rubric" },
      { category: "AI Quality", description: "Manual review workspace for pass, needs revision, unsafe, missing content, and human follow-up decisions.", htmlPath: "/manual-evaluation-workspace", markdownPath: "/api/admin/ai-quality-review-pack.html", owner: "Lecturer / Project Team", title: "Manual Evaluation Workspace" },
      { category: "AI Quality", description: "Provider comparison harness for OpenAI, DeepSeek, and Ollama using the same FYEC100 prompts.", htmlPath: "/provider-comparison", markdownPath: "/api/admin/ai-quality-review-pack.html", owner: "Technical Lead / Lecturer", title: "Provider Comparison Harness" },
      { category: "AI Quality", description: "Safety regression prompts for assignment writing, grading claims, bypass attempts, and unsupported policy.", htmlPath: "/safety-regression", markdownPath: "/api/admin/ai-quality-review-pack.html", owner: "Governance / Lecturer", title: "Safety Regression Checklist" },
      { category: "AI Quality", description: "Academic and governance export with quality results, risks, failed prompts, gaps, and actions.", htmlPath: "/ai-quality-review-pack", markdownPath: "/api/admin/ai-quality-review-pack.html", owner: "Governance / Lecturer", title: "AI Quality Review HTML Pack" },
      { category: "Multi-Course Scaling", description: "Course code, title, Moodle ID, KB path, allowed topics, escalation owners, and integrity rules.", htmlPath: "/course-config-model", markdownPath: "/api/admin/scaling-governance-pack.html", owner: "Technical Lead / Lecturer", title: "Course Configuration Model" },
      { category: "Multi-Course Scaling", description: "Admin workspace planning for FYEC100 and future pilot courses.", htmlPath: "/course-selector-admin", markdownPath: "/api/admin/scaling-governance-pack.html", owner: "Project Sponsor / Project Lead", title: "Course Selector and Admin Workspace" },
      { category: "Multi-Course Scaling", description: "Per-course knowledge base routing from trusted Moodle course context or selected course.", htmlPath: "/per-course-kb-routing", markdownPath: "/api/admin/scaling-governance-pack.html", owner: "Developer", title: "Per-Course Knowledge Base Routing" },
      { category: "Multi-Course Scaling", description: "Global integrity rules plus course-specific boundaries and escalation guidance.", htmlPath: "/per-course-guardrails", markdownPath: "/api/admin/scaling-governance-pack.html", owner: "Governance / Lecturer", title: "Per-Course Guardrails" },
      { category: "Multi-Course Scaling", description: "Course-level feedback, launch activity, support queues, content gaps, and student experience signals.", htmlPath: "/course-level-analytics", markdownPath: "/api/admin/scaling-governance-pack.html", owner: "Project Lead", title: "Course-Level Analytics" },
      { category: "Multi-Course Scaling", description: "Approvals required before adding courses: owner, KB review, support, Moodle placement, privacy, evaluation.", htmlPath: "/scaling-governance-pack", markdownPath: "/api/admin/scaling-governance-pack.html", owner: "Project Sponsor / Governance", title: "Scaling Governance Pack" },
      { category: "Provider Governance", description: "OpenAI, DeepSeek, Ollama, and future provider registry with hosting type and approval status.", htmlPath: "/provider-registry", markdownPath: "/api/admin/provider-governance-pack.html", owner: "Technical Lead / IT", title: "Provider Registry" },
      { category: "Provider Governance", description: "Allowed provider use by local testing, Moodle pilot, production, staff-only, or restricted contexts.", htmlPath: "/provider-policy-matrix", markdownPath: "/api/admin/provider-governance-pack.html", owner: "Governance / IT", title: "Provider Policy Matrix" },
      { category: "Provider Governance", description: "Provider status, latency planning, failure count planning, model, hosting indicator, and cost fields.", htmlPath: "/provider-health-cost", markdownPath: "/api/admin/provider-governance-pack.html", owner: "Technical Lead", title: "Provider Health and Cost Signals" },
      { category: "Provider Governance", description: "Safety comparison across providers using evaluation and safety regression prompts.", htmlPath: "/provider-safety-comparison", markdownPath: "/api/admin/provider-governance-pack.html", owner: "Lecturer / Governance", title: "Provider Safety Comparison" },
      { category: "Provider Governance", description: "Fallback provider, local-only mode, knowledge-base-only fallback, and stop-pilot triggers.", htmlPath: "/provider-fallback-plan", markdownPath: "/api/admin/provider-governance-pack.html", owner: "Technical Lead / Project Sponsor", title: "Provider Fallback Plan" },
      { category: "Provider Governance", description: "IT and governance export with readiness, approvals, risks, data considerations, and fallback decisions.", htmlPath: "/ai-provider-governance-pack", markdownPath: "/api/admin/provider-governance-pack.html", owner: "IT / Governance", title: "AI Provider Governance HTML Pack" }
    ]
  },
  {
    title: "LTI, Audit, Service Desk, Publishing, and Student Experience",
    description:
      "The next production-oriented layers: testable LTI launches, audit evidence, service desk operations, knowledge base publishing, and student learning effectiveness.",
    reports: [
      {
        category: "Real Moodle/LTI",
        description:
          "Local state and nonce storage for OIDC launches, including issuer, client ID, deployment ID, return URL, and expiration.",
        htmlPath: "/lti-state-store",
        markdownPath: "/api/admin/lti-technical-build.html",
        owner: "Developer / LMS Administrator",
        title: "LTI Launch State Store"
      },
      {
        category: "Real Moodle/LTI",
        description:
          "OIDC login endpoint that creates state/nonce records and redirects to Moodle when platform values are configured.",
        htmlPath: "/lti-launch-flow",
        markdownPath: "/api/admin/lti-technical-build.html",
        owner: "Technical Lead",
        title: "OIDC Login Endpoint Upgrade"
      },
      {
        category: "Real Moodle/LTI",
        description:
          "Launch validation endpoint for state, token shape, issuer, audience, deployment ID, nonce, message type, and expiration checks.",
        htmlPath: "/lti-validation",
        markdownPath: "/api/admin/lti-technical-build.html",
        owner: "Developer",
        title: "LTI Launch Validation Endpoint"
      },
      {
        category: "Real Moodle/LTI",
        description:
          "Validated Moodle claim mapping into trusted course, role, and LTI launch context for the assistant.",
        htmlPath: "/trusted-moodle-context",
        markdownPath: "/api/admin/lti-technical-build.html",
        owner: "Developer / Governance",
        title: "Trusted Moodle Context Mapping"
      },
      {
        category: "Real Moodle/LTI",
        description:
          "Local test harness guidance for valid and invalid LTI launch validation before Moodle test-site configuration.",
        htmlPath: "/lti-test-harness",
        markdownPath: "/api/admin/lti-technical-build.html",
        owner: "Technical Lead / LMS Administrator",
        title: "LTI Test Harness Page"
      },
      {
        category: "Production Data and Audit",
        description:
          "Audit event viewer for admin actions, provider tests, LTI launches, validation failures, support routing, KB releases, and configuration checks.",
        htmlPath: "/audit-viewer",
        markdownPath: "/api/admin/governance-audit-pack.html",
        owner: "Governance / Technical Lead",
        title: "Audit Viewer"
      },
      {
        category: "Production Data and Audit",
        description:
          "Local file adapter now, with production path for PostgreSQL, SQL Server, SharePoint, or another approved institutional store.",
        htmlPath: "/storage-adapter",
        markdownPath: "/api/admin/governance-audit-pack.html",
        owner: "Technical Lead / System Administrator",
        title: "Production Storage Adapter"
      },
      {
        category: "Production Data and Audit",
        description:
          "Export, cleanup preview, deletion procedure, retention status, and visibility into records before removal.",
        htmlPath: "/retention-controls",
        markdownPath: "/api/admin/governance-audit-pack.html",
        owner: "Governance Reviewer",
        title: "Data Retention Controls"
      },
      {
        category: "Production Data and Audit",
        description:
          "Human-readable governance export pack combining audit, retention, support, KB release, and pilot decision evidence.",
        htmlPath: "/governance-export",
        markdownPath: "/api/admin/governance-audit-pack.html",
        owner: "Project Sponsor / Governance",
        title: "Governance Export Pack"
      },
      {
        category: "Production Service Desk",
        description:
          "Convert feedback and escalations into structured support cases with owner, priority, category, status, source, and due date planning.",
        htmlPath: "/service-desk-intake",
        markdownPath: "/api/admin/service-desk-pack.html",
        owner: "Project Lead",
        title: "Service Desk Intake API"
      },
      {
        category: "Production Service Desk",
        description:
          "Case statuses for new, assigned, in-progress, waiting on lecturer, waiting on LMS admin, resolved, and closed.",
        htmlPath: "/support-case-lifecycle",
        markdownPath: "/api/admin/service-desk-pack.html",
        owner: "Support Owners",
        title: "Support Case Lifecycle"
      },
      {
        category: "Production Service Desk",
        description:
          "Expected response windows by category and priority with aging and overdue review guidance.",
        htmlPath: "/support-sla-rules",
        markdownPath: "/api/admin/service-desk-pack.html",
        owner: "Project Lead",
        title: "SLA Rules"
      },
      {
        category: "Production Service Desk",
        description:
          "Assignment board for Project Lead, Lecturer, LMS Administrator, Developer, and System Administrator support ownership.",
        htmlPath: "/support-assignment-board",
        markdownPath: "/api/admin/service-desk-pack.html",
        owner: "Project Lead",
        title: "Support Assignment Board"
      },
      {
        category: "Production Service Desk",
        description:
          "Resolution notes for KB update recommendations, Moodle fixes, technical fixes, and human-led support decisions.",
        htmlPath: "/case-resolution-notes",
        markdownPath: "/api/admin/service-desk-pack.html",
        owner: "Support Owners",
        title: "Case Resolution Notes"
      },
      {
        category: "Knowledge Base Publishing",
        description:
          "Draft-to-publish workflow for approved content updates, checklist evidence, release notes, and publish confirmation.",
        htmlPath: "/kb-publish-workflow",
        markdownPath: "/api/admin/kb-publishing-pack.html",
        owner: "Lecturer / Developer",
        title: "Draft-to-Publish Workflow"
      },
      {
        category: "Knowledge Base Publishing",
        description:
          "Preview of the future FYEC100 knowledge base before replacing the live Markdown file.",
        htmlPath: "/kb-preview",
        markdownPath: "/api/admin/kb-publishing-pack.html",
        owner: "Lecturer / Content Owner",
        title: "Knowledge Base Preview Page"
      },
      {
        category: "Knowledge Base Publishing",
        description:
          "Human-readable comparison of current content and proposed content changes.",
        htmlPath: "/kb-diff-viewer",
        markdownPath: "/api/admin/kb-publishing-pack.html",
        owner: "Developer / Lecturer",
        title: "Diff Viewer"
      },
      {
        category: "Knowledge Base Publishing",
        description:
          "Publish gate requiring reviewer, release note, guardrail check, fallback check, and smoke test evidence.",
        htmlPath: "/kb-publish-gate",
        markdownPath: "/api/admin/kb-publishing-pack.html",
        owner: "Project Lead / Lecturer",
        title: "Publish Gate"
      },
      {
        category: "Knowledge Base Publishing",
        description:
          "Rollback snapshot planning before live FYEC100 knowledge base content is replaced.",
        htmlPath: "/kb-rollback-snapshot",
        markdownPath: "/api/admin/kb-publishing-pack.html",
        owner: "Developer",
        title: "Rollback Snapshot"
      },
      {
        category: "Student Experience",
        description:
          "FYEC100-specific prompt starters for assignments, study planning, LMS navigation, reflection, and responsible AI use.",
        htmlPath: "/student-prompt-starters",
        markdownPath: "/api/admin/student-experience-pack.html",
        owner: "Lecturer / Project Lead",
        title: "Student Prompt Starters"
      },
      {
        category: "Student Experience",
        description:
          "Outcome tags for answered, needs lecturer, needs LMS support, content gap, integrity boundary, and technical issue.",
        htmlPath: "/conversation-outcomes",
        markdownPath: "/api/admin/student-experience-pack.html",
        owner: "Pilot Review Team",
        title: "Conversation Outcome Tags"
      },
      {
        category: "Student Experience",
        description:
          "Simple optional follow-up asking whether the assistant helped the student know what to do next.",
        htmlPath: "/student-helpfulness-followup",
        markdownPath: "/api/admin/student-experience-pack.html",
        owner: "Project Lead",
        title: "Student Helpfulness Follow-Up"
      },
      {
        category: "Student Experience",
        description:
          "Themes dashboard for deadlines, assignment expectations, LMS navigation, study habits, and responsible AI use.",
        htmlPath: "/learning-support-themes",
        markdownPath: "/api/admin/student-experience-pack.html",
        owner: "Lecturer / LMS Administrator",
        title: "Learning Support Themes"
      },
      {
        category: "Student Experience",
        description:
          "Recommended non-automated support interventions such as Moodle announcements, lecturer clarification, workshops, KB updates, and LMS guides.",
        htmlPath: "/intervention-recommendations",
        markdownPath: "/api/admin/student-experience-pack.html",
        owner: "Pilot Review Team",
        title: "Intervention Recommendations"
      }
    ]
  },
  {
    title: "Outcomes, Content, Support, and Enterprise Hardening",
    description:
      "The next four build layers: pilot evidence, FYEC100 content operations, student support operations, and production-grade enterprise hardening.",
    reports: [
      {
        category: "Pilot Analytics",
        description:
          "Usefulness signals, support demand, Moodle launch activity, knowledge base gaps, integrity boundary events, and readiness to scale.",
        htmlPath: "/pilot-outcomes",
        markdownPath: "/api/admin/pilot-outcomes-pack.html",
        owner: "Project Sponsor / Project Lead",
        title: "Pilot Outcomes Dashboard"
      },
      {
        category: "Pilot Analytics",
        description:
          "Missing FYEC100 topics, repeated unanswered questions, missing course information feedback, proposed updates, and lecturer review queue.",
        htmlPath: "/content-gap-analysis",
        markdownPath: "/api/admin/pilot-outcomes-pack.html",
        owner: "Lecturer / Content Owner",
        title: "Content Gap Analysis Workspace"
      },
      {
        category: "Pilot Analytics",
        description:
          "Common student needs, study support themes, LMS navigation pain points, responsible AI guidance needs, and recommended interventions.",
        htmlPath: "/student-success-insights",
        markdownPath: "/api/admin/pilot-outcomes-pack.html",
        owner: "Project Lead / Lecturer",
        title: "Student Success Insights Pack"
      },
      {
        category: "Pilot Analytics",
        description:
          "Closeout report covering what was tested, what worked, improvement areas, risks, decision recommendation, and next-phase recommendation.",
        htmlPath: "/pilot-closeout",
        markdownPath: "/api/admin/pilot-outcomes-pack.html",
        owner: "Project Sponsor / Project Lead",
        title: "Pilot Closeout Report"
      },
      {
        category: "Knowledge Base Operations",
        description:
          "Authoring queue for FYEC100 content updates with section mapping, source labels, reviewers, and priority.",
        htmlPath: "/content-authoring",
        markdownPath: "/api/admin/kb-content-ops-pack.html",
        owner: "Lecturer / Developer",
        title: "Content Authoring Workspace"
      },
      {
        category: "Knowledge Base Operations",
        description:
          "Current knowledge base versus proposed changes, section coverage, draft counts, and release-note status.",
        htmlPath: "/kb-version-comparison",
        markdownPath: "/api/admin/kb-content-ops-pack.html",
        owner: "Lecturer / Content Owner",
        title: "Knowledge Base Version Comparison"
      },
      {
        category: "Knowledge Base Operations",
        description:
          "Approval flow for draft changes, apply checklist, release notes, reviewer sign-off, and publish-ready status.",
        htmlPath: "/content-release-flow",
        markdownPath: "/api/admin/kb-content-ops-pack.html",
        owner: "Developer / Lecturer",
        title: "Content Approval Release Flow"
      },
      {
        category: "Knowledge Base Operations",
        description:
          "Quality checks for outdated content, academic integrity guidance, assignment clarity, unsupported claims, and fallback coverage.",
        htmlPath: "/kb-quality-checks",
        markdownPath: "/api/admin/kb-content-ops-pack.html",
        owner: "Lecturer / Governance Reviewer",
        title: "Knowledge Base Quality Checks"
      },
      {
        category: "Student Support Operations",
        description:
          "Support queue grouped by LMS issue, lecturer follow-up, content gap, technical issue, and academic integrity concern.",
        htmlPath: "/support-case-queue",
        markdownPath: "/api/admin/support-operations-pack.html",
        owner: "Pilot Review Team",
        title: "Support Case Queue"
      },
      {
        category: "Student Support Operations",
        description:
          "Support response templates for LMS, lecturer follow-up, integrity reminders, technical issues, missing knowledge base answers, and escalation.",
        htmlPath: "/support-response-templates",
        markdownPath: "/api/admin/support-operations-pack.html",
        owner: "Project Lead / Support Owners",
        title: "Support Response Templates"
      },
      {
        category: "Student Support Operations",
        description:
          "SLA view for open issues by owner, high-priority count, unresolved age, support readiness, and escalation load.",
        htmlPath: "/support-sla",
        markdownPath: "/api/admin/support-operations-pack.html",
        owner: "Project Lead",
        title: "Support SLA Dashboard"
      },
      {
        category: "Student Support Operations",
        description:
          "Post-pilot review prompts for student needs, common categories, scale fixes, knowledge base candidates, and human-led support.",
        htmlPath: "/post-pilot-support-review",
        markdownPath: "/api/admin/support-operations-pack.html",
        owner: "Pilot Review Team",
        title: "Post-Pilot Support Review"
      },
      {
        category: "Enterprise Hardening",
        description:
          "Production authentication planning for trusted Moodle/LTI launch, admin auth, role authorization, sessions, and key rotation.",
        htmlPath: "/production-auth-plan",
        markdownPath: "/api/admin/enterprise-hardening-pack.html",
        owner: "Technical Lead / LMS Administrator",
        title: "Production Authentication Plan"
      },
      {
        category: "Enterprise Hardening",
        description:
          "Data retention and storage decisions for file-based records, approved storage, retention, export, deletion, and access controls.",
        htmlPath: "/data-retention-storage",
        markdownPath: "/api/admin/enterprise-hardening-pack.html",
        owner: "Governance / Project Sponsor",
        title: "Data Retention and Storage Decision Pack"
      },
      {
        category: "Enterprise Hardening",
        description:
          "Audit logging and monitoring plan for admin actions, launch events, support routing, provider errors, and security events.",
        htmlPath: "/audit-monitoring-plan",
        markdownPath: "/api/admin/enterprise-hardening-pack.html",
        owner: "Technical Lead / System Administrator",
        title: "Audit Logging and Monitoring Plan"
      },
      {
        category: "Enterprise Hardening",
        description:
          "Production readiness gate for authentication, storage, privacy, monitoring, support model, rollback, and Moodle/LTI validation.",
        htmlPath: "/production-readiness-gate",
        markdownPath: "/api/admin/enterprise-hardening-pack.html",
        owner: "Project Sponsor / Technical Lead",
        title: "Production Readiness Gate"
      }
    ]
  },
  {
    title: "Production, Governance, Student, and LTI Layers",
    description:
      "The next institutional readiness layers: Windows production validation, governance approval, student readiness, and enterprise LTI technical planning.",
    reports: [
      {
        category: "Windows Production",
        description:
          "JSON-backed readiness page for expected app path, port, scripts, env variables, commands, warnings, and next actions.",
        htmlPath: "/windows-vm-readiness",
        markdownPath: "/api/admin/windows-vm-readiness",
        owner: "System Administrator / Technical Lead",
        title: "Windows VM Readiness API"
      },
      {
        category: "Windows Production",
        description:
          "IIS ARR / URL Rewrite assumptions, proxy target, HTTPS termination, headers, Moodle iframe checks, and rollback behavior.",
        htmlPath: "/iis-reverse-proxy",
        markdownPath: "/api/admin/iis-reverse-proxy-pack.html",
        owner: "System Administrator",
        title: "IIS Reverse Proxy Pack"
      },
      {
        category: "Windows Production",
        description:
          "NSSM, PM2, service account, log path, restart policy, and manual start/stop command guidance.",
        htmlPath: "/windows-service-config",
        markdownPath: "/api/admin/windows-service-pack.html",
        owner: "System Administrator",
        title: "Windows Service Configuration Pack"
      },
      {
        category: "Windows Production",
        description:
          "IT and LMS deployment acceptance checklist for health, HTTPS, Moodle origin, iframe, admin token, provider, smoke, rollback, and exports.",
        htmlPath: "/deployment-acceptance",
        markdownPath: "/api/admin/deployment-acceptance.html",
        owner: "IT / LMS Administrator",
        title: "Deployment Acceptance Checklist"
      },
      {
        category: "Governance",
        description:
          "Approval status by sponsor, project lead, lecturer/content owner, LMS, system administrator, developer, and governance/privacy reviewer.",
        htmlPath: "/pilot-approval",
        markdownPath: "/api/admin/governance-pack.html",
        owner: "Project Sponsor / Project Lead",
        title: "Pilot Approval Workflow"
      },
      {
        category: "Governance",
        description:
          "Structured pilot risk register covering technical, Moodle, academic integrity, and support risks.",
        htmlPath: "/risk-register",
        markdownPath: "/api/admin/governance-pack.html",
        owner: "Project Lead",
        title: "Risk Register"
      },
      {
        category: "Governance",
        description:
          "Privacy and data handling guidance for captured data, excluded data, storage, access, retention, export, and cleanup.",
        htmlPath: "/privacy-data-handling",
        markdownPath: "/api/admin/governance-pack.html",
        owner: "Governance / Project Sponsor",
        title: "Privacy and Data Handling Pack"
      },
      {
        category: "Governance",
        description:
          "Change-control guidance for knowledge base, app, Moodle placement, environment, approval, and release-note changes.",
        htmlPath: "/change-control",
        markdownPath: "/api/admin/governance-pack.html",
        owner: "Project Lead / Developer",
        title: "Pilot Change Control Log"
      },
      {
        category: "Student Readiness",
        description:
          "Student-facing welcome page explaining assistant purpose, boundaries, privacy-light pilot notice, and human support.",
        htmlPath: "/student-pilot-welcome",
        markdownPath: "/api/admin/student-readiness-pack.html",
        owner: "Lecturer / Project Lead",
        title: "Student Pilot Welcome Page"
      },
      {
        category: "Student Readiness",
        description:
          "FYEC100-friendly responsible AI guidance, acceptable use, assignment boundaries, and lecturer reminders.",
        htmlPath: "/student-ai-guide",
        markdownPath: "/api/admin/student-readiness-pack.html",
        owner: "Lecturer",
        title: "Student Responsible AI Guide"
      },
      {
        category: "Student Readiness",
        description:
          "Non-admin page explaining how pilot feedback is reviewed and routed.",
        htmlPath: "/student-feedback-follow-up",
        markdownPath: "/api/admin/student-readiness-pack.html",
        owner: "Pilot Review Team",
        title: "Student Feedback Follow-Up Page"
      },
      {
        category: "Student Readiness",
        description:
          "Student-facing accessibility and usability test checklist for keyboard, readability, contrast, iframe sizing, mobile, and help discovery.",
        htmlPath: "/accessibility-test",
        markdownPath: "/api/admin/student-readiness-pack.html",
        owner: "Developer / LMS Administrator",
        title: "Accessibility and Usability Test Page"
      },
      {
        category: "LTI Technical",
        description:
          "OIDC login flow, launch validation, trusted Moodle context mapping, and technical implementation steps.",
        htmlPath: "/lti-technical",
        markdownPath: "/api/admin/lti-technical-pack.html",
        owner: "Technical Lead / Developer",
        title: "LTI OIDC and Launch Validation"
      },
      {
        category: "LTI Technical",
        description:
          "LTI tool URLs, redirect URLs, JWKS URL, and required Moodle platform values.",
        htmlPath: "/lti-admin-config",
        markdownPath: "/api/admin/lti-technical-pack.html",
        owner: "LMS Administrator / Technical Lead",
        title: "LTI Admin Configuration Page"
      },
      {
        category: "LTI Technical",
        description:
          "LTI launch audit, validation failure, replay protection, trust-boundary, and key rotation planning.",
        htmlPath: "/lti-security-audit",
        markdownPath: "/api/admin/lti-technical-pack.html",
        owner: "Technical Lead / Governance",
        title: "LTI Security and Audit Pack"
      }
    ]
  },
  {
    title: "Staff Workspaces",
    description:
      "Interactive pages for people running the pilot, reviewing content, and rehearsing Moodle launch behavior.",
    reports: [
      {
        category: "Staff Workspaces",
        description:
          "PowerShell starter assets, service guidance, and Windows VM preflight checks for IT handoff.",
        htmlPath: "/windows-automation",
        markdownPath: "/api/admin/windows-automation-pack.html",
        owner: "System Administrator / Technical Lead",
        title: "Windows VM Deployment Automation Pack"
      },
      {
        category: "Staff Workspaces",
        description:
          "Moodle placement guide, student checklist, lecturer/LMS testing scripts, and launch communications.",
        htmlPath: "/moodle-launch-pack",
        markdownPath: "/api/admin/moodle-launch-pack.html",
        owner: "LMS Administrator / Project Lead",
        title: "Moodle Pilot Launch Pack"
      },
      {
        category: "Staff Workspaces",
        description:
          "Monitoring signals, incident levels, response workflow, and stop-pilot triggers for controlled pilot operations.",
        htmlPath: "/monitoring-incident-pack",
        markdownPath: "/api/admin/monitoring-incident-pack.html",
        owner: "Project Lead / Pilot Review Team",
        title: "Monitoring and Incident Response Pack"
      },
      {
        category: "Staff Workspaces",
        description:
          "Enterprise LTI 1.3 implementation stages, platform values, endpoint list, and launch validation checklist.",
        htmlPath: "/enterprise-lti-pack",
        markdownPath: "/api/admin/enterprise-lti-pack.html",
        owner: "Technical Lead / LMS Administrator",
        title: "Enterprise LTI 1.3 Implementation Pack"
      },
      {
        category: "Staff Workspaces",
        description:
          "Windows VM oriented environment variable guide for hosted Moodle iframe pilot deployment.",
        htmlPath: "/deployment-wizard",
        markdownPath: "/api/admin/hosted-deployment-pack.md",
        owner: "Technical Lead / System Administrator",
        title: "Deployment Environment Wizard"
      },
      {
        category: "Staff Workspaces",
        description:
          "Copy-ready Moodle iframe snippets, HTML block content, fallback links, and role/context launch URLs.",
        htmlPath: "/moodle-copy-center",
        markdownPath: "/api/admin/moodle-pilot-config.md",
        owner: "LMS Administrator",
        title: "Moodle Admin Copy Center"
      },
      {
        category: "Staff Workspaces",
        description:
          "Central export page for decision, evidence, support, Moodle, deployment, cleanup, and Windows VM handoff artifacts.",
        htmlPath: "/pilot-export-center",
        markdownPath: "/api/admin/pilot-export-bundle.md",
        owner: "Project Lead / Technical Lead",
        title: "Pilot Data Export Center"
      },
      {
        category: "Staff Workspaces",
        description:
          "Windows VM hosting runbook covering install, build/start commands, HTTPS proxy, secrets, logs, backups, and rollback.",
        htmlPath: "/hosting-runbook",
        markdownPath: "/api/admin/windows-hosting-runbook.html",
        owner: "System Administrator / Technical Lead",
        title: "Windows VM Hosting Runbook"
      },
      {
        category: "Staff Workspaces",
        description:
          "Focused views for sponsor, project lead, LMS administrator, developer, and system administrator responsibilities.",
        htmlPath: "/role-views",
        markdownPath: "/api/admin/actions.md",
        owner: "Project Team",
        title: "Role-Based Admin Views"
      },
      {
        category: "Staff Workspaces",
        description:
          "Sponsor-ready packet with decision summary, evidence signals, risks, sign-off ownership, and HTML export.",
        htmlPath: "/decision-packet",
        markdownPath: "/api/admin/pilot-evidence.md",
        owner: "Project Sponsor / Project Lead",
        title: "Pilot Decision Packet"
      },
      {
        category: "Staff Workspaces",
        description:
          "Session console for Moodle dry runs and controlled student pilot planning, checks, and success criteria.",
        htmlPath: "/pilot-sessions",
        markdownPath: "/api/admin/pilot-operations-runbook.md",
        owner: "Project Lead / LMS Administrator",
        title: "Moodle Pilot Session Console"
      },
      {
        category: "Staff Workspaces",
        description:
          "Production hardening checklist for hosting, Moodle frame security, admin protection, provider secrets, and support readiness.",
        htmlPath: "/production-hardening",
        markdownPath: "/api/admin/hosted-deployment-pack.md",
        owner: "Technical Lead / System Administrator",
        title: "Production Hardening Dashboard"
      },
      {
        category: "Staff Workspaces",
        description:
          "Review FYEC100 sections, change requests, draft updates, apply checklist, and release notes in one readable workspace.",
        htmlPath: "/knowledge-base-review",
        markdownPath: "/api/admin/knowledge-base/review.md",
        owner: "Lecturer / Developer",
        title: "Knowledge Base Review Workspace"
      },
      {
        category: "Staff Workspaces",
        description:
          "Filter pilot feedback by category, owner, priority, mode, and escalation type for support follow-up.",
        htmlPath: "/feedback-inbox",
        markdownPath: "/api/admin/support-triage.md",
        owner: "Pilot Review Team",
        title: "Pilot Feedback Inbox"
      },
      {
        category: "Staff Workspaces",
        description:
          "Preview the assistant as different Moodle roles and launch modes before touching the Moodle course shell.",
        htmlPath: "/moodle-preview",
        markdownPath: "/api/admin/moodle-launch-simulator.md",
        owner: "LMS Administrator / Developer",
        title: "Moodle Embed Preview Studio"
      },
      {
        category: "Staff Workspaces",
        description:
          "One-page ready, needs-review, and blocked dashboard for the exact items COSTAATT must confirm before pilot go-live.",
        htmlPath: "/go-live",
        markdownPath: "/api/admin/pilot-evidence.md",
        owner: "Project Sponsor / Project Lead",
        title: "Pre-Pilot Go-Live Dashboard"
      }
    ]
  },
  {
    title: "Executive Review",
    description: "Sponsor and project-team material for go/no-go discussions.",
    reports: [
      {
        category: "Executive Review",
        description:
          "Evidence signals, readiness summary, feedback totals, and recommended actions for the controlled pilot decision.",
        htmlPath: "/api/admin/pilot-evidence.html",
        markdownPath: "/api/admin/pilot-evidence.md",
        owner: "Project Sponsor / Project Lead",
        title: "Pilot Evidence Dashboard"
      },
      {
        category: "Executive Review",
        description:
          "Meeting-ready briefing notes covering blockers, decisions, sign-off, integration recommendation, and privacy notice.",
        markdownPath: "/api/admin/pilot-meeting-pack.md",
        owner: "Project Lead",
        title: "Pilot Meeting Pack"
      },
      {
        category: "Executive Review",
        description:
          "Approval owner status and controlled-pilot sign-off summary before expanding access.",
        markdownPath: "/api/admin/pilot-signoff.md",
        owner: "Project Sponsor / Project Team",
        title: "Pilot Sign-off Pack"
      }
    ]
  },
  {
    title: "Moodle Readiness",
    description: "Reports for LMS setup, iframe security, launch testing, and integration planning.",
    reports: [
      {
        category: "Moodle Readiness",
        description:
          "Moodle origin, frame-ancestors expectations, rebuild requirements, and iframe trust-boundary checks.",
        htmlPath: "/api/admin/moodle-security-hardening.html",
        markdownPath: "/api/admin/moodle-security-hardening.md",
        owner: "Technical Lead / LMS Administrator",
        title: "Moodle Security Hardening"
      },
      {
        category: "Moodle Readiness",
        description:
          "LMS-ready embed snippets, pilot setup steps, and Moodle course-shell configuration guidance.",
        markdownPath: "/api/admin/moodle-pilot-config.md",
        owner: "LMS Administrator",
        title: "Moodle Pilot Configuration"
      },
      {
        category: "Moodle Readiness",
        description:
          "Scenario preview URLs for student, lecturer, LMS administrator, iframe, block, and future LTI testing.",
        markdownPath: "/api/admin/moodle-launch-simulator.md",
        owner: "LMS Administrator / Developer",
        title: "Moodle Launch Simulator"
      }
    ]
  },
  {
    title: "Support Operations",
    description: "Operational reports for support routing, sessions, analytics, and cleanup.",
    reports: [
      {
        category: "Support Operations",
        description:
          "Privacy-light queue that routes feedback to lecturer, LMS, IT, knowledge base, or academic integrity owners.",
        htmlPath: "/api/admin/support-triage.html",
        markdownPath: "/api/admin/support-triage.md",
        owner: "Pilot Review Team",
        title: "Student Support Triage"
      },
      {
        category: "Support Operations",
        description:
          "Aggregate launch, role/source, feedback, and escalation signals for controlled pilot review.",
        markdownPath: "/api/admin/pilot-analytics.md",
        owner: "Project Lead / LMS Administrator",
        title: "Pilot Analytics Summary"
      },
      {
        category: "Support Operations",
        description:
          "Preview and guarded reset guidance for local demo feedback and Moodle launch telemetry.",
        markdownPath: "/api/admin/pilot-data-cleanup.md",
        owner: "Technical Lead / Project Lead",
        title: "Pilot Data Cleanup"
      },
      {
        category: "Support Operations",
        description:
          "Before, during, after, escalation, incident response, and stop-pilot operating procedures.",
        markdownPath: "/api/admin/pilot-operations-runbook.md",
        owner: "Project Lead / LMS Administrator",
        title: "Pilot Operations Runbook"
      }
    ]
  },
  {
    title: "Technical Deployment",
    description: "Reports for hosting, environment variables, protection, and deployment review.",
    reports: [
      {
        category: "Technical Deployment",
        description:
          "Hosted URL, HTTPS, provider, admin protection, rate limit, storage, and production caveat checks.",
        htmlPath: "/api/admin/hosted-deployment-pack.html",
        markdownPath: "/api/admin/hosted-deployment-pack.md",
        owner: "Technical Lead / System Administrator",
        title: "Hosted Deployment Readiness"
      },
      {
        category: "Technical Deployment",
        description:
          "Required Moodle LTI values, placeholder launch endpoints, and remaining LTI trust-boundary work.",
        markdownPath: "/api/admin/lti-readiness.md",
        owner: "Technical Lead",
        title: "LTI Readiness Scaffold"
      },
      {
        category: "Technical Deployment",
        description:
          "Open follow-up items by owner, priority, source, due date, and project-team action status.",
        markdownPath: "/api/admin/actions.md",
        owner: "Project Lead",
        title: "Admin Action Register"
      }
    ]
  },
  {
    title: "Knowledge Base Governance",
    description: "Reports for controlled FYEC100 content review and approved updates.",
    reports: [
      {
        category: "Knowledge Base Governance",
        description:
          "Lecturer/content-owner review status, current knowledge base metadata, and pilot readiness.",
        markdownPath: "/api/admin/knowledge-base/review.md",
        owner: "Lecturer / Content Owner",
        title: "Knowledge Base Review"
      },
      {
        category: "Knowledge Base Governance",
        description:
          "Proposed FYEC100 content changes awaiting review before the live Markdown file is edited.",
        markdownPath: "/api/admin/knowledge-base/change-requests.md",
        owner: "Developer / Lecturer Reviewer",
        title: "Knowledge Base Change Requests"
      },
      {
        category: "Knowledge Base Governance",
        description:
          "Manual review, edit, guardrail, smoke-test, and release-note steps for applying approved changes.",
        markdownPath: "/api/admin/knowledge-base/apply-checklist.md",
        owner: "Developer / Lecturer Reviewer",
        title: "Knowledge Base Apply Checklist"
      }
    ]
  }
];

export default function ReportsPage() {
  return (
    <PageShell
      eyebrow="Report Library"
      title="Human-readable pilot reports"
      description="Open the main HTML bundle first for meetings, then use the source reports when the project team needs supporting detail."
    >
      <section className="rounded-lg border border-costaatt-blue bg-white p-6 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-costaatt-teal">
              Recommended first
            </p>
            <h2 className="mt-2 text-2xl font-bold text-costaatt-navy">
              {featuredReport.title}
            </h2>
            <p className="mt-3 leading-7 text-slate-700">
              {featuredReport.description}
            </p>
          </div>
          <div className="grid gap-3">
            <ReportButton href={featuredReport.htmlPath} label="Open HTML report" primary />
            <ReportButton href={featuredReport.markdownPath} label="Open Markdown source" />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5">
        {reportGroups.map((group) => (
          <section
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
            key={group.title}
          >
            <div className="mb-5 max-w-3xl">
              <h2 className="text-xl font-bold text-costaatt-navy">
                {group.title}
              </h2>
              <p className="mt-2 leading-7 text-slate-700">{group.description}</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {group.reports.map((report) => (
                <article
                  className="flex min-h-full flex-col rounded-lg border border-slate-200 bg-slate-50 p-4"
                  key={report.title}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-costaatt-teal">
                    {report.category}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-costaatt-navy">
                    {report.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {report.description}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    Owner: {report.owner}
                  </p>
                  <div className="mt-auto grid gap-2 pt-4">
                    {report.htmlPath ? (
                      <ReportButton href={report.htmlPath} label="Open HTML" primary />
                    ) : null}
                    <ReportButton
                      href={report.markdownPath}
                      label={report.htmlPath ? "Open Markdown" : "Open report"}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

function ReportButton({
  href,
  label,
  primary = false
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      className={
        primary
          ? "rounded-md bg-costaatt-blue px-4 py-3 text-center text-sm font-bold text-white hover:bg-costaatt-navy"
          : "rounded-md border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold text-costaatt-navy hover:border-costaatt-blue"
      }
      href={href}
    >
      {label}
    </Link>
  );
}
