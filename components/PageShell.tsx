type PageShellProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageShell({
  children,
  eyebrow,
  title,
  description
}: PageShellProps) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="mb-10 max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold tracking-tight text-costaatt-navy sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">{description}</p>
      </div>
      {children}
    </section>
  );
}
