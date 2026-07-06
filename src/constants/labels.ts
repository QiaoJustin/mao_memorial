// 管理后台 UI 文本标签

// 侧边栏菜单
export const ADMIN_SIDEBAR_ITEMS = [
  { label: '仪表盘', href: '/admin/dashboard', icon: 'dashboard' },
  { label: '节点管理', href: '/admin/nodes', icon: 'nodes' },
  { label: '照片管理', href: '/admin/photos', icon: 'photos' },
  { label: '留言审核', href: '/admin/messages', icon: 'messages' },
  { label: '管理员管理', href: '/admin/admins', icon: 'admins' },
  { label: '敏感词', href: '/admin/sensitive-words', icon: 'sensitive' },
  { label: '系统设置', href: '/admin/settings', icon: 'settings' },
  { label: '数据统计', href: '/admin/stats', icon: 'stats' },
] as const;

// 角色标签
export const ROLE_LABELS: Record<string, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  editor: '编辑',
};

// 默认角色
export const DEFAULT_ROLE = 'editor' as const;

// 分页文本
export const PAGINATION_TEXT = {
  prev: '上一页',
  next: '下一页',
  total: '共 {total} 条',
  page: '第 {page} 页',
} as const;