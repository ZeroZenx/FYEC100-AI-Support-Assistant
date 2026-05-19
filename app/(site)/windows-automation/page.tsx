import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { buildWindowsAutomationPack } from "@/lib/phaseImplementationPacks";

export default async function WindowsAutomationPage() {
  const pack = await buildWindowsAutomationPack();

  return (
    <PageShell
      eyebrow="Phase 1"
      title="Windows VM deployment automation"
      description="Install scripts, service control guidance, and preflight checks for moving the FYEC100 assistant onto a Windows VM behind a reverse proxy."
    >
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div>
            <h2 className="text-2xl font-bold text-costaatt-navy">
              IT handoff assets
            </h2>
            <p className="mt-2 leading-7 text-slate-700">
              These scripts are starter assets for review by the System
              Administrator. They avoid storing real secrets and assume final
              service tooling will be approved by COSTAATT IT.
            </p>
          </div>
          <Link
            className="self-start rounded-md bg-costaatt-blue px-4 py-3 text-center text-sm font-bold text-white hover:bg-costaatt-navy"
            href="/api/admin/windows-automation-pack.html"
          >
            Open HTML Pack
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {pack.installAssets.map((asset) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
            key={asset.path}
          >
            <h2 className="text-lg font-bold text-costaatt-navy">
              {asset.label}
            </h2>
            <p className="mt-2 font-mono text-sm text-costaatt-blue">
              {asset.path}
            </p>
            <p className="mt-3 leading-7 text-slate-700">{asset.purpose}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-costaatt-navy">
          Windows Preflight
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {pack.windowsChecks.map((item) => (
            <Record key={item.label} {...item} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function Record({
  detail,
  label,
  owner,
  status
}: {
  detail: string;
  label: string;
  owner: string;
  status: string;
}) {
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

function toneClass(status: string) {
  if (status === "ready") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "blocked") {
    return "bg-red-100 text-red-800";
  }

  return "bg-amber-100 text-amber-800";
}
