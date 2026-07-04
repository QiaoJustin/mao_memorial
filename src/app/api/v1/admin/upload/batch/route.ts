import { verifyToken, hasRole } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const payload = verifyToken(token || '');
  
  if (!payload || !hasRole(payload.role, 'editor')) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  if (!files.length || files.length > 10) {
    return NextResponse.json({ code: 400, message: 'Invalid number of files (max 10)' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024;

  const results: { url: string; filename: string; size: number; type: string }[] = [];
  const uploadDir = join(process.cwd(), 'public', 'uploads');

  try {
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) continue;
      if (file.size > maxSize) continue;

      const ext = file.name.split('.').pop();
      const filename = `${randomUUID()}.${ext}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);

      results.push({
        url: `/uploads/${filename}`,
        filename,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json({
      code: 200,
      data: {
        results,
        count: results.length,
      },
    });
  } catch (error) {
    return NextResponse.json({ code: 500, message: 'Upload failed' }, { status: 500 });
  }
}