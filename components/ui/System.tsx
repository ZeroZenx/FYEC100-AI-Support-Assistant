import Link from "next/link";

type Tone = "danger" | "info" | "neutral" | "success" | "warning";

export type DataTableColumn<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export function StatusBadge({
  children,
  status
}: {
  children?: React.ReactNode;
  status: string;
}) {
  const tone = getStatusTone(status);

  return (
    <span
      className={`inline-flex w-fit items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${toneClass(tone)}`}
    >
      {children ?? status}
    </span>
  );
}

export function MetricTile({
  label,
  value,
  detail
}: {
  detail?: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-costaatt-navy">{value}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p> : null}
    </div>
  );
}

export function ActionPanel({
  actionHref,
  actionLabel,
  children,
  description,
  eyebrow,
  status,
  title
}: {
  actionHref?: string;
  actionLabel?: string;
  children?: React.ReactNode;
  description: string;
  eyebrow?: string;
  status?: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-wide text-costaatt-teal">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-bold text-costaatt-navy">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
        </div>
        {status ? <StatusBadge status={status} /> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
      {actionHref && actionLabel ? (
        <div className="mt-5">
          <PrimaryAction href={actionHref}>{actionLabel}</PrimaryAction>
        </div>
      ) : null}
    </section>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  emptyMessage = "No records are available.",
  rows
}: {
  columns: DataTableColumn<T>[];
  emptyMessage?: string;
  rows: T[];
}) {
  if (rows.length === 0) {
    return <EmptyState title="No records" description={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                  key={String(column.key)}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={String(row.id ?? index)}>
                {columns.map((column) => (
                  <td className="px-4 py-3 leading-6 text-slate-700" key={String(column.key)}>
                    {column.render
                      ? column.render(row)
                      : String(row[column.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyState({
  actionHref,
  actionLabel,
  description,
  title
}: {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <h3 className="font-bold text-costaatt-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <div className="mt-4">
          <PrimaryAction href={actionHref}>{actionLabel}</PrimaryAction>
        </div>
      ) : null}
    </div>
  );
}

export function FormField({
  children,
  help,
  label
}: {
  children: React.ReactNode;
  help?: string;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      {children}
      {help ? <span className="text-xs font-normal text-slate-500">{help}</span> : null}
    </label>
  );
}

export function PrimaryAction({
  children,
  href
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      className="inline-flex items-center rounded-md bg-costaatt-navy px-4 py-2 text-sm font-bold text-white hover:bg-costaatt-blue"
      href={href}
    >
      {children}
    </Link>
  );
}

export function SecondaryAction({
  children,
  href
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-costaatt-navy hover:border-costaatt-blue hover:text-costaatt-blue"
      href={href}
    >
      {children}
    </Link>
  );
}

export function getStatusTone(status: string): Tone {
  if (/(ready|pass|passed|approved|active|configured|complete|go|success)/i.test(status)) {
    return "success";
  }

  if (/(blocked|fail|failed|missing|expired|abort|retired|denied)/i.test(status)) {
    return "danger";
  }

  if (/(review|warn|watch|pending|progress|planned|monitor)/i.test(status)) {
    return "warning";
  }

  if (/(info|draft|not-started|skipped)/i.test(status)) {
    return "info";
  }

  return "neutral";
}

function toneClass(tone: Tone) {
  const tones: Record<Tone, string> = {
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800"
  };

  return tones[tone];
}
