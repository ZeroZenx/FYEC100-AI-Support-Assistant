import { requireAdminAccess } from "@/lib/adminAuth";
import { renderAdminActionsMarkdown } from "@/lib/adminActions";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return new Response(await renderAdminActionsMarkdown(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-admin-actions.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
