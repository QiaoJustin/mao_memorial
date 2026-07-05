import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始导入种子数据...');

  await prisma.era.createMany({
    data: [
      {
        id: 'youth',
        name: '求学探索',
        period: '1918—1926',
        description: '湖南求学，投身五四运动，参与建党初期工作',
        icon: 'book-open',
        color: '#4A7C59',
        sortOrder: 1,
        nodeCount: 5,
        isActive: true,
      },
      {
        id: 'revolution',
        name: '革命征程',
        period: '1927—1936',
        description: '秋收起义，井冈山革命根据地，万里长征',
        icon: 'flag',
        color: '#8B0000',
        sortOrder: 2,
        nodeCount: 5,
        isActive: true,
      },
      {
        id: 'yanan',
        name: '延安岁月',
        period: '1937—1945',
        description: '抗日战争，延安整风，中共七大',
        icon: 'mountain',
        color: '#C17A3A',
        sortOrder: 3,
        nodeCount: 16,
        isActive: true,
      },
      {
        id: 'liberation',
        name: '解放战争',
        period: '1946—1949',
        description: '重庆谈判，三大战役，开国大典',
        icon: 'sword',
        color: '#B8860B',
        sortOrder: 4,
        nodeCount: 13,
        isActive: true,
      },
      {
        id: 'founding',
        name: '建国初期',
        period: '1950—1959',
        description: '社会主义改造，一五计划，宪法制定',
        icon: 'star',
        color: '#D4AF37',
        sortOrder: 5,
        nodeCount: 22,
        isActive: true,
      },
      {
        id: 'construction',
        name: '社会主义建设',
        period: '1960—1965',
        description: '全面建设社会主义时期',
        icon: 'hammer',
        color: '#2F4F4F',
        sortOrder: 6,
        nodeCount: 17,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✓ 6个年代分类已导入');

  // ⚠️ 警告：以下默认密码仅用于开发环境，生产部署前必须修改！
  // P0-11: admin 与 editor 使用独立 hash，避免共用密码导致权限混淆
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const editorPasswordHash = await bcrypt.hash('editor123', 10);
  await prisma.admin.createMany({
    data: [
      {
        username: 'admin',
        passwordHash: adminPasswordHash,
        name: '超级管理员',
        email: 'admin@mao-memorial.cn',
        role: 'super_admin',
        status: 'active',
      },
      {
        username: 'editor',
        passwordHash: editorPasswordHash,
        name: '内容编辑',
        email: 'editor@mao-memorial.cn',
        role: 'editor',
        status: 'active',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✓ 2个管理员账号已创建（admin/admin123, editor/editor123）');

  await prisma.setting.createMany({
    data: [
      {
        key: 'site_name',
        value: '毛主席生平纪念网站',
        type: 'string',
        category: 'general',
        description: '网站名称',
        isPublic: true,
      },
      {
        key: 'site_description',
        value: '100张珍贵照片，重温伟人波澜壮阔的一生',
        type: 'string',
        category: 'general',
        description: '网站描述',
        isPublic: true,
      },
      {
        key: 'site_keywords',
        value: '毛泽东,毛主席,生平,纪念,历史照片',
        type: 'string',
        category: 'general',
        description: '网站关键词',
        isPublic: true,
      },
      {
        key: 'message_review_enabled',
        value: 'true',
        type: 'boolean',
        category: 'message',
        description: '是否开启留言审核',
        isPublic: false,
      },
      {
        key: 'message_rate_limit',
        value: '5',
        type: 'number',
        category: 'message',
        description: '留言频率限制(条/小时)',
        isPublic: false,
      },
      {
        key: 'message_max_length',
        value: '200',
        type: 'number',
        category: 'message',
        description: '留言最大长度',
        isPublic: false,
      },
      {
        key: 'sensitive_filter_enabled',
        value: 'true',
        type: 'boolean',
        category: 'message',
        description: '是否开启敏感词过滤',
        isPublic: false,
      },
      {
        key: 'site_icp',
        value: '',
        type: 'string',
        category: 'general',
        description: '备案号',
        isPublic: true,
      },
      {
        key: 'site_copyright',
        value: '本网站内容仅供学习、教育、纪念使用',
        type: 'string',
        category: 'general',
        description: '版权声明',
        isPublic: true,
      },
      {
        key: 'data_source',
        value: '共产党员网',
        type: 'string',
        category: 'general',
        description: '数据来源',
        isPublic: true,
      },
      {
        key: 'data_source_url',
        value: 'https://www.12371.cn/2021/12/26/ARTI1640485049308845.shtml',
        type: 'string',
        category: 'general',
        description: '数据来源链接',
        isPublic: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✓ 11条系统设置已导入');

  await prisma.sensitiveWord.createMany({
    data: [
      { word: '反动', level: 2, category: '政治', replacement: '*' },
      { word: '颠覆', level: 2, category: '政治', replacement: '*' },
      { word: '分裂', level: 2, category: '政治', replacement: '*' },
      { word: '违法', level: 2, category: '违法', replacement: '*' },
      { word: '赌博', level: 2, category: '违法', replacement: '*' },
      { word: '毒品', level: 2, category: '违法', replacement: '*' },
      { word: '色情', level: 2, category: '色情', replacement: '*' },
      { word: '广告推广', level: 1, category: '广告', replacement: '*' },
      { word: '加微信', level: 1, category: '广告', replacement: '*' },
      { word: '加QQ', level: 1, category: '广告', replacement: '*' },
      { word: '联系我', level: 1, category: '广告', replacement: '*' },
    ],
    skipDuplicates: true,
  });
  console.log('✓ 11条敏感词已导入');

  console.log('\n✅ 种子数据导入完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
