import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCache, setCache, getSettingsCacheKey, SETTINGS_CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cacheKey = getSettingsCacheKey();
  const cached = await getCache<Record<string, string>>(cacheKey);

  if (cached) {
    return NextResponse.json({
      code: 200,
      message: 'success',
      data: cached,
      timestamp: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  const settings = await prisma.setting.findMany({
    where: { isPublic: true },
    select: { key: true, value: true },
  });

  const result: Record<string, string> = {};
  for (const setting of settings) {
    const camelKey = setting.key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = setting.value || '';
  }

  await setCache(cacheKey, result, SETTINGS_CACHE_TTL);

  return NextResponse.json({
    code: 200,
    message: 'success',
    data: result,
    timestamp: Date.now(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  });
}
