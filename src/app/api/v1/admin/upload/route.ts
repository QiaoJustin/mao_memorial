import { withAuth } from '@/lib/with-auth';
import { NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import { join, basename, extname } from 'path';
import { logger } from '@/lib/logger';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/flac': 'flac',
  'audio/mp4': 'm4a',
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

  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ code: 400, message: 'File too large' }, { status: 400 });
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads');

  // 保留原始文件名：移除路径信息、处理重名冲突
  const rawName = basename(file.name);
  const baseName = rawName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
  let filename = baseName;
  const filePath = join(uploadDir, filename);

  // 检查重名，如有冲突则追加数字后缀
  let counter = 1;
  while (true) {
    try {
      await access(filePath);
      // 文件已存在，尝试下一个序号
      const ext = extname(baseName);
      const nameWithoutExt = basename(baseName, ext);
      filename = `${nameWithoutExt}_${counter}${ext}`;
      counter++;
    } catch {
      // 文件不存在，使用当前 filename
      break;
    }
  }

  try {
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const finalPath = join(uploadDir, filename);
    await writeFile(finalPath, buffer);

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
    logger.error('[upload] 文件上传失败:', error);
    return NextResponse.json({ code: 500, message: 'Upload failed' }, { status: 500 });
  }
}, 'editor');
