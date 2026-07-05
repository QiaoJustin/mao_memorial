import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeSetting } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const GET = withAuth(async () => {
  const settings = await prisma.setting.findMany({
    orderBy: { category: 'asc' },
  });

  const grouped: Record<string, ReturnType<typeof serializeSetting>[]> = {};
  settings.forEach((s) => {
    const serialized = serializeSetting(s as unknown as Record<string, unknown>);
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(serialized);
  });

  return NextResponse.json({ code: 200, data: grouped });
}, 'editor');
