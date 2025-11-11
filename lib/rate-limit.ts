import { NextRequest, NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(request: NextRequest, key: string, limit: number, windowMs: number) {
  const ip = getIp(request);
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();

  const current = buckets.get(bucketKey);
  if (!current || now > current.resetAt) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((current.resetAt - now) / 1000))
        }
      }
    );
  }

  current.count += 1;
  buckets.set(bucketKey, current);

  return null;
}
