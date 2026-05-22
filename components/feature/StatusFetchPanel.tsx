"use client";

import { useEffect, useState } from "react";

export function StatusFetchPanel({ endpoint }: { endpoint: string }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void fetch(endpoint)
      .then((response) => response.json())
      .then(setData);
  }, [endpoint]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <pre className="max-h-[560px] overflow-auto rounded-md bg-slate-950 p-4 text-xs leading-5 text-white">
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}
