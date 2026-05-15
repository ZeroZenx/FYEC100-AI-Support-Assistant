import { requireAdminAccess } from "@/lib/adminAuth";
import { renderKnowledgeBaseDraftUpdatesMarkdown } from "@/lib/knowledgeBaseDraftUpdates";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return new Response(await renderKnowledgeBaseDraftUpdatesMarkdown(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-kb-draft-updates.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
