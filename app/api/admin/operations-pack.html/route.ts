import { requireAdminAccess } from "@/lib/adminAuth";
import { renderOperationsPackHtml } from "@/lib/finalPhaseLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderOperationsPackHtml(), { headers: { "content-type": "text/html; charset=utf-8" } });
}
