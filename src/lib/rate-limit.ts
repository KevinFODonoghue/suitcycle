type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

type RateLimitOptions = {
  identifier: string;
  windowMs: number;
  limit: number;
};

const globalStore =
  (globalThis as typeof globalThis & { __rateLimitStore?: Map<string, RateLimitEntry> })
    .__rateLimitStore ?? new Map<string, RateLimitEntry>();

(globalThis as typeof globalThis & { __rateLimitStore?: Map<string, RateLimitEntry> }).__rateLimitStore =
  globalStore;

export class RateLimitError extends Error {
  status = 429;
  constructor(message = "Too many requests. Please slow down.") {
    super(message);
    this.name = "RateLimitError";
  }
}

export function generateRateLimitKey(bucket: string, identifier: string) {
  return `${bucket}:${identifier}`;
}

export function enforceRateLimit({ identifier, windowMs, limit }: RateLimitOptions) {
  if (!identifier) return;

  const now = Date.now();
  const entry = globalStore.get(identifier);

  if (!entry || entry.expiresAt <= now) {
    globalStore.set(identifier, { count: 1, expiresAt: now + windowMs });
    return;
  }

  if (entry.count >= limit) {
    throw new RateLimitError();
  }

  entry.count += 1;
}
