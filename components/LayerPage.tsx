import { PageShell } from "@/components/PageShell";
import {
  ReadinessLink,
  ReadinessList,
  ReadinessMetric,
  ReadinessRecord
} from "@/components/ReadinessCards";

type LayerItem = {
  detail: string;
  label: string;
  owner: string;
  status: string;
};

export function LayerPage({
  description,
  eyebrow,
  exportHref,
  exportLabel,
  items,
  listItems,
  metrics,
  title
}: {
  description: string;
  eyebrow: string;
  exportHref?: string;
  exportLabel?: string;
  items?: LayerItem[];
  listItems?: string[];
  metrics?: Record<string, number | string>;
  title: string;
}) {
  return (
    <PageShell eyebrow={eyebrow} title={title} description={description}>
      {(metrics || exportHref) && (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          {metrics && (
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              {Object.entries(metrics).map(([label, value]) => (
                <ReadinessMetric key={label} label={label} value={value} />
              ))}
            </div>
          )}
          {exportHref && (
            <div className={metrics ? "mt-4" : ""}>
              <ReadinessLink href={exportHref} label={exportLabel ?? "Open HTML Pack"} />
            </div>
          )}
        </section>
      )}

      {items && (
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {items.length > 0 ? (
            items.map((item) => <ReadinessRecord key={item.label} {...item} />)
          ) : (
            <ReadinessRecord
              detail="No active records are currently available."
              label="No active records"
              owner="Project Team"
              status="ready"
            />
          )}
        </section>
      )}

      {listItems && (
        <section className="mt-6">
          <ReadinessList title={title} items={listItems} />
        </section>
      )}
    </PageShell>
  );
}
