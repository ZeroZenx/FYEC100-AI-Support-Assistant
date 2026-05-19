export type HtmlReportSection = {
  body: string;
  eyebrow?: string;
  id: string;
  title: string;
};

export function renderHtmlReport({
  generatedAt,
  lede,
  sections,
  title
}: {
  generatedAt: string;
  lede: string;
  sections: HtmlReportSection[];
  title: string;
}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${reportCss()}</style>
</head>
<body>
  <main class="shell">
    <header class="hero">
      <div>
        <p class="eyebrow">COSTAATT FYEC100 AI Support Assistant</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="lede">${escapeHtml(lede)}</p>
      </div>
      <aside class="stamp">
        <span>Generated</span>
        <strong>${escapeHtml(new Date(generatedAt).toLocaleString())}</strong>
        <p>Internal Phase 2 pilot document for review and planning.</p>
      </aside>
    </header>

    <nav class="toc" aria-label="Report sections">
      ${sections
        .map(
          (section, index) =>
            `<a href="#${escapeAttribute(section.id)}"><span>${String(index + 1).padStart(
              2,
              "0"
            )}</span>${escapeHtml(section.title)}</a>`
        )
        .join("")}
    </nav>

    ${sections
      .map(
        (section, index) => `<section class="panel" id="${escapeAttribute(
          section.id
        )}">
      <div class="section-title">
        <p>${section.eyebrow ?? String(index + 1).padStart(2, "0")}</p>
        <h2>${escapeHtml(section.title)}</h2>
      </div>
      ${section.body}
    </section>`
      )
      .join("")}
  </main>
</body>
</html>`;
}

export function metric(label: string, value: string | number, hint: string) {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(
    String(value)
  )}</strong><p>${escapeHtml(hint)}</p></div>`;
}

export function recordCard({
  label,
  meta,
  status,
  text
}: {
  label: string;
  meta: string;
  status: string;
  text: string;
}) {
  return `<article class="record ${escapeAttribute(status)}">
    <div><span>${escapeHtml(status)}</span><h3>${escapeHtml(label)}</h3></div>
    <p>${escapeHtml(text)}</p>
    <footer>${escapeHtml(meta)}</footer>
  </article>`;
}

export function list(items: string[]) {
  if (items.length === 0) {
    return `<p class="muted">No items recorded.</p>`;
  }

  return `<ul class="list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export function codeBlock(value: string) {
  return `<pre><code>${escapeHtml(value)}</code></pre>`;
}

export function table(headers: string[], rows: Array<Array<string | number>>) {
  return `<div class="table-wrap"><table>
    <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>`
      )
      .join("")}</tbody>
  </table></div>`;
}

export function callout(title: string, text: string, status = "info") {
  return `<div class="callout ${escapeAttribute(status)}"><strong>${escapeHtml(
    title
  )}</strong><span>${escapeHtml(text)}</span></div>`;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/[^a-zA-Z0-9._:-]/g, "-");
}

function reportCss() {
  return `
    :root {
      color-scheme: light;
      --blue: #293f93;
      --navy: #102045;
      --teal: #087f8c;
      --ink: #172033;
      --muted: #5f6b7a;
      --line: #dce3ee;
      --soft: #f6f8fb;
      --paper: #ffffff;
      --ready: #0f766e;
      --watch: #a16207;
      --blocked: #b42318;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #eef3f9;
      color: var(--ink);
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.55;
    }
    .shell { max-width: 1120px; margin: 0 auto; padding: 32px 20px 56px; }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: 24px;
      align-items: stretch;
      border: 1px solid #cdd8ea;
      background: var(--paper);
      border-radius: 8px;
      padding: 28px;
      box-shadow: 0 18px 40px rgba(16, 32, 69, 0.10);
    }
    .eyebrow {
      margin: 0 0 10px;
      color: var(--teal);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h1, h2, h3, p { margin-top: 0; }
    h1 { margin-bottom: 12px; color: var(--navy); font-size: 38px; line-height: 1.08; }
    .lede { margin: 0; max-width: 760px; color: #425066; font-size: 18px; }
    .stamp {
      border-left: 4px solid var(--blue);
      background: var(--soft);
      border-radius: 8px;
      padding: 18px;
    }
    .stamp span, .metric span, .record span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .stamp strong { display: block; margin: 8px 0; color: var(--navy); }
    .stamp p { margin: 0; color: var(--muted); font-size: 14px; }
    .toc {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 10px;
      margin: 20px 0;
    }
    .toc a {
      display: flex;
      gap: 10px;
      align-items: center;
      border: 1px solid var(--line);
      background: var(--paper);
      border-radius: 8px;
      padding: 12px;
      color: var(--navy);
      font-weight: 700;
      text-decoration: none;
    }
    .toc span { color: var(--teal); font-size: 12px; }
    .panel {
      border: 1px solid var(--line);
      background: var(--paper);
      border-radius: 8px;
      margin-top: 18px;
      padding: 24px;
    }
    .section-title {
      display: flex;
      gap: 14px;
      align-items: baseline;
      border-bottom: 1px solid var(--line);
      margin-bottom: 18px;
      padding-bottom: 12px;
    }
    .section-title p { margin: 0; color: var(--teal); font-weight: 800; }
    .section-title h2 { margin: 0; color: var(--navy); font-size: 24px; }
    .metric-grid, .record-grid, .two-col {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
    }
    .metric, .record {
      border: 1px solid var(--line);
      background: #fbfcfe;
      border-radius: 8px;
      padding: 16px;
    }
    .metric strong { display: block; margin: 8px 0 4px; color: var(--navy); font-size: 28px; }
    .metric p, .record p, .record footer, .muted { color: var(--muted); }
    .record { border-top: 4px solid var(--teal); }
    .record h3 { margin: 5px 0 10px; color: var(--navy); font-size: 17px; }
    .record.ready, .record.pass, .record.configured, .record.clear, .record.go { border-top-color: var(--ready); }
    .record.watch, .record.monitor, .record.review, .record.local, .record.optional, .record.hold { border-top-color: var(--watch); }
    .record.blocked, .record.fail, .record.missing, .record.required { border-top-color: var(--blocked); }
    .record footer { border-top: 1px solid var(--line); margin-top: 12px; padding-top: 10px; font-size: 13px; font-weight: 700; }
    .callout {
      display: grid;
      gap: 6px;
      border-left: 5px solid var(--blue);
      background: #f5f8ff;
      border-radius: 8px;
      margin: 16px 0;
      padding: 16px;
    }
    .callout strong { color: var(--navy); }
    .callout.ready, .callout.pass, .callout.go { border-left-color: var(--ready); background: #eefdf9; }
    .callout.watch, .callout.review, .callout.hold { border-left-color: var(--watch); background: #fff8e8; }
    .callout.blocked, .callout.fail, .callout.required { border-left-color: var(--blocked); background: #fff1f0; }
    .list { margin: 0; padding-left: 20px; color: #314056; }
    .list li + li { margin-top: 8px; }
    pre {
      overflow-x: auto;
      border: 1px solid var(--line);
      background: #111827;
      color: #e5e7eb;
      border-radius: 8px;
      padding: 14px;
      white-space: pre-wrap;
    }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border-bottom: 1px solid var(--line); padding: 11px; text-align: left; vertical-align: top; }
    th { color: var(--navy); background: var(--soft); }
    @media (max-width: 760px) {
      .hero { grid-template-columns: 1fr; padding: 20px; }
      h1 { font-size: 30px; }
      .panel { padding: 18px; }
    }
  `;
}
