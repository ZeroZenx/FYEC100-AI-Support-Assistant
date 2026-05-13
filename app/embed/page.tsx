import { ChatAssistant } from "@/components/ChatAssistant";
import { parseMoodleLaunchContext } from "@/lib/moodleContext";
import Image from "next/image";

export const metadata = {
  title: "FYEC100 Assistant Embed"
};

export default async function MoodleEmbedPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const launchContext = parseMoodleLaunchContext((await searchParams) ?? {});

  return (
    <main className="min-h-screen bg-slate-50 p-2 sm:p-3">
      <section className="mx-auto max-w-5xl">
        <div className="mb-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image
                alt="COSTAATT logo"
                className="h-10 w-auto"
                height={53}
                src="/costaatt-logo.png"
                width={120}
              />
              <div>
                <h1 className="text-lg font-bold text-costaatt-navy">
                  FYEC100 AI Academic Support
                </h1>
                <p className="text-xs leading-5 text-slate-600">
                  Embedded Moodle pilot view
                </p>
              </div>
            </div>
            <div className="rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              {launchContext.courseShortName} · {launchContext.role}
            </div>
          </div>
        </div>
        <ChatAssistant embedded launchContext={launchContext} />
      </section>
    </main>
  );
}
