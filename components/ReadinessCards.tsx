import Link from "next/link";

export type ReadinessCardItem = {
  detail: string;
  label: string;
  owner: string;
  status: string;
};

export function ReadinessMetric({
  label,
  value
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-costaatt-navy">{value}</p>
    </div>
  );
}

export function ReadinessRecord({
  detail,
  label,
  owner,
  status
}: ReadinessCardItem) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-bold text-costaatt-navy">{label}</h3>
        <span className={`rounded-full px-2 py-1 text-xs font-bold ${toneClass(status)}`}>
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-500">{owner}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </article>
  );
}

export function ReadinessPanel({
  children,
  title
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="mb-4 text-xl font-bold text-costaatt-navy">{title}</h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

export function ReadinessList({
  items,
  title
}: {
  items: string[];
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <h2 className="text-xl font-bold text-costaatt-navy">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li className="rounded-md border border-slate-200 bg-slate-50 p-3" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ReadinessLink({
  href,
  label
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      className="rounded-md border border-costaatt-blue px-4 py-2 text-sm font-bold text-costaatt-blue hover:bg-blue-50"
      href={href}
    >
      {label}
    </Link>
  );
}

function toneClass(status: string) {
  if (/(ready|pass|approved|configured|go)/i.test(status)) {
    return "bg-emerald-100 text-emerald-800";
  }

  if (/(blocked|fail|missing|hold)/i.test(status)) {
    return "bg-red-100 text-red-800";
  }

  return "bg-amber-100 text-amber-800";
}
