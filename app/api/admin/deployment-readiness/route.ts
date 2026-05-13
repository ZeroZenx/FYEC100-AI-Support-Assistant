import { NextResponse } from "next/server";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";

export async function GET() {
  const readiness = await getDeploymentReadiness();

  return NextResponse.json(readiness, {
    status: readiness.okForControlledPilot ? 200 : 503
  });
}
