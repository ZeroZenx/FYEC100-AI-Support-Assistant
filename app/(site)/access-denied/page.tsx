import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default function AccessDeniedPage() {
  return (
    <PageShell
      eyebrow="Access"
      title="Access denied"
      description="This area is intended for a specific pilot role or protected admin session."
    >
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-xl font-bold text-costaatt-navy">
          Staff sign-in may be required
        </h2>
        <p className="mt-3 leading-7 text-slate-700">
          Use the local admin login to create a Phase 2 staff session. In a
          production deployment, this access decision should be handled by the
          approved Moodle/LTI, SSO, or reverse-proxy authentication model.
        </p>
        <Link className="mt-5 inline-flex rounded-md bg-costaatt-navy px-4 py-2 text-sm font-bold text-white" href="/admin-login">
          Go to admin login
        </Link>
      </section>
    </PageShell>
  );
}
