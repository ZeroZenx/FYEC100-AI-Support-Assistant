import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getProviderStatus, testSelectedProvider } from "@/lib/aiProvider";
import { buildEvaluationAutomationLayer } from "@/lib/evaluationAutomation";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const [evaluation] = await Promise.all([buildEvaluationAutomationLayer()]);
  const status = getProviderStatus();
  return NextResponse.json({
    ...status,
    hosting: status.provider === "ollama" || status.provider === "chatgpt" ? "local" : "hosted",
    recommendation: status.configured && evaluation.summary.failed === 0 ? "pilot-ready" : status.configured ? "governance-review" : "unavailable",
    safety: evaluation.summary
  });
}

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json(await testSelectedProvider());
}
