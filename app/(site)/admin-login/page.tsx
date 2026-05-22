import { AdminLoginForm } from "@/components/feature/AdminLoginForm";
import { PageShell } from "@/components/PageShell";

export default function AdminLoginPage() {
  return (
    <PageShell
      eyebrow="Staff Access"
      title="Admin login"
      description="Create a local role-aware admin session for Phase 2 pilot workflows using the configured admin access token."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <AdminLoginForm />
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">
            Phase 2 local access model
          </h2>
          <p className="mt-3 leading-7 text-slate-700">
            This login uses `ADMIN_ACCESS_TOKEN` to create a signed local
            session cookie. It is intended for pilot testing and staff demos
            before COSTAATT confirms the production authentication path.
          </p>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
            <li>Role selection shapes the staff landing page.</li>
            <li>Session cookies expire automatically after the local window.</li>
            <li>Production should replace this with approved Moodle/LTI, SSO, or reverse-proxy authentication.</li>
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
