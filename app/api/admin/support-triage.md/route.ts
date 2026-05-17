import { requireAdminAccess } from "@/lib/adminAuth";
import { renderSupportTriageMarkdown } from "@/lib/supportTriage";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderSupportTriageMarkdown(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-support-triage.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
