# 管理后台节点管理修复 - Implementation Plan

## [x] Task 1: 验证数据库中时间线节点数据
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 查询 `timeline_nodes` 表确认数据存在
  - 如果数据缺失，重新执行数据导入脚本
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 查询 `timeline_nodes` 表返回99条记录
  - `programmatic` TR-1.2: 查询 `photos` 表返回100条记录
- **Notes**: 确保先运行 `npx prisma db seed` 导入基础数据

## [x] Task 2: 修复管理后台节点管理API的BigInt序列化问题
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 检查 `/api/v1/admin/nodes` 接口返回数据
  - 将BigInt类型转换为Number类型
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-2.1: API返回200状态码
  - `programmatic` TR-2.2: 返回数据中无BigInt类型
- **Notes**: 参考之前修复 `/api/v1/admin/stats/dashboard` 的方案

## [x] Task 3: 修复管理后台节点管理前端错误处理
- **Priority**: high
- **Depends On**: Task 2
- **Description**: 
  - 增强 `fetchNodes` 函数的错误处理
  - 添加401重定向逻辑
  - 添加token检查
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `programmatic` TR-3.1: 无token时自动重定向到登录页
  - `human-judgment` TR-3.2: 节点列表能正常显示数据
- **Notes**: 使用Next.js的router进行重定向

## [x] Task 4: 验证前端页面图片显示
- **Priority**: medium
- **Depends On**: Task 1
- **Description**: 
  - 检查 `/timeline` 和 `/photos` 页面图片路径
  - 确保图片URL正确指向 `public/timeline/` 目录
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-4.1: 图片URL返回200状态码
  - `human-judgment` TR-4.2: 页面能正常展示图片
- **Notes**: 使用 `http://localhost:3000/timeline/{filename}.jpg` 测试

## [x] Task 5: 修复管理后台其他组件的localStorage问题
- **Priority**: medium
- **Depends On**: Task 3
- **Description**: 
  - 检查其他管理后台组件是否有类似的localStorage问题
  - 确保所有localStorage访问都在useEffect中
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `human-judgment` TR-5.1: 所有管理后台页面能正常加载
  - `programmatic` TR-5.2: 无 "localStorage is not defined" 错误
- **Notes**: 重点检查AdminLayout下的所有组件

## [x] Task 6: 全面测试所有页面和接口
- **Priority**: medium
- **Depends On**: Task 1-5
- **Description**: 
  - 测试所有主要页面（/timeline, /photos, /search, /admin/*）
  - 测试所有API接口
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-6.1: 所有页面返回200状态码
  - `programmatic` TR-6.2: 所有API接口返回正确数据格式
- **Notes**: 使用脚本批量测试