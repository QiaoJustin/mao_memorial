import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 类名合并工具
 * 结合 clsx 和 tailwind-merge：
 * - clsx：处理条件类名
 * - tailwind-merge：解决 Tailwind 类名冲突
 *
 * @param inputs 类名列表（支持字符串、对象、数组等多种形式）
 * @returns 合并后的类名字符串
 *
 * @example
 * cn('px-2 py-1', isActive && 'bg-primary', 'px-4')
 * // => 'py-1 bg-primary px-4'（px-4 覆盖了 px-2）
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 格式化日期为 ISO 8601 字符串（不含 'T'）
 * 遵循用户偏好：时间字段格式为 ISO 8601 无 'T'
 *
 * @param date 日期对象或日期字符串
 * @returns 格式化后的字符串，如 "2026-07-04 15:30:00"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const iso = d.toISOString();
  // 替换 'T' 为空格，截取到秒
  return iso.replace('T', ' ').slice(0, 19);
}

/**
 * 格式化数字（添加千分位分隔符）
 *
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}
