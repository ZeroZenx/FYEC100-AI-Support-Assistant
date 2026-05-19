import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import {
  feedbackCategories,
  type PilotFeedbackRecord,
  readPilotFeedbackRecords,
  readPilotFeedbackSummary
} from "@/lib/pilotFeedback";

type InboxParams = {
  category?: string | string[];
  escalation?: string | string[];
  mode?: string | string[];
  owner?: string | string[];
  priority?: string | string[];
};

export default async function FeedbackInboxPage({
  searchParams
}: {
  searchParams?: Promise<InboxParams>;
}) {
  const params = (await searchParams) ?? {};
  const [summary, records] = await Promise.all([
    readPilotFeedbackSummary(),
    readPilotFeedbackRecords()
  ]);
  const filters = {
    category: readParam(params.category),
    escalation: readParam(params.escalation),
    mode: readParam(params.mode),
    owner: readParam(params.owner),
    priority: readParam(params.priority)
  };
  const filteredRecords = records
    .filter((record) => matchesFilters(record, filters))
    .slice()
    .reverse();
  const owners = Array.from(
    new Set(records.map((record) => record.escalationOwner ?? "Pilot review team"))
  ).sort();
  const escalationTypes = Object.keys(summary.escalationCounts);

  return (
    <PageShell
      eyebrow="Pilot Feedback Inbox"
      title="Student support feedback"
      description="A readable inbox for pilot feedback records with filters by category, owner, priority, mode, and escalation type."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-3 md:grid-cols-5">
          <Metric label="Total" value={summary.total} />
          <Metric label="Review Queue" value={summary.reviewQueue.length} />
          <Metric label="Helpful" value={summary.counts.helpful} />
          <Metric label="Not Helpful" value={summary.counts["not-helpful"]} />
          <Metric label="Filtered" value={filteredRecords.length} />
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-5">
          <FilterGroup label="Category" name="category" values={feedbackCategories} active={filters.category} />
          <FilterGroup label="Owner" name="owner" values={owners} active={filters.owner} />
          <FilterGroup label="Priority" name="priority" values={["high", "medium", "low"]} active={filters.priority} />
          <FilterGroup label="Mode" name="mode" values={["standalone", "embedded"]} active={filters.mode} />
          <FilterGroup label="Escalation" name="escalation" values={escalationTypes} active={filters.escalation} />
        </div>
        <div className="mt-4">
          <Link
            className="text-sm font-bold text-costaatt-blue hover:text-costaatt-navy"
            href="/feedback-inbox"
          >
            Clear filters
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record, index) => (
            <FeedbackCard
              key={`${record.timestamp}-${index}`}
              record={record}
            />
          ))
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-700 shadow-soft">
            No feedback records match the current filters.
          </div>
        )}
      </section>
    </PageShell>
  );
}

function matchesFilters(
  record: PilotFeedbackRecord,
  filters: {
    category: string;
    escalation: string;
    mode: string;
    owner: string;
    priority: string;
  }
) {
  const priority = priorityFor(record.escalationCategory ?? "none");

  return (
    (!filters.category || record.feedbackCategory === filters.category) &&
    (!filters.escalation || record.escalationCategory === filters.escalation) &&
    (!filters.mode || record.mode === filters.mode) &&
    (!filters.owner || (record.escalationOwner ?? "Pilot review team") === filters.owner) &&
    (!filters.priority || priority === filters.priority)
  );
}

function FeedbackCard({ record }: { record: PilotFeedbackRecord }) {
  const escalation = record.escalationCategory ?? "none";
  const priority = priorityFor(escalation);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-costaatt-teal">
            {new Date(record.timestamp).toLocaleString()}
          </p>
          <h2 className="mt-2 text-lg font-bold text-costaatt-navy">
            {record.feedbackCategory ?? record.rating}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge status={priority} />
          <Badge status={record.mode} />
          <Badge status={escalation} />
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Excerpt label="Student question" text={record.studentQuestionExcerpt} />
        <Excerpt label="Assistant response" text={record.assistantResponseExcerpt} />
      </div>
      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-bold text-costaatt-navy">
          Owner: {record.escalationOwner ?? "Pilot review team"}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          {record.escalationReason ?? "No immediate escalation reason recorded."}
        </p>
        {record.note ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Staff note: {record.note}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function Excerpt({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}

function FilterGroup({
  active,
  label,
  name,
  values
}: {
  active: string;
  label: string;
  name: string;
  values: string[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Link
            className={`rounded-full border px-3 py-1 text-xs font-bold ${
              active === value
                ? "border-costaatt-blue bg-costaatt-blue text-white"
                : "border-slate-200 bg-slate-50 text-costaatt-navy hover:border-costaatt-blue"
            }`}
            href={`/feedback-inbox?${name}=${encodeURIComponent(value)}`}
            key={value}
          >
            {value}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-costaatt-navy">{value}</p>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-bold ${toneClass(status)}`}>
      {status}
    </span>
  );
}

function priorityFor(category: string) {
  if (
    category === "academic-integrity" ||
    category === "lecturer-follow-up" ||
    category === "lms-administrator" ||
    category === "technical-provider-issue"
  ) {
    return "high";
  }

  if (category === "knowledge-base-update") {
    return "medium";
  }

  return "low";
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function toneClass(status: string) {
  if (/(embedded|helpful|low|none|standalone)/i.test(status)) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (/(high|academic|lecturer|lms|technical|not-helpful)/i.test(status)) {
    return "bg-red-100 text-red-800";
  }

  return "bg-amber-100 text-amber-800";
}
