import { requireAdminAccess } from "@/lib/adminAuth";
import { renderSponsorReviewHtml } from "@/lib/institutionalLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderSponsorReviewHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-sponsor-review-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
