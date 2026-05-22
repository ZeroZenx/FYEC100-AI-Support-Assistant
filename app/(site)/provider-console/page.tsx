import { ProviderConsole } from "@/components/feature/ProviderConsole";
import { PageShell } from "@/components/PageShell";

export default function ProviderConsolePage() {
  return (
    <PageShell
      eyebrow="AI Provider Operations"
      title="Provider testing console"
      description="Check the configured provider, run a safe test prompt, and review OpenAI, DeepSeek, and Ollama switching notes without exposing secrets."
    >
      <ProviderConsole />
    </PageShell>
  );
}
