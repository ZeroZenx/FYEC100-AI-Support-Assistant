import { requireAdminAccess } from "@/lib/adminAuth";
import { renderPilotAnalyticsMarkdown } from "@/lib/pilotAnalytics";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderPilotAnalyticsMarkdown(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-pilot-analytics.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
