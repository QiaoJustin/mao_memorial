import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeAccessLog } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30', 10);
  const format = searchParams.get('format') || 'csv';
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  const logs = await prisma.accessLog.findMany({
    where: { createdAt: { gte: startDate, lte: endDate } },
    orderBy: { createdAt: 'desc' },
  });

  if (format === 'csv') {
    const headers = ['id', 'path', 'method', 'statusCode', 'ipAddress', 'userAgent', 'referer', 'createdAt'];
    const rows = logs.map((log) => [
      Number(log.id),
      `"${log.path}"`,
      log.method,
      log.statusCode,
      `"${log.ipAddress}"`,
      `"${log.userAgent || ''}"`,
      `"${log.referer || ''}"`,
      log.createdAt.toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="access-logs-${days}days.csv"`,
      },
    });
  }

  return NextResponse.json({
    code: 200,
    data: logs.map((log) => serializeAccessLog(log as unknown as Record<string, unknown>)),
  });
}, 'editor');
