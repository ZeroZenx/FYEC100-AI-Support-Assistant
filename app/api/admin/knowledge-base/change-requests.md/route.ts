import { requireAdminAccess } from "@/lib/adminAuth";
import { renderKnowledgeBaseChangeRequestsMarkdown } from "@/lib/knowledgeBaseChangeRequests";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return new Response(await renderKnowledgeBaseChangeRequestsMarkdown(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-kb-change-requests.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
