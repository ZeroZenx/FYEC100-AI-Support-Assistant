import { PageShell } from "@/components/PageShell";

const team = [
  "Kevin Ramsoobhag, VP Information Technology and Digital Transformation, Project Sponsor",
  "Darren Headley, Director | Technology Services, Project Lead and Technical Lead",
  "Deborah Romero, Developer",
  "Kester David, LMS Administrator",
  "Kevin Reece, System Administrator and Infrastructure Support"
];

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="A focused academic support prototype"
      description="This MVP demonstrates how an AI assistant can help first-year students get timely, consistent FYEC100 guidance while respecting academic integrity and institutional escalation paths."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">Purpose</h2>
          <p className="mt-3 leading-7 text-slate-700">
            The assistant is designed for common student support moments:
            understanding course expectations, clarifying assignment
            instructions, finding study strategies, and knowing when to contact
            the lecturer or LMS administrator.
          </p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-bold text-costaatt-navy">Project Team</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            {team.map((member) => (
              <li className="border-l-4 border-costaatt-gold pl-3" key={member}>
                {member}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
