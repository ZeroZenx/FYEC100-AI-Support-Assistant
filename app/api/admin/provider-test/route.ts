import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { testSelectedProvider, type ProviderTestOverrides } from "@/lib/aiProvider";
import {
  checkRateLimit,
  getRateLimitConfig,
  rateLimitResponse
} from "@/lib/rateLimit";

export async function POST(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const rateLimit = checkRateLimit(
    request,
    getRateLimitConfig().providerTest
  );

  if (rateLimit.limited) {
    return rateLimitResponse(rateLimit);
  }

  const result = await testSelectedProvider(
    await readProviderTestOverrides(request),
    request
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}

async function readProviderTestOverrides(request: Request): Promise<ProviderTestOverrides> {
  try {
    const body = (await request.json()) as {
      apiKey?: unknown;
      baseUrl?: unknown;
      model?: unknown;
      provider?: unknown;
    };

    return {
      apiKey: typeof body.apiKey === "string" ? body.apiKey.trim() : undefined,
      baseUrl: typeof body.baseUrl === "string" ? body.baseUrl.trim() : undefined,
      model: typeof body.model === "string" ? body.model.trim() : undefined,
      provider:
        body.provider === "chatgpt" || body.provider === "openai" || body.provider === "deepseek" || body.provider === "ollama"
          ? body.provider
          : undefined
    };
  } catch {
    return {};
  }
}
