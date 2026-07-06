// API 端点常量

const API_BASE = '/api/v1';

// 公开 API
export const API = {
  // 时间线
  TIMELINE: `${API_BASE}/timeline`,
  TIMELINE_DETAIL: (id: number | string) => `${API_BASE}/timeline/${id}`,
  TIMELINE_ADJACENT: (id: number | string) => `${API_BASE}/timeline/${id}/adjacent`,
  TIMELINE_VIEW: (id: number | string) => `${API_BASE}/timeline/${id}/view`,

  // 照片
  PHOTOS: `${API_BASE}/photos`,

  // 搜索
  SEARCH: `${API_BASE}/search`,
  SEARCH_SUGGEST: (q: string) => `${API_BASE}/search/suggest?q=${encodeURIComponent(q)}`,

  // 留言
  MESSAGES: `${API_BASE}/messages`,
  MESSAGE_LIKE: (id: number | string) => `${API_BASE}/messages/${id}/like`,

  // 认证
  AUTH_ME: `${API_BASE}/auth/me`,
  AUTH_LOGIN: `${API_BASE}/auth/login`,
  AUTH_PASSWORD: `${API_BASE}/auth/password`,

  // 音乐
  MUSIC: `${API_BASE}/music`,
  MUSIC_PLAY: (id: number | string) => `${API_BASE}/music/${id}/play`,

  // 管理后台
  ADMIN: {
    NODES: `${API_BASE}/admin/nodes`,
    NODE_DETAIL: (id: number | string) => `${API_BASE}/admin/nodes/${id}`,
    PHOTOS: `${API_BASE}/admin/photos`,
    PHOTO_DETAIL: (id: number | string) => `${API_BASE}/admin/photos/${id}`,
    MESSAGES: `${API_BASE}/admin/messages`,
    MESSAGES_PENDING: `${API_BASE}/admin/messages?status=pending&page=1&pageSize=5`,
    ADMINS: `${API_BASE}/admin/admins`,
    ADMIN_DETAIL: (id: number | string) => `${API_BASE}/admin/admins/${id}`,
    SENSITIVE_WORDS: `${API_BASE}/admin/sensitive-words`,
    SETTINGS: `${API_BASE}/admin/settings`,
    STATS: `${API_BASE}/admin/stats`,
    UPLOAD: `${API_BASE}/admin/upload`,
    UPLOAD_BATCH: `${API_BASE}/admin/upload/batch`,
    MUSIC: `${API_BASE}/admin/music`,
    MUSIC_DETAIL: (id: number | string) => `${API_BASE}/admin/music/${id}`,
  },
} as const;