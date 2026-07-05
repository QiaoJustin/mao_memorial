/**
 * 序列化工具集（P1-3 + P0-1）
 *
 * 作用：将 Prisma 查询返回的对象转换为可安全 JSON.stringify 的纯数据
 * - BigInt 字段转 Number（避免 "Do not know how to serialize a BigInt" 错误）
 * - Date 字段格式化为 ISO 8601 无 'T'（用户偏好）
 * - 显式排除敏感字段（如 Admin.passwordHash）
 */

// 通用：格式化 Date 为 ISO 8601 无 'T'
function formatTime(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return null;
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

// 通用：BigInt 转 Number（兼容 null/undefined）
function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  return Number(v);
}

function toNullableNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  return Number(v);
}

// 序列化 Era
export function serializeEra(era: Record<string, unknown>) {
  return {
    ...era,
    createdAt: formatTime(era.createdAt as Date),
    updatedAt: formatTime(era.updatedAt as Date),
  };
}

// 序列化 Photo
export function serializePhoto(p: Record<string, unknown>) {
  return {
    ...p,
    id: toNumber(p.id),
    nodeId: toNumber(p.nodeId),
    width: toNullableNumber(p.width),
    height: toNullableNumber(p.height),
    fileSize: toNullableNumber(p.fileSize),
    createdAt: formatTime(p.createdAt as Date),
    updatedAt: formatTime(p.updatedAt as Date),
  };
}

// 序列化 TimelineNode（含 photos、era 关联）
export function serializeNode(node: Record<string, unknown>) {
  return {
    ...node,
    id: toNumber(node.id),
    year: toNumber(node.year),
    photoCount: toNumber(node.photoCount),
    viewCount: toNumber(node.viewCount),
    likeCount: toNumber(node.likeCount),
    sortOrder: toNumber(node.sortOrder),
    createdAt: formatTime(node.createdAt as Date),
    updatedAt: formatTime(node.updatedAt as Date),
    dateSort: formatTime(node.dateSort as Date),
    photos: Array.isArray(node.photos) ? node.photos.map((p) => serializePhoto(p as Record<string, unknown>)) : [],
    era: node.era ? serializeEra(node.era as Record<string, unknown>) : null,
  };
}

// 序列化 Message
export function serializeMessage(m: Record<string, unknown>) {
  return {
    ...m,
    id: toNumber(m.id),
    reviewedBy: toNullableNumber(m.reviewedBy),
    likeCount: toNumber(m.likeCount),
    createdAt: formatTime(m.createdAt as Date),
    updatedAt: formatTime(m.updatedAt as Date),
    reviewedAt: formatTime(m.reviewedAt as Date),
    // reviewer 关联（如有）
    reviewer: m.reviewer
      ? serializeAdmin(m.reviewer as Record<string, unknown>)
      : null,
  };
}

// 序列化 Admin（显式排除 passwordHash、failedLoginCount、lockedUntil）
export function serializeAdmin(a: Record<string, unknown>) {
  return {
    id: toNumber(a.id),
    username: a.username,
    name: a.name,
    email: a.email,
    phone: a.phone,
    avatarUrl: a.avatarUrl,
    role: a.role,
    status: a.status,
    lastLoginAt: formatTime(a.lastLoginAt as Date),
    lastLoginIp: a.lastLoginIp,
    loginCount: toNumber(a.loginCount),
    createdAt: formatTime(a.createdAt as Date),
    updatedAt: formatTime(a.updatedAt as Date),
  };
}

// 序列化 SensitiveWord
export function serializeSensitiveWord(w: Record<string, unknown>) {
  return {
    ...w,
    id: toNumber(w.id),
    createdAt: formatTime(w.createdAt as Date),
    updatedAt: formatTime(w.updatedAt as Date),
  };
}

// 序列化 Setting
export function serializeSetting(s: Record<string, unknown>) {
  return {
    ...s,
    id: toNumber(s.id),
    createdAt: formatTime(s.createdAt as Date),
    updatedAt: formatTime(s.updatedAt as Date),
  };
}

// 序列化 AccessLog
export function serializeAccessLog(log: Record<string, unknown>) {
  return {
    ...log,
    id: toNumber(log.id),
    nodeId: toNullableNumber(log.nodeId),
    statusCode: toNumber(log.statusCode),
    responseTime: toNullableNumber(log.responseTime),
    createdAt: formatTime(log.createdAt as Date),
  };
}

// 序列化 Tag
export function serializeTag(t: Record<string, unknown>) {
  return {
    ...t,
    id: toNumber(t.id),
    usageCount: toNumber(t.usageCount),
    sortOrder: toNumber(t.sortOrder),
    createdAt: formatTime(t.createdAt as Date),
    updatedAt: formatTime(t.updatedAt as Date),
  };
}
