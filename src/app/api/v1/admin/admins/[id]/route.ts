import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { serializeAdmin } from '@/lib/serializers';
import { NextResponse } from 'next/server';

export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;

    const admin = await prisma.admin.findFirst({
      where: { id: BigInt(id), isDeleted: false },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ code: 404, message: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({
      code: 200,
      data: serializeAdmin(admin as unknown as Record<string, unknown>),
    });
  },
  'super_admin'
);

export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;
    const body = await request.json();

    const existing = await prisma.admin.findFirst({
      where: { id: BigInt(id), isDeleted: false },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ code: 404, message: 'Admin not found' }, { status: 404 });
    }
    const admin = await prisma.admin.update({
      where: { id: BigInt(id) },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role,
        status: body.status,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      code: 200,
      data: serializeAdmin(admin as unknown as Record<string, unknown>),
    });
  },
  'super_admin'
);

export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, ctx) => {
    const { id } = await ctx.params;
    // P2-1 修复：用 select 排除敏感字段（passwordHash、failedLoginCount、lockedUntil）
    const existing = await prisma.admin.findFirst({
      where: { id: BigInt(id), isDeleted: false },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ code: 404, message: 'Admin not found' }, { status: 404 });
    }
    const admin = await prisma.admin.update({
      where: { id: BigInt(id) },
      data: { isDeleted: true },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      code: 200,
      data: serializeAdmin(admin as unknown as Record<string, unknown>),
    });
  },
  'super_admin'
);
