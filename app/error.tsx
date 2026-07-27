"use client";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-5 py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
          Something went wrong
        </p>
        <h1 className="mt-2 text-3xl font-bold text-costaatt-navy">
          This page could not be completed.
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Try the request again. If the problem continues, contact the project
          or system administrator and share what you were trying to do.
        </p>
        <button
          className="mt-6 rounded-md bg-costaatt-blue px-5 py-3 text-sm font-semibold text-white hover:bg-costaatt-navy"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
