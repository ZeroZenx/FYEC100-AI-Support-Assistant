type PageShellProps = {
  actions?: React.ReactNode;
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageShell({
  actions,
  children,
  eyebrow,
  title,
  description
}: PageShellProps) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-costaatt-teal">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight text-costaatt-navy sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-700">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
