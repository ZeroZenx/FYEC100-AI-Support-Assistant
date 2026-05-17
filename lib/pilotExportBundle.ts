import { getEnterpriseStatus } from "@/lib/enterpriseStatus";

type EnterpriseStatus = Awaited<ReturnType<typeof getEnterpriseStatus>>;

export async function buildPilotExportBundle() {
  const status = await getEnterpriseStatus();

  return {
    exportPaths: {
      html: "/api/admin/pilot-export-bundle.html",
      markdown: "/api/admin/pilot-export-bundle.md"
    },
    generatedAt: new Date().toISOString(),
    status,
    summary: {
      activeMode: status.pilotMode.mode,
      cleanupRecords: status.pilotDataCleanup.summary.totalRecords,
      feedbackRecords: status.feedback.total,
      goNoGo: status.pilotEvidence.goNoGo.status,
      launchRecords: status.launchAudit.total,
      readinessWarnings: status.deploymentReadiness.summary.warn,
      supportQueue: status.supportTriage.summary.activeQueue
    }
  };
}

export async function renderPilotExportBundleMarkdown() {
  const bundle = await buildPilotExportBundle();
  const { status } = bundle;

  return [
    "# FYEC100 Pilot Export Bundle",
    "",
    `Generated: ${new Date(bundle.generatedAt).toLocaleString()}`,
    "",
    "## Executive Snapshot",
    "",
    `- Pilot mode: ${status.pilotMode.mode}`,
    `- Go/no-go: ${status.pilotEvidence.goNoGo.label}`,
    `- Provider: ${status.providerLabel}`,
    `- Deployment warnings: ${status.deploymentReadiness.summary.warn}`,
    `- Feedback records: ${status.feedback.total}`,
    `- Moodle launch records: ${status.launchAudit.total}`,
    `- Support triage queue: ${status.supportTriage.summary.activeQueue}`,
    `- Cleanup records: ${status.pilotDataCleanup.summary.totalRecords}`,
    "",
    "## Table Of Contents",
    "",
    "- Decision dashboard",
    "- Moodle integration and security",
    "- Support triage",
    "- Data cleanup",
    "- Technical architecture",
    "- Export index",
    "",
    "## Decision Dashboard",
    "",
    ...status.pilotEvidence.signals.map(
      (signal) =>
        `- [${signal.status}] ${signal.label} (${signal.owner}): ${signal.message}`
    ),
    "",
    "## Moodle Integration And Security",
    "",
    `- Recommended path: ${status.integrationDecision.recommendedOption.label}`,
    `- Moodle origin: ${status.moodleSecurityHardening.moodleOrigin ?? "Not configured"}`,
    `- Frame ancestors: ${status.moodleSecurityHardening.headerBehavior.expectedFrameAncestors}`,
    `- Security checks: ${status.moodleSecurityHardening.summary.pass} pass / ${status.moodleSecurityHardening.summary.watch} watch / ${status.moodleSecurityHardening.summary.fail} fail`,
    "",
    "## Support Triage",
    "",
    ...status.supportTriage.signals.map(
      (signal) =>
        `- [${signal.status}] ${signal.label} (${signal.owner}): ${signal.text}`
    ),
    "",
    "## Data Cleanup",
    "",
    `- Mode warning: ${status.pilotDataCleanup.modeWarning}`,
    `- Reset scope: ${status.pilotDataCleanup.resetScope}`,
    ...status.pilotDataCleanup.files.map(
      (file) => `- ${file.label}: ${file.recordCount} record(s), ${file.sizeBytes} byte(s)`
    ),
    "",
    "## Export Index",
    "",
    ...getExportLinks(status).map((link) => `- ${link.label}: ${link.path}`),
    "",
    "## Privacy Notice",
    "",
    "This bundle is an internal Phase 2 pilot artifact. It should not include names, student IDs, grades, or production analytics claims.",
    ""
  ].join("\n");
}

export async function renderPilotExportBundleHtml() {
  const bundle = await buildPilotExportBundle();
  const { status } = bundle;
  const exportLinks = getExportLinks(status);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FYEC100 Pilot Export Bundle</title>
  <style>${reportCss()}</style>
</head>
<body>
  <main class="shell">
    <header class="hero">
      <div>
        <p class="eyebrow">COSTAATT FYEC100 AI Support Assistant</p>
        <h1>Pilot Export Bundle</h1>
        <p class="lede">A consolidated human-readable packet for sponsor review, LMS planning, and controlled pilot go/no-go discussion.</p>
      </div>
      <div class="mode-card ${status.pilotMode.mode}">
        <span>Current Mode</span>
        <strong>${escapeHtml(status.pilotMode.mode.toUpperCase())}</strong>
        <p>${escapeHtml(status.pilotMode.summary)}</p>
      </div>
    </header>

    ${renderToc()}

    <section class="panel" id="snapshot">
      <div class="section-title">
        <p>01</p>
        <h2>Executive Snapshot</h2>
      </div>
      <div class="metric-grid">
        ${metric("Go / No-Go", status.pilotEvidence.goNoGo.status.toUpperCase(), status.pilotEvidence.goNoGo.label)}
        ${metric("Provider", status.providerStatus.provider, status.providerStatus.model)}
        ${metric("Feedback", String(status.feedback.total), "records captured")}
        ${metric("Launches", String(status.launchAudit.total), "Moodle launch records")}
        ${metric("Support Queue", String(status.supportTriage.summary.activeQueue), "items for review")}
        ${metric("Cleanup Scope", String(status.pilotDataCleanup.summary.totalRecords), "resettable telemetry records")}
      </div>
      <div class="callout ${status.pilotEvidence.goNoGo.status}">
        <strong>${escapeHtml(status.pilotEvidence.goNoGo.label)}</strong>
        <span>${escapeHtml(status.pilotEvidence.goNoGo.message)}</span>
      </div>
    </section>

    <section class="panel" id="flow">
      <div class="section-title">
        <p>02</p>
        <h2>System Flow</h2>
      </div>
      ${systemFlowSvg()}
      <div class="breakdown">
        <h3>Technical Breakdown</h3>
        <p>The assistant runs as a Next.js app. Moodle opens the embedded assistant route, the chat API reads the local FYEC100 knowledge base, and the configured provider currently reports as ${escapeHtml(status.providerLabel)}. Pilot telemetry is stored locally as JSONL files and summarized into admin reports.</p>
      </div>
    </section>

    <section class="panel" id="readiness">
      <div class="section-title">
        <p>03</p>
        <h2>Readiness Signals</h2>
      </div>
      <div class="record-grid">
        ${status.pilotEvidence.signals.map((signal) => record(signal.label, signal.status, signal.owner, signal.message)).join("")}
      </div>
    </section>

    <section class="panel" id="moodle">
      <div class="section-title">
        <p>04</p>
        <h2>Moodle Integration And Security</h2>
      </div>
      <div class="two-col">
        <div>
          <h3>Recommended Integration Path</h3>
          <p>${escapeHtml(status.integrationDecision.summary)}</p>
          <p><strong>Recommended:</strong> ${escapeHtml(status.integrationDecision.recommendedOption.label)}</p>
        </div>
        <div>
          <h3>Iframe Security</h3>
          <p><strong>Moodle origin:</strong> ${escapeHtml(status.moodleSecurityHardening.moodleOrigin ?? "Not configured")}</p>
          <p><strong>Frame ancestors:</strong> ${escapeHtml(status.moodleSecurityHardening.headerBehavior.expectedFrameAncestors)}</p>
        </div>
      </div>
      <div class="record-grid">
        ${status.moodleSecurityHardening.checks.map((check) => record(check.label, check.status, check.owner, check.message)).join("")}
      </div>
    </section>

    <section class="panel" id="triage">
      <div class="section-title">
        <p>05</p>
        <h2>Support Triage</h2>
      </div>
      <div class="metric-grid compact">
        ${metric("Active Queue", String(status.supportTriage.summary.activeQueue), "items")}
        ${metric("High Priority", String(status.supportTriage.summary.highPriority), "items")}
        ${metric("Owners", String(status.supportTriage.summary.owners), "assigned")}
      </div>
      <div class="record-grid">
        ${status.supportTriage.signals.map((signal) => record(signal.label, signal.status, signal.owner, signal.text)).join("")}
      </div>
    </section>

    <section class="panel" id="cleanup">
      <div class="section-title">
        <p>06</p>
        <h2>Pilot Data Cleanup</h2>
      </div>
      <div class="callout ${status.pilotMode.mode}">
        <strong>${escapeHtml(status.pilotDataCleanup.pilotMode.mode.toUpperCase())} mode cleanup guidance</strong>
        <span>${escapeHtml(status.pilotDataCleanup.modeWarning)}</span>
      </div>
      <div class="record-grid">
        ${status.pilotDataCleanup.files.map((file) => record(file.label, file.exists ? "ready" : "clear", file.path, `${file.recordCount} record(s), ${file.sizeBytes} byte(s). ${file.description}`)).join("")}
      </div>
    </section>

    <section class="panel" id="exports">
      <div class="section-title">
        <p>07</p>
        <h2>Export Index</h2>
      </div>
      <div class="link-grid">
        ${exportLinks.map((link) => `<a href="${escapeAttribute(link.path)}"><span>${escapeHtml(link.label)}</span><code>${escapeHtml(link.path)}</code></a>`).join("")}
      </div>
    </section>
  </main>
</body>
</html>`;
}

function getExportLinks(status: EnterpriseStatus) {
  return [
    { label: "HTML bundle", path: "/api/admin/pilot-export-bundle.html" },
    { label: "Markdown bundle", path: "/api/admin/pilot-export-bundle.md" },
    { label: "Pilot evidence", path: "/api/admin/pilot-evidence.md" },
    { label: "Meeting pack", path: "/api/admin/pilot-meeting-pack.md" },
    { label: "Pilot analytics", path: status.pilotAnalytics.exportPath },
    { label: "Support triage", path: status.supportTriage.exportPath },
    { label: "Pilot data cleanup", path: status.pilotDataCleanup.exportPath },
    { label: "Moodle security", path: status.moodleSecurityHardening.exportPath },
    { label: "Hosted deployment", path: status.hostedDeploymentPack.exportPath },
    { label: "Sign-off pack", path: status.pilotSignoff.exportPath }
  ];
}

function metric(label: string, value: string, detail: string) {
  return `<article class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(detail)}</p></article>`;
}

function record(label: string, status: string, meta: string, text: string) {
  return `<article class="record"><div><h3>${escapeHtml(label)}</h3><span class="badge ${escapeAttribute(status)}">${escapeHtml(status)}</span></div><p class="meta">${escapeHtml(meta)}</p><p>${escapeHtml(text)}</p></article>`;
}

function renderToc() {
  return `<nav class="toc" aria-label="Report sections">
    <a href="#snapshot">Snapshot</a>
    <a href="#flow">System Flow</a>
    <a href="#readiness">Readiness</a>
    <a href="#moodle">Moodle</a>
    <a href="#triage">Triage</a>
    <a href="#cleanup">Cleanup</a>
    <a href="#exports">Exports</a>
  </nav>`;
}

function systemFlowSvg() {
  return `<svg class="diagram" viewBox="0 0 980 240" role="img" aria-label="Moodle to assistant system flow">
    <defs>
      <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L7,3 z" fill="#3155a4"></path>
      </marker>
    </defs>
    ${svgBox(30, 70, "Moodle", "Course shell / iframe")}
    ${svgBox(260, 70, "Next.js App", "/embed and /chat")}
    ${svgBox(490, 70, "Knowledge Base", "FYEC100 Markdown")}
    ${svgBox(720, 70, "AI Provider", "OpenAI / Ollama / DeepSeek")}
    <line x1="210" y1="120" x2="250" y2="120" stroke="#3155a4" stroke-width="3" marker-end="url(#arrow)"/>
    <line x1="440" y1="120" x2="480" y2="120" stroke="#3155a4" stroke-width="3" marker-end="url(#arrow)"/>
    <line x1="670" y1="120" x2="710" y2="120" stroke="#3155a4" stroke-width="3" marker-end="url(#arrow)"/>
    <path d="M815 170 C690 222 300 222 155 170" fill="none" stroke="#0f766e" stroke-width="3" marker-end="url(#arrow)"/>
    <text x="470" y="216" text-anchor="middle" fill="#0f766e" font-size="16" font-weight="700">Guided answer returns inside Moodle experience</text>
  </svg>`;
}

function svgBox(x: number, y: number, title: string, subtitle: string) {
  return `<g>
    <rect x="${x}" y="${y}" width="180" height="100" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <text x="${x + 90}" y="${y + 42}" text-anchor="middle" fill="#0f172a" font-size="20" font-weight="800">${escapeHtml(title)}</text>
    <text x="${x + 90}" y="${y + 70}" text-anchor="middle" fill="#475569" font-size="14">${escapeHtml(subtitle)}</text>
  </g>`;
}

function reportCss() {
  return `
    :root { color-scheme: light; --navy:#0f2742; --blue:#3155a4; --teal:#0f766e; --line:#dbe3ef; --soft:#f7fafc; --text:#263446; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #eef3f8; color: var(--text); font-family: Arial, Helvetica, sans-serif; }
    .shell { max-width: 1180px; margin: 0 auto; padding: 28px; }
    .hero { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 24px; align-items: stretch; background: var(--navy); color: white; padding: 32px; border-radius: 8px; }
    .eyebrow { margin: 0 0 10px; color: #9bd8d2; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: .08em; }
    h1 { margin: 0; font-size: 42px; line-height: 1; }
    .lede { max-width: 720px; line-height: 1.7; color: #e2edf7; }
    .mode-card { border: 1px solid rgba(255,255,255,.25); border-radius: 8px; padding: 18px; background: rgba(255,255,255,.08); }
    .mode-card span { font-size: 12px; text-transform: uppercase; font-weight: 800; color: #d7e5f3; }
    .mode-card strong { display: block; margin: 10px 0; font-size: 28px; }
    .mode-card p { margin: 0; line-height: 1.5; color: #e2edf7; }
    .toc { position: sticky; top: 0; display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0; padding: 12px; background: rgba(255,255,255,.94); border: 1px solid var(--line); border-radius: 8px; z-index: 3; }
    .toc a { text-decoration: none; color: var(--navy); font-weight: 800; padding: 8px 10px; border-radius: 6px; background: var(--soft); }
    .panel { background: white; border: 1px solid var(--line); border-radius: 8px; padding: 24px; margin: 18px 0; box-shadow: 0 12px 30px rgba(15, 39, 66, .07); }
    .section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
    .section-title p { margin: 0; width: 42px; height: 42px; display: grid; place-items: center; background: #e8f1ff; color: var(--blue); border-radius: 8px; font-weight: 900; }
    h2 { margin: 0; color: var(--navy); font-size: 26px; }
    h3 { margin: 0; color: var(--navy); }
    .metric-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; }
    .metric-grid.compact { grid-template-columns: repeat(3, minmax(0,1fr)); }
    .metric, .record { border: 1px solid var(--line); background: var(--soft); border-radius: 8px; padding: 16px; }
    .metric span { color: #64748b; font-weight: 800; font-size: 13px; }
    .metric strong { display: block; color: var(--navy); font-size: 26px; margin: 8px 0; word-break: break-word; }
    .metric p, .record p { margin: 0; line-height: 1.55; }
    .callout { display: grid; gap: 6px; margin-top: 16px; padding: 16px; border-radius: 8px; border-left: 6px solid var(--blue); background: #f0f7ff; }
    .callout.go, .callout.pilot { border-color: #059669; background: #ecfdf5; }
    .callout.hold, .callout.demo { border-color: #d97706; background: #fff7ed; }
    .diagram { width: 100%; min-height: 240px; border: 1px solid var(--line); border-radius: 8px; background: #f8fbff; }
    .breakdown, .two-col { margin-top: 16px; }
    .two-col { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px; }
    .record-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
    .record div { display: flex; gap: 10px; align-items: flex-start; justify-content: space-between; }
    .badge { flex: 0 0 auto; border-radius: 6px; padding: 4px 8px; font-size: 12px; font-weight: 900; background: #e2e8f0; color: #334155; }
    .badge.ready, .badge.pass, .badge.clear, .badge.go { background:#dcfce7; color:#166534; }
    .badge.watch, .badge.review, .badge.monitor, .badge.hold { background:#fef3c7; color:#92400e; }
    .badge.fail, .badge.blocked { background:#fee2e2; color:#991b1b; }
    .meta { color: #64748b; font-weight: 700; font-size: 13px; margin: 6px 0 !important; }
    .link-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
    .link-grid a { display: grid; gap: 4px; text-decoration: none; border: 1px solid var(--line); border-radius: 8px; padding: 12px; color: var(--navy); background: var(--soft); }
    .link-grid span { font-weight: 900; }
    code { color: #475569; white-space: normal; word-break: break-word; }
    @media (max-width: 820px) { .shell { padding: 14px; } .hero, .two-col, .record-grid, .metric-grid, .link-grid { grid-template-columns: 1fr; } h1 { font-size: 34px; } }
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
