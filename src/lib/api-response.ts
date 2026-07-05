import { NextResponse } from 'next/server';

/**
 * App Router 兼容的统一响应工具
 * 供后续 route 统一风格使用，现有 route 可逐步迁移
 *
 * P1-2: 重构自 Pages Router 风格（NextApiResponse）为 App Router 风格（NextResponse）
 */

// P1-2: 成功响应
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ code: 200, data }, { status });
}

// P1-2: 错误响应（code 同时作为 HTTP status，可通过 status 参数覆盖）
export function errorResponse(
  message: string,
  code: number = 400,
  status: number = code
) {
  return NextResponse.json({ code, message, data: null }, { status });
}

// P1-2: 分页响应（自动处理 BigInt → Number 转换，解决 Prisma count 序列化问题）
export function paginatedResponse<T>(
  list: T[],
  total: number | bigint,
  page: number,
  pageSize: number
) {
  const totalNum = Number(total);
  return NextResponse.json({
    code: 200,
    data: {
      list,
      total: totalNum,
      totalPages: Math.ceil(totalNum / pageSize),
      page,
      pageSize,
    },
  });
}
