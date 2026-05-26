"use client";

import { useEffect, useState } from "react";
import type { CourseChatContext } from "@/lib/courseResolver";

type CourseRecord = {
  courseCode: string;
  lifecycleStatus: string;
  moodleCourseId: string;
  pilotEnabled: boolean;
  title: string;
};

type RoutingResult = {
  launchContext?: {
    courseId: string;
    courseShortName: string;
    launchSource: string;
    role: string;
  };
  requestedCourse?: string;
  result: CourseChatContext;
};

const roleOptions = ["student", "lecturer", "lms-admin", "unknown"];
const sourceOptions = ["direct", "iframe", "moodle-block", "lti"];

export function CourseRoutingTester() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [courseCode, setCourseCode] = useState("FYEC100");
  const [courseId, setCourseId] = useState("FYEC100");
  const [courseShortName, setCourseShortName] = useState("FYEC100");
  const [launchSource, setLaunchSource] = useState("moodle-block");
  const [role, setRole] = useState("student");
  const [result, setResult] = useState<RoutingResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/course-routing-test")
      .then((response) => response.json())
      .then((data) => {
        setCourses(data.courses ?? []);
        setResult(data.defaultResolution ? { result: data.defaultResolution } : null);
      })
      .catch(() => setError("Course routing data could not be loaded."));
  }, []);

  async function runTest() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/course-routing-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode,
          courseId,
          courseShortName,
          launchSource,
          role
        })
      });
      const data = (await response.json()) as RoutingResult & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Course routing test failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Course routing test failed.");
    } finally {
      setLoading(false);
    }
  }

  function selectCourse(course: CourseRecord) {
    setCourseCode(course.courseCode);
    setCourseId(course.moodleCourseId);
    setCourseShortName(course.courseCode);
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">Simulate course context</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Test how chat will choose a course before Moodle or LTI sends trusted context.
        </p>
        <div className="mt-5 grid gap-3">
          <TextField label="Course code" onChange={setCourseCode} value={courseCode} />
          <TextField label="Moodle course ID" onChange={setCourseId} value={courseId} />
          <TextField label="Course short name" onChange={setCourseShortName} value={courseShortName} />
          <SelectField label="Launch source" onChange={setLaunchSource} options={sourceOptions} value={launchSource} />
          <SelectField label="Role" onChange={setRole} options={roleOptions} value={role} />
        </div>
        <button
          className="mt-5 rounded-md bg-costaatt-navy px-4 py-2 text-sm font-semibold text-white hover:bg-costaatt-blue disabled:bg-slate-300"
          disabled={loading}
          onClick={() => void runTest()}
          type="button"
        >
          {loading ? "Testing..." : "Test course routing"}
        </button>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      </div>

      <div className="grid gap-4">
        {result ? <ResultCard result={result} /> : null}
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">Configured courses</h2>
          <div className="mt-4 grid gap-3">
            {courses.map((course) => (
              <button
                className="rounded-md border border-slate-200 p-3 text-left hover:border-costaatt-blue"
                key={course.courseCode}
                onClick={() => selectCourse(course)}
                type="button"
              >
                <span className="block font-bold text-costaatt-navy">
                  {course.courseCode}: {course.title}
                </span>
                <span className="mt-1 block text-xs text-slate-600">
                  Moodle {course.moodleCourseId} · {course.lifecycleStatus} · pilot {course.pilotEnabled ? "enabled" : "disabled"}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function ResultCard({ result }: { result: RoutingResult }) {
  const course = result.result;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-costaatt-navy">Routing result</h2>
          <p className="mt-1 text-sm text-slate-600">{course.resolutionMessage}</p>
        </div>
        <span className="w-fit rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-costaatt-navy">
          {course.status}
        </span>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Course" value={`${course.courseCode}: ${course.title}`} />
        <Metric label="Knowledge base" value={course.knowledgeBasePath || "Not configured"} />
        <Metric label="Lifecycle" value={course.lifecycleStatus} />
        <Metric label="Pilot enabled" value={course.pilotEnabled ? "Yes" : "No"} />
        <Metric label="Readiness" value={course.readinessReady ? "Ready" : "Needs review"} />
        <Metric label="Support owners" value={course.supportOwners.join(", ") || "Not configured"} />
      </dl>
      {course.allowedTopics.length ? (
        <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          <strong className="text-costaatt-navy">Allowed topics:</strong>{" "}
          {course.allowedTopics.join(", ")}
        </div>
      ) : null}
    </section>
  );
}

function TextField({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        className="rounded-md border border-slate-300 px-3 py-2"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <select
        className="rounded-md border border-slate-300 px-3 py-2"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-costaatt-navy">{value}</dd>
    </div>
  );
}
