import { MoodleEmbedGenerator } from "@/components/feature/MoodleEmbedGenerator";
import { PageShell } from "@/components/PageShell";

export default function MoodleEmbedGeneratorPage() {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:4100";

  return (
    <PageShell
      eyebrow="Moodle Placement"
      title="Moodle embed package generator"
      description="Create copy-ready iframe snippets, fallback links, student notices, and lecturer notes for Moodle test course placement."
    >
      <MoodleEmbedGenerator appBaseUrl={appBaseUrl} />
    </PageShell>
  );
}
