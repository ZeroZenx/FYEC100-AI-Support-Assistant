import { ChatAssistant } from "@/components/ChatAssistant";
import { PageShell } from "@/components/PageShell";

export default function ChatPage() {
  return (
    <PageShell
      eyebrow="Chat Assistant"
      title="Ask an FYEC100 question"
      description="Use the assistant for course expectations, assignment clarification, study planning, LMS navigation, and academic integrity guidance."
    >
      <ChatAssistant />
    </PageShell>
  );
}
