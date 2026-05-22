"use client";

import { useMemo, useState } from "react";

const placements = ["course-home", "orientation-section", "assignment-page", "weekly-module", "support-block", "faq-area"];

export function MoodleEmbedGenerator({ appBaseUrl }: { appBaseUrl: string }) {
  const [placement, setPlacement] = useState("orientation-section");
  const [courseCode, setCourseCode] = useState("FYEC100");
  const embedUrl = `${appBaseUrl}/embed?courseId=${encodeURIComponent(courseCode)}&courseShortName=${encodeURIComponent(courseCode)}&role=student&launchSource=${placement}`;
  const iframe = `<iframe src="${embedUrl}" title="${courseCode} AI Support Assistant" width="100%" height="720" style="border:0;max-width:100%;"></iframe>`;
  const notice = useMemo(() => `Use the ${courseCode} AI Support Assistant for course expectations, study planning, Moodle navigation, and academic integrity guidance. It will not write assignments, grade work, or replace your lecturer. Do not enter private personal information.`, [courseCode]);

  return (
    <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Course code
          <input className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => setCourseCode(event.target.value.toUpperCase())} value={courseCode} />
        </label>
        <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
          Moodle placement
          <select className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => setPlacement(event.target.value)} value={placement}>
            {placements.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="grid gap-4">
        <Snippet title="Iframe snippet" value={iframe} />
        <Snippet title="Fallback link" value={embedUrl} />
        <Snippet title="Student notice" value={notice} />
        <Snippet title="Lecturer note" value={`Review common ${courseCode} questions, content gaps, and academic integrity concerns before changing official course guidance.`} />
      </div>
    </section>
  );
}

function Snippet({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <h3 className="font-bold text-costaatt-navy">{title}</h3>
      <pre className="mt-3 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs text-slate-700">{value}</pre>
      <button className="mt-3 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-costaatt-navy" onClick={() => void navigator.clipboard.writeText(value)} type="button">
        Copy
      </button>
    </article>
  );
}
