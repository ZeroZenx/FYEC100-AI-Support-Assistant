import { requireAdminAccess } from "@/lib/adminAuth";
import { renderStorageOperationsHtml } from "@/lib/connectionAuthStorageEvaluationLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderStorageOperationsHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-storage-operations-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
