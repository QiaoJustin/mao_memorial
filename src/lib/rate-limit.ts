import redis from './redis';

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, windowSeconds } = options;
  
  try {
    const current = await redis.get(key);
    const count = current ? parseInt(current, 10) : 0;
    
    if (count >= limit) {
      const ttl = await redis.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000),
      };
    }

    await redis.incr(key);
    if (!current) {
      await redis.expire(key, windowSeconds);
    }

    const remaining = limit - (count + 1);
    const ttl = await redis.ttl(key);
    
    return {
      allowed: true,
      remaining,
      resetTime: Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000),
    };
  } catch {
    return {
      allowed: true,
      remaining: limit,
      resetTime: Date.now(),
    };
  }
}

export async function checkMessageRateLimit(ip: string): Promise<RateLimitResult> {
  return checkRateLimit({
    key: `rate:message:${ip}`,
    limit: 5,
    windowSeconds: 3600,
  });
}

export async function checkLoginRateLimit(username: string): Promise<RateLimitResult> {
  return checkRateLimit({
    key: `rate:login:${username}`,
    limit: 5,
    windowSeconds: 30 * 60,
  });
}

export async function consumeToken(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const result = await checkRateLimit({ key, limit, windowSeconds });
  return result.allowed;
}
