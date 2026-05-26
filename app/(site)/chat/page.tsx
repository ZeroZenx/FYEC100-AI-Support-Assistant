import { ChatAssistant } from "@/components/ChatAssistant";
import { PageShell } from "@/components/PageShell";
import { resolveCourseForChat } from "@/lib/courseResolver";

export default async function ChatPage() {
  const courseResolution = await resolveCourseForChat();

  return (
    <PageShell
      eyebrow="Chat Assistant"
      title={`Ask a ${courseResolution.uiContext.courseCode} question`}
      description="Use the assistant for course expectations, assignment clarification, study planning, LMS navigation, and academic integrity guidance."
    >
      <ChatAssistant courseContext={courseResolution.uiContext} />
    </PageShell>
  );
}
