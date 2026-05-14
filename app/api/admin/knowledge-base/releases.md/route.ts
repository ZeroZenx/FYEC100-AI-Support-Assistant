import { requireAdminAccess } from "@/lib/adminAuth";
import { renderKnowledgeBaseReleasesMarkdown } from "@/lib/knowledgeBaseReleases";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return new Response(await renderKnowledgeBaseReleasesMarkdown(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-kb-releases.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
