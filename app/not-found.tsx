import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-5 py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
          Page not found
        </p>
        <h1 className="mt-2 text-3xl font-bold text-costaatt-navy">
          That page is not available.
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Return to the assistant or use the main navigation to continue.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md bg-costaatt-blue px-5 py-3 text-sm font-semibold text-white hover:bg-costaatt-navy"
          href="/chat"
        >
          Open Student Assistant
        </Link>
      </div>
    </main>
  );
}
