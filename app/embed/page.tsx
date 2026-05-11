import { ChatAssistant } from "@/components/ChatAssistant";

export const metadata = {
  title: "FYEC100 Assistant Embed"
};

export default function MoodleEmbedPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <section className="mx-auto max-w-5xl">
        <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-costaatt-teal">
            Moodle Embedded Assistant
          </p>
          <h1 className="mt-1 text-2xl font-bold text-costaatt-navy">
            FYEC100 AI Academic Support
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This view is designed for Moodle iframe, modal, drawer, or LTI
            launch testing. It keeps the assistant focused and avoids the
            standalone site navigation.
          </p>
        </div>
        <ChatAssistant embedded />
      </section>
    </main>
  );
}
