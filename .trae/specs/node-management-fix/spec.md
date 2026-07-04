# 管理后台节点管理修复 - Product Requirement Document

## Overview
- **Summary**: 修复管理后台节点管理列表数据为空的问题，确保数据库中有完整的时间线节点数据，前端能正确展示图片，并修复其他未知问题。
- **Purpose**: 解决管理后台节点管理页面无法显示数据和图片的问题，确保管理员能正常管理时间线节点。
- **Target Users**: 系统管理员、编辑人员

## Goals
- 确保数据库中存在完整的时间线节点数据（99个节点，100张图片）
- 管理后台节点管理列表能正常显示数据
- 前端页面能正确展示历史照片
- 修复认证和权限相关的潜在问题

## Non-Goals (Out of Scope)
- 不修改数据库表结构
- 不新增功能模块
- 不优化性能或样式（除非影响功能）

## Background & Context
- 当前系统使用 Next.js + Prisma + SQLite 技术栈
- 时间线数据已通过 `import-timeline.ts` 导入，但管理后台可能无法正常访问
- 前端页面存在 `searchParams` Promise 解包、`localStorage` 服务端访问等问题
- 图片已复制到 `public/timeline/` 目录，但可能无法正常展示

## Functional Requirements
- **FR-1**: 管理后台节点管理列表能正常显示所有时间线节点数据
- **FR-2**: 前端页面（时间线、照片画廊）能正确展示历史照片
- **FR-3**: 认证流程正常，401错误能正确重定向到登录页
- **FR-4**: API接口返回数据格式正确，无BigInt序列化错误

## Non-Functional Requirements
- **NFR-1**: 页面响应时间 < 2秒
- **NFR-2**: API接口返回状态码符合REST规范
- **NFR-3**: 错误信息清晰，便于排查问题

## Constraints
- **Technical**: Next.js 16, Prisma 5, SQLite 数据库
- **Dependencies**: 依赖 `timeline_data.json` 数据源和本地图片文件

## Assumptions
- `mao-memorial-data` 目录下有完整的时间线数据和图片
- 开发环境已配置好 Node.js 和 npm
- Prisma 数据库迁移已执行

## Acceptance Criteria

### AC-1: 数据库中有完整的时间线节点数据
- **Given**: 执行数据导入脚本
- **When**: 查询 `timeline_nodes` 表
- **Then**: 表中包含99条记录
- **Verification**: `programmatic`

### AC-2: 管理后台节点管理列表显示数据
- **Given**: 用户已登录管理后台
- **When**: 访问 `/admin/nodes` 页面
- **Then**: 页面显示所有时间线节点列表
- **Verification**: `human-judgment`

### AC-3: 前端时间线页面显示图片
- **Given**: 时间线数据已导入
- **When**: 访问 `/timeline` 页面
- **Then**: 每个时间线节点显示对应的历史照片
- **Verification**: `human-judgment`

### AC-4: 认证错误正确处理
- **Given**: 用户未登录或token过期
- **When**: 访问 `/admin/nodes` 页面
- **Then**: 自动重定向到 `/admin/login`
- **Verification**: `programmatic`

### AC-5: API接口正常返回数据
- **Given**: 发送GET请求到 `/api/v1/admin/nodes`
- **When**: 请求包含有效token
- **Then**: 返回200状态码和节点数据列表
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要重新执行数据库迁移？
- [ ] 图片路径是否正确映射到前端？
- [ ] 认证token的有效期是多少？