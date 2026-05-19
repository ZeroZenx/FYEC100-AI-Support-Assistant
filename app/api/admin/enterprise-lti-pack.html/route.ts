import { requireAdminAccess } from "@/lib/adminAuth";
import { renderEnterpriseLtiPackHtml } from "@/lib/phaseImplementationPacks";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderEnterpriseLtiPackHtml(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-enterprise-lti-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
