# 毛主席生平纪念网站

> 缅怀伟人，传承红色基因

一个以毛泽东主席生平为主题的纪念网站，展示从1918年到1965年的98个重要时间节点和100+珍贵历史照片，提供时间轴浏览、照片画廊、留言纪念等功能。

## ✨ 功能特性

### 前台功能
- **首页展示**：Hero区域、时间轴预览、照片画廊、留言墙入口
- **时间轴浏览**：按时间顺序展示98个重要时间节点，支持年代筛选和搜索
- **照片画廊**：100+珍贵历史照片，支持分类筛选和全屏查看
- **留言纪念**：用户留言功能，支持点赞和审核展示
- **全站搜索**：支持搜索时间节点、照片和留言内容

### 后台管理
- **认证系统**：JWT认证，支持多角色权限控制（超级管理员/管理员/编辑）
- **节点管理**：时间节点的创建、编辑、删除和批量操作
- **留言审核**：留言的审核通过、拒绝和置顶管理
- **管理员管理**：管理员用户管理和密码重置
- **敏感词管理**：敏感词过滤和批量导入
- **系统设置**：网站配置管理
- **数据统计**：仪表盘和流量统计

## 🛠 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 3
- **动画**: Framer Motion
- **状态管理**: Zustand
- **数据请求**: SWR
- **图标**: Lucide React
- **表单**: React Hook Form + Zod

### 后端
- **数据库**: MySQL 8.0
- **缓存**: Redis 7
- **ORM**: Prisma
- **认证**: JWT
- **日志**: Winston
- **限流**: Redis + Node-Cron

### 部署
- **容器**: Docker + Docker Compose
- **Web Server**: Nginx
- **CI/CD**: GitHub Actions

## 🚀 快速开始

### 环境要求
- Node.js ≥ 18
- Docker ≥ 20
- npm ≥ 9

### 1. 克隆项目
```bash
git clone <repository-url>
cd mao-memorial
```

### 2. 配置环境变量
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置数据库连接：
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=mao_memorial
MYSQL_USER=root
MYSQL_PASSWORD=your-password

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-jwt-secret
ADMIN_SECRET=your-admin-secret
```

### 3. 启动数据库服务
```bash
docker compose up -d mysql redis
```

### 4. 安装依赖
```bash
npm install
```

### 5. 数据库迁移
```bash
npm run db:migrate
npm run db:seed
```

### 6. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看网站。

## 📁 项目结构

```
src/
├── app/                      # Next.js App Router
│   ├── admin/               # 后台管理页面
│   │   ├── login/           # 登录页
│   │   ├── dashboard/       # 仪表盘
│   │   ├── nodes/           # 节点管理
│   │   ├── messages/        # 留言管理
│   │   ├── admins/          # 管理员管理
│   │   ├── settings/        # 系统设置
│   │   ├── stats/           # 数据统计
│   │   └── sensitive-words/ # 敏感词管理
│   ├── api/                 # API 路由
│   │   └── v1/              # API 版本 v1
│   ├── timeline/            # 时间轴页面
│   ├── gallery/             # 照片画廊页面
│   ├── messages/            # 留言页面
│   ├── search/              # 搜索页面
│   ├── photos/              # 照片详情页面
│   └── layout.tsx           # 根布局
├── components/              # 通用组件
│   ├── admin/               # 后台组件
│   ├── timeline/            # 时间轴组件
│   ├── gallery/             # 画廊组件
│   └── message/             # 留言组件
├── hooks/                   # 自定义 Hooks
├── lib/                     # 工具函数
│   ├── db.ts                # Prisma 数据库连接
│   ├── auth.ts              # JWT 认证
│   ├── cache.ts             # Redis 缓存
│   └── utils.ts             # 通用工具
├── stores/                  # Zustand 状态管理
└── types/                   # TypeScript 类型定义
```

## 📡 API 接口

### 前台 API
| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/v1/timeline` | GET | 获取时间轴节点列表 |
| `/api/v1/timeline/:id` | GET | 获取节点详情 |
| `/api/v1/timeline/:id/adjacent` | GET | 获取相邻节点 |
| `/api/v1/timeline/:id/view` | POST | 增加浏览量 |
| `/api/v1/timeline/featured` | GET | 获取精选节点 |
| `/api/v1/photos` | GET | 获取照片列表 |
| `/api/v1/photos/:id` | GET | 获取照片详情 |
| `/api/v1/messages` | GET/POST | 获取留言列表/发布留言 |
| `/api/v1/messages/:id/like` | POST | 点赞留言 |
| `/api/v1/search` | GET | 搜索 |
| `/api/v1/search/suggest` | GET | 搜索建议 |
| `/api/v1/search/hot` | GET | 热门搜索 |
| `/api/v1/eras` | GET | 获取年代列表 |
| `/api/v1/settings` | GET | 获取网站设置 |
| `/api/v1/health` | GET | 健康检查 |

### 后台 API
| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/v1/admin/nodes` | GET/POST | 节点列表/创建节点 |
| `/api/v1/admin/nodes/:id` | GET/PUT/DELETE | 节点详情/更新/删除 |
| `/api/v1/admin/nodes/batch` | POST | 批量操作 |
| `/api/v1/admin/messages` | GET | 留言列表 |
| `/api/v1/admin/messages/:id` | DELETE | 删除留言 |
| `/api/v1/admin/messages/:id/approve` | PATCH | 审核通过 |
| `/api/v1/admin/messages/:id/reject` | PATCH | 拒绝审核 |
| `/api/v1/admin/messages/:id/pin` | PATCH | 置顶留言 |
| `/api/v1/admin/admins` | GET/POST | 管理员列表/创建 |
| `/api/v1/admin/admins/:id` | GET/PUT/DELETE | 管理员详情/更新/删除 |
| `/api/v1/admin/admins/:id/password` | PUT | 重置密码 |
| `/api/v1/admin/sensitive-words` | GET/POST | 敏感词列表/添加 |
| `/api/v1/admin/sensitive-words/batch` | POST | 批量添加 |
| `/api/v1/admin/sensitive-words/:id` | DELETE | 删除敏感词 |
| `/api/v1/admin/settings` | GET | 设置列表 |
| `/api/v1/admin/settings/:key` | PUT | 更新设置 |
| `/api/v1/admin/upload` | POST | 文件上传 |
| `/api/v1/admin/upload/batch` | POST | 批量上传 |
| `/api/v1/admin/stats/dashboard` | GET | 仪表盘统计 |
| `/api/v1/admin/stats/traffic` | GET | 流量统计 |

## 🧪 测试

```bash
# 单元测试
npm run test

# 测试覆盖率
npm run test:coverage

# E2E 测试
npm run test:e2e
```

## 📦 部署

### Docker 部署
```bash
# 构建并启动全部服务
./scripts/deploy.sh

# 仅构建
./scripts/deploy.sh -b

# 仅部署
./scripts/deploy.sh -d

# 重启服务
./scripts/deploy.sh -r
```

### 生产环境配置
1. 创建 `.env.production` 文件
2. 配置 SSL 证书到 `ssl/` 目录
3. 运行 `docker compose up -d`

## 📝 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 格式化代码
npm run format

# 数据库操作
npm run db:migrate     # 迁移
npm run db:seed        # 种子数据
npm run db:studio      # Prisma Studio
npm run db:reset       # 重置数据库

# 数据导入
npm run db:import-timeline  # 导入时间轴数据
npm run download-images     # 下载图片

# 分析构建
npm run analyze
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 代码规范
- 遵循 ESLint + Prettier 规范
- 使用 TypeScript 严格模式
- 提交信息遵循 Conventional Commits

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！