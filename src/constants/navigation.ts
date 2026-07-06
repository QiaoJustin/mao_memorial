// 导航项配置

export interface NavItem {
  label: string;
  href: string;
}

export const SITE_NAME = '毛主席生平纪念';

export const ADMIN_LOGIN_PATH = '/admin/login';

export const NAV_ITEMS: NavItem[] = [
  { label: '首页', href: '/' },
  { label: '时间轴', href: '/timeline' },
  { label: '照片画廊', href: '/photos' },
  { label: '留言纪念', href: '/messages' },
];

export const FOOTER_DESCRIPTION =
  '以珍贵历史照片为载体，缅怀毛泽东主席波澜壮阔的一生，传承红色革命精神。';

export const FOOTER_ABOUT_ITEMS = [
  '纪念毛泽东同志诞辰',
  '传承红色文化基因',
  '弘扬革命精神',
];