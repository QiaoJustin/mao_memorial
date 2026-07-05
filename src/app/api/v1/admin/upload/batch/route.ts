import { withAuth } from '@/lib/with-auth';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export const POST = withAuth(async (request) => {
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  if (!files.length || files.length > 10) {
    return NextResponse.json({ code: 400, message: 'Invalid number of files (max 10)' }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024;
  const results: { url: string; filename: string; size: number; type: string }[] = [];
  const rejected: { filename: string; reason: string }[] = [];
  const uploadDir = join(process.cwd(), 'public', 'uploads');

  try {
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      const ext = MIME_TO_EXT[file.type];
      if (!ext) {
        rejected.push({ filename: file.name, reason: '不支持的文件类型' });
        continue;
      }
      if (file.size > maxSize) {
        rejected.push({ filename: file.name, reason: '文件过大' });
        continue;
      }

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
        rejected,
        count: results.length,
      },
    });
  } catch (error) {
    console.error('[upload] 批量上传失败:', error);
    return NextResponse.json({ code: 500, message: 'Upload failed' }, { status: 500 });
  }
}, 'editor');
