import { requireAdminAccess } from "@/lib/adminAuth";
import { renderHostedDeploymentPackMarkdown } from "@/lib/hostedDeploymentPack";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderHostedDeploymentPackMarkdown(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-hosted-deployment-pack.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
