import { requireAdminAccess } from "@/lib/adminAuth";
import { renderWindowsHostingRunbookHtml } from "@/lib/hostedPilotHandoff";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderWindowsHostingRunbookHtml(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-windows-vm-hosting-runbook.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
