import redis from './redis';

// 缓存 TTL 常量（秒），可通过环境变量覆盖
const TIMELINE_CACHE_TTL = parseInt(process.env.CACHE_TTL_TIMELINE || '300', 10);
const ERA_CACHE_TTL = parseInt(process.env.CACHE_TTL_ERA || '3600', 10);
const SETTINGS_CACHE_TTL = parseInt(process.env.CACHE_TTL_SETTINGS || '600', 10);
const SEARCH_SUGGEST_TTL = parseInt(process.env.CACHE_TTL_SEARCH_SUGGEST || '600', 10);
const HOT_SEARCH_TTL = parseInt(process.env.CACHE_TTL_HOT_SEARCH || '3600', 10);

export interface CacheOptions {
  ttl?: number;
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    if (value) {
      return JSON.parse(value) as T;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttl: number = TIMELINE_CACHE_TTL): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch {
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
  }
}

export function getTimelineCacheKey(page: number, pageSize: number, era?: string, year?: number): string {
  return `timeline:page:${page}:size:${pageSize}:era:${era || 'all'}:year:${year || 'all'}`;
}

export function getNodeCacheKey(id: number): string {
  return `node:${id}`;
}

export function getFeaturedCacheKey(limit: number): string {
  return `featured:${limit}`;
}

export function getEraCacheKey(): string {
  return 'eras';
}

export function getSettingsCacheKey(): string {
  return 'settings';
}

export function getSearchSuggestCacheKey(query: string): string {
  return `search:suggest:${query}`;
}

export function getHotSearchCacheKey(): string {
  return 'search:hot';
}

export function getPhotosCacheKey(page: number, pageSize: number, era?: string, year?: number): string {
  return `photos:page:${page}:size:${pageSize}:era:${era || 'all'}:year:${year || 'all'}`;
}

export async function clearTimelineCache(): Promise<void> {
  try {
    const keys = await redis.keys('timeline:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
  }
}

export async function clearNodeCache(id: number): Promise<void> {
  await deleteCache(getNodeCacheKey(id));
}

export async function clearSearchCache(): Promise<void> {
  try {
    const keys = await redis.keys('search:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    await redis.flushdb();
  } catch {
  }
}

export {
  TIMELINE_CACHE_TTL,
  ERA_CACHE_TTL,
  SETTINGS_CACHE_TTL,
  SEARCH_SUGGEST_TTL,
  HOT_SEARCH_TTL,
};
