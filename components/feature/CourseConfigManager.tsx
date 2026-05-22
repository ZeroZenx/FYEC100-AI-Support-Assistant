"use client";

import { useEffect, useState } from "react";

type Course = {
  allowedTopics: string[];
  approvalStatus: string;
  courseCode: string;
  guardrailNotes: string;
  knowledgeBasePath: string;
  lecturer: string;
  moodleCourseId: string;
  supportOwners: string[];
  title: string;
  readiness?: { ready: boolean };
};

export function CourseConfigManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<Course>({
    allowedTopics: ["course expectations", "study planning"],
    approvalStatus: "draft",
    courseCode: "FYEC100",
    guardrailNotes: "Do not write full assignments or grade work.",
    knowledgeBasePath: "data/fyec100-knowledge-base.md",
    lecturer: "FYEC100 Lecturer",
    moodleCourseId: "FYEC100",
    supportOwners: ["Lecturer", "LMS Administrator"],
    title: "First Year Experience"
  });

  async function load() {
    const response = await fetch("/api/admin/course-registry");
    const data = await response.json();
    setCourses(data.courses);
  }

  async function save() {
    await fetch("/api/admin/course-registry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    await load();
  }

  useEffect(() => {
    void fetch("/api/admin/course-registry")
      .then((response) => response.json())
      .then((data) => setCourses(data.courses));
  }, []);

  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Add or update course</h2>
        {(["courseCode", "title", "moodleCourseId", "knowledgeBasePath", "lecturer", "guardrailNotes"] as const).map((key) => (
          <label className="mt-3 grid gap-2 text-sm font-semibold text-slate-700" key={key}>
            {key}
            <input className="rounded-md border border-slate-300 px-3 py-2" onChange={(event) => setForm({ ...form, [key]: event.target.value })} value={form[key]} />
          </label>
        ))}
        <button className="mt-4 rounded-md bg-costaatt-navy px-4 py-2 text-sm font-semibold text-white" onClick={() => void save()} type="button">Save course config</button>
      </div>
      <div className="grid gap-3">
        {courses.map((course) => (
          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft" key={course.courseCode}>
            <h3 className="font-bold text-costaatt-navy">{course.courseCode}: {course.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{course.knowledgeBasePath} · {course.moodleCourseId}</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">Ready: {course.readiness?.ready ? "Yes" : "Needs review"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
