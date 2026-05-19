import { requireAdminAccess } from "@/lib/adminAuth";
import { renderSupportTriageHtml } from "@/lib/supportTriage";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderSupportTriageHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-support-triage.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
