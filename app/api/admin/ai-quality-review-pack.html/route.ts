import { requireAdminAccess } from "@/lib/adminAuth";
import { renderAiQualityReviewHtml } from "@/lib/institutionalLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderAiQualityReviewHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-ai-quality-review-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
