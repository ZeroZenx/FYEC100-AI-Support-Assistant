import { NextResponse } from "next/server";

type RateLimitScope = "chat" | "feedback" | "provider-test";

type RateLimitConfig = {
  limit: number;
  scope: RateLimitScope;
  windowMs: number;
};

type RateLimitResult = {
  key: string;
  limit: number;
  limited: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
};

const buckets = new Map<string, { count: number; resetAt: number }>();

const oneMinute = 60 * 1000;

export function getRateLimitConfig() {
  return {
    chat: {
      limit: readPositiveInteger("CHAT_RATE_LIMIT_PER_MINUTE", 12),
      scope: "chat",
      windowMs: oneMinute
    },
    feedback: {
      limit: readPositiveInteger("FEEDBACK_RATE_LIMIT_PER_MINUTE", 30),
      scope: "feedback",
      windowMs: oneMinute
    },
    providerTest: {
      limit: readPositiveInteger("PROVIDER_TEST_RATE_LIMIT_PER_MINUTE", 6),
      scope: "provider-test",
      windowMs: oneMinute
    }
  } satisfies Record<string, RateLimitConfig>;
}

export function getRateLimitSummary() {
  const config = getRateLimitConfig();

  return {
    chatPerMinute: config.chat.limit,
    feedbackPerMinute: config.feedback.limit,
    providerTestPerMinute: config.providerTest.limit
  };
}

export function checkRateLimit(
  request: Request,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const client = getClientIdentifier(request);
  const key = `${config.scope}:${client}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs;

    buckets.set(key, { count: 1, resetAt });

    return {
      key,
      limit: config.limit,
      limited: false,
      remaining: Math.max(config.limit - 1, 0),
      resetAt: new Date(resetAt),
      retryAfterSeconds: Math.ceil(config.windowMs / 1000)
    };
  }

  if (existing.count >= config.limit) {
    return buildResult(key, config.limit, existing, true);
  }

  existing.count += 1;
  buckets.set(key, existing);

  return buildResult(key, config.limit, existing, false);
}

export function rateLimitResponse(result: RateLimitResult) {
  return NextResponse.json(
    {
      error:
        "Too many requests. Please wait a moment, then try the FYEC100 assistant again."
    },
    {
      headers: rateLimitHeaders(result),
      status: 429
    }
  );
}

function buildResult(
  key: string,
  limit: number,
  bucket: { count: number; resetAt: number },
  limited: boolean
): RateLimitResult {
  const retryAfterSeconds = Math.max(
    Math.ceil((bucket.resetAt - Date.now()) / 1000),
    1
  );

  return {
    key,
    limit,
    limited,
    remaining: Math.max(limit - bucket.count, 0),
    resetAt: new Date(bucket.resetAt),
    retryAfterSeconds
  };
}

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return forwardedFor?.split(",")[0]?.trim() || realIp || "local-pilot";
}

function rateLimitHeaders(result: RateLimitResult) {
  return {
    "Retry-After": result.retryAfterSeconds.toString(),
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetAt.toISOString()
  };
}

function readPositiveInteger(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] ?? "", 10);

  return Number.isFinite(value) && value > 0 ? value : fallback;
}
