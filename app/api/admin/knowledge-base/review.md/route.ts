import { requireAdminAccess } from "@/lib/adminAuth";
import { buildKnowledgeBaseReviewMarkdown } from "@/lib/knowledgeBaseReview";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const markdown = await buildKnowledgeBaseReviewMarkdown();

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
