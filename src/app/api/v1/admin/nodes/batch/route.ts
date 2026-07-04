import { prisma } from '@/lib/db';
import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'admin')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { ids, action } = body;

  if (!ids || !action) {
    return NextResponse.json({ code: 400, message: 'Missing ids or action' }, { status: 400 });
  }

  let updateData: Record<string, unknown> = {};

  switch (action) {
    case 'publish':
      updateData = { isPublished: true };
      break;
    case 'unpublish':
      updateData = { isPublished: false };
      break;
    case 'feature':
      updateData = { isFeatured: true };
      break;
    case 'unfeature':
      updateData = { isFeatured: false };
      break;
    case 'delete':
      updateData = { isDeleted: true };
      break;
    default:
      return NextResponse.json({ code: 400, message: 'Invalid action' }, { status: 400 });
  }

  const result = await prisma.timelineNode.updateMany({
    where: { id: { in: ids.map((id: string) => BigInt(id)) }, isDeleted: false },
    data: updateData,
  });

  return NextResponse.json({ code: 200, data: { count: result.count } });
}