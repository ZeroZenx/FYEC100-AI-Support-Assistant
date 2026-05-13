import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const readiness = await getDeploymentReadiness();

  return NextResponse.json(readiness, {
    status: readiness.okForControlledPilot ? 200 : 503
  });
}
