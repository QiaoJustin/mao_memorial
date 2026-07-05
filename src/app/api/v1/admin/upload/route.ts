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
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ code: 400, message: 'No file provided' }, { status: 400 });
  }

  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return NextResponse.json({ code: 400, message: '不支持的文件类型' }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ code: 400, message: 'File too large' }, { status: 400 });
  }

  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');

  try {
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({
      code: 200,
      data: {
        url,
        filename,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('[upload] 文件上传失败:', error);
    return NextResponse.json({ code: 500, message: 'Upload failed' }, { status: 500 });
  }
}, 'editor');
