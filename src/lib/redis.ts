// src/lib/redis.ts
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

// We’ll cache the client in dev to avoid creating multiple connections
const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

export const redis =
  globalForRedis.redis ??
  (redisUrl
    ? new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
      })
    : null);

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis ?? undefined;
}

// Helpful flag
export const redisEnabled = !!redis;
