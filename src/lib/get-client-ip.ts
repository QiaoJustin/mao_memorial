import { NextRequest } from 'next/server';

/**
 * 从请求中提取客户端 IP（P1-9）
 *
 * 修复 XFF 伪造问题：
 * - x-forwarded-for 可能是 "client, proxy1, proxy2" 格式
 * - 直接用整个字符串作为 IP 不准确，应取第一个（最接近客户端的代理转发）
 *
 * 优先级：
 * 1. x-forwarded-for 的第一个 IP
 * 2. x-real-ip
 * 3. 'unknown' 回退
 */
export function getClientIp(request: NextRequest | Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    // 取 XFF 链中第一个 IP（最接近客户端的代理转发）
    const firstIp = xff.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
