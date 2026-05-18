import { requireAdminAccess } from "@/lib/adminAuth";
import { renderLtiReadinessMarkdown } from "@/lib/ltiReadiness";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(renderLtiReadinessMarkdown(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-lti-readiness.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
