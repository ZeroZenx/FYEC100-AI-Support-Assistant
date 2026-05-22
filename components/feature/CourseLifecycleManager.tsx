"use client";

import { useEffect, useState } from "react";

type Course = {
  courseCode: string;
  lifecycleStatus: string;
  pilotEnabled: boolean;
  readiness?: { ready: boolean };
  signoffs: { lecturer: boolean; lmsAdmin: boolean; projectLead: boolean };
  title: string;
};

export function CourseLifecycleManager() {
  const [courses, setCourses] = useState<Course[]>([]);

  async function load() {
    const response = await fetch("/api/admin/course-registry");
    const data = await response.json();
    setCourses(data.courses || []);
  }

  async function update(courseCode: string, patch: Partial<Course>) {
    await fetch("/api/admin/course-registry", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseCode, ...patch })
    });
    await load();
  }

  useEffect(() => {
    void fetch("/api/admin/course-registry")
      .then((response) => response.json())
      .then((data) => setCourses(data.courses || []));
  }, []);

  return (
    <section className="grid gap-4">
      {courses.length ? courses.map((course) => (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft" key={course.courseCode}>
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px] lg:items-center">
            <div>
              <h2 className="text-xl font-bold text-costaatt-navy">{course.courseCode}: {course.title}</h2>
              <p className="mt-1 text-sm text-slate-600">Readiness: {course.readiness?.ready ? "ready" : "needs review"}</p>
            </div>
            <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" onChange={(event) => void update(course.courseCode, { lifecycleStatus: event.target.value })} value={course.lifecycleStatus}>
              <option value="draft">Draft</option>
              <option value="in-review">In review</option>
              <option value="approved-for-pilot">Approved for pilot</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="retired">Retired</option>
            </select>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input checked={course.pilotEnabled} onChange={(event) => void update(course.courseCode, { pilotEnabled: event.target.checked })} type="checkbox" />
              Pilot enabled
            </label>
          </div>
        </article>
      )) : (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">No course lifecycle records loaded</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Sign in with a staff admin session or provide the pilot admin token
            so the course registry can load. FYEC100 remains the default local
            course configuration.
          </p>
        </section>
      )}
    </section>
  );
}
