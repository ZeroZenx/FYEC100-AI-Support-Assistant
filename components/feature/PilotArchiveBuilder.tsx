"use client";

import { useState } from "react";

export function PilotArchiveBuilder() {
  const [redact, setRedact] = useState(true);
  const [bundle, setBundle] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const response = await fetch("/api/admin/pilot-archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redact })
    });
    setBundle(await response.json());
    setLoading(false);
  }

  function download() {
    if (!bundle) return;
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fyec100-pilot-archive-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const manifest = bundle?.manifest as { files?: Array<{ path: string; recordCount: number }>; warnings?: string[] } | undefined;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input checked={redact} onChange={(event) => setRedact(event.target.checked)} type="checkbox" />
        Redact likely sensitive values before export
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="rounded-md bg-costaatt-navy px-4 py-2 text-sm font-semibold text-white" disabled={loading} onClick={() => void generate()} type="button">
          {loading ? "Generating..." : "Generate archive bundle"}
        </button>
        <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-costaatt-navy disabled:opacity-50" disabled={!bundle} onClick={download} type="button">
          Download JSON archive
        </button>
      </div>
      {manifest ? (
        <div className="mt-5 grid gap-3">
          <p className="text-sm font-bold text-costaatt-navy">Manifest</p>
          {manifest.files?.map((file) => (
            <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700" key={file.path}>
              {file.path}: {file.recordCount} record(s)
            </div>
          ))}
          {manifest.warnings?.map((warning) => (
            <p className="text-xs text-amber-700" key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
