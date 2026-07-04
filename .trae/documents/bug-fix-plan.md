# Bug修复计划

## 问题分析

通过对代码的详细审查，发现了以下几个关键问题：

### 问题1：年代筛选失效
- **现象**：管理后台有年代数据，但前端按年代筛选没有数据
- **根因**：前端传入年代名称（如"建国初期"），但后端直接将其作为 `eraId`（数字类型）查询，导致条件不匹配
- **影响范围**：照片页面、时间轴页面的年代筛选功能

### 问题2：照片详情页404
- **现象**：访问 `http://localhost:3000/photos/3` 报404
- **根因**：缺少 `/photos/[id]/page.tsx` 路由页面，`PhotoCard` 组件会链接到不存在的路由

### 问题3：搜索功能失效
- **现象**：首页搜索框功能失效，搜索结果页面无数据
- **根因**：
  - `search/page.tsx` 使用 `data.data.list` 但API返回的是 `data.data.items`
  - `SearchBar.tsx` 使用 `data.data` 但API返回的是 `data.data.suggestions`

### 问题4：时间轴节点加载失败
- **现象**：点击生平时间轴加载节点失败
- **根因**：与问题1相同，年代筛选参数传递错误导致查询无结果

## 修复方案

### 修复1：年代筛选API参数处理
**修改文件**：
- `src/app/api/v1/photos/route.ts` - 第54-56行
- `src/app/api/v1/timeline/route.ts` - 第50-52行

**修复内容**：
- 在查询前通过年代名称查找对应的ID
- 修改 `era` 参数处理逻辑，先查询 era 表获取ID

### 修复2：创建照片详情页
**新建文件**：
- `src/app/photos/[id]/page.tsx`

**功能需求**：
- 根据照片ID展示照片详情
- 包含照片大图、标题、描述、所属时间节点等信息
- 提供导航到所属时间节点的链接

### 修复3：搜索结果字段名修正
**修改文件**：
- `src/app/search/page.tsx` - 第78行
- `src/components/SearchBar.tsx` - 第33行

**修复内容**：
- 将 `data.data.list` 改为 `data.data.items`
- 将 `data.data` 改为 `data.data.suggestions`

### 修复4：时间轴加载问题（已包含在修复1中）
- 年代筛选问题修复后，时间轴加载问题将自动解决

## 文件修改清单

| 文件路径 | 修改类型 | 说明 |
|---------|---------|------|
| `src/app/api/v1/photos/route.ts` | 修改 | 修复 era 参数查询逻辑 |
| `src/app/api/v1/timeline/route.ts` | 修改 | 修复 era 参数查询逻辑 |
| `src/app/photos/[id]/page.tsx` | 新建 | 创建照片详情页面 |
| `src/app/search/page.tsx` | 修改 | 修正搜索结果字段名 |
| `src/components/SearchBar.tsx` | 修改 | 修正搜索建议字段名 |

## 风险评估

- **低风险**：所有修改都是局部的，不影响整体架构
- **兼容性**：修复后API接口保持向后兼容
- **测试建议**：修复后需要测试年代筛选、搜索功能、照片详情页

## 实施步骤

1. 修复 `photos` API 的年代筛选逻辑
2. 修复 `timeline` API 的年代筛选逻辑
3. 创建照片详情页面
4. 修复搜索页面字段名
5. 修复搜索栏组件字段名
6. 验证测试