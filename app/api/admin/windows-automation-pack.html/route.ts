import { requireAdminAccess } from "@/lib/adminAuth";
import { renderWindowsAutomationPackHtml } from "@/lib/phaseImplementationPacks";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderWindowsAutomationPackHtml(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-windows-automation-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
