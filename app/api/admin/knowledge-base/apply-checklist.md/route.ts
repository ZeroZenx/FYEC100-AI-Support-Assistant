import { requireAdminAccess } from "@/lib/adminAuth";
import { renderKnowledgeBaseApplyChecklistMarkdown } from "@/lib/knowledgeBaseApplyChecklist";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return new Response(await renderKnowledgeBaseApplyChecklistMarkdown(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-kb-apply-checklist.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
