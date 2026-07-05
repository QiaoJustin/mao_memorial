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
  } catch (error) {
    // P2-3: Redis 故障时降级为允许，避免全局不可用；记录告警便于排查
    console.error('[rate-limit] Redis 故障，限流降级为允许:', error);
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

// P1-10: 登录 IP 限流，防止暴力破解
// 修改：入参从 username 改为 ip（基于 IP 限流更有效，username 限流可被多账号绕过）
export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  // 开发环境放宽限流限制
  if (process.env.NODE_ENV === 'development') {
    return checkRateLimit({
      key: `rate:login:ip:${ip}`,
      limit: 100,
      windowSeconds: 60,
    });
  }
  return checkRateLimit({
    key: `rate:login:ip:${ip}`,
    limit: 5,
    windowSeconds: 30 * 60,
  });
}
