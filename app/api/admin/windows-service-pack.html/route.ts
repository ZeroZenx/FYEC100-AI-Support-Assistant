import { requireAdminAccess } from "@/lib/adminAuth";
import { renderWindowsServicePackHtml } from "@/lib/readinessLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderWindowsServicePackHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-windows-service-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
