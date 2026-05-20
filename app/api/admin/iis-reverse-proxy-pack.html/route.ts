import { requireAdminAccess } from "@/lib/adminAuth";
import { renderIisReverseProxyPackHtml } from "@/lib/readinessLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderIisReverseProxyPackHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-iis-reverse-proxy-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
