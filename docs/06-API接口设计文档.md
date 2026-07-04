# 06 - API 接口设计文档

> **文档名称**：毛主席生平纪念网站 API 接口设计文档
> **文档版本**：v1.0.0
> **编写日期**：2026-07-03
> **API 版本**：v1
> **基础路径**：`/api/v1`

---

## 目录

1. [接口规范](#1-接口规范)
2. [认证机制](#2-认证机制)
3. [公共接口](#3-公共接口)
4. [时间轴接口](#4-时间轴接口)
5. [照片接口](#5-照片接口)
6. [搜索接口](#6-搜索接口)
7. [留言接口](#7-留言接口)
8. [认证接口](#8-认证接口)
9. [后台管理接口](#9-后台管理接口)
10. [文件上传接口](#10-文件上传接口)
11. [统计接口](#11-统计接口)
12. [错误码定义](#12-错误码定义)

---

## 1. 接口规范

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| 协议 | HTTPS |
| 基础路径 | `/api/v1` |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 认证方式 | JWT (Cookie / Bearer Token) |
| 时间格式 | ISO 8601 (`2026-07-03T12:00:00Z`) |

### 1.2 请求头规范

```http
Content-Type: application/json
Accept: application/json
X-Request-ID: {uuid}          # 可选，请求追踪ID
Authorization: Bearer {token}  # 后台接口需要
Cookie: admin_token={token}    # 后台接口可选
```

### 1.3 统一响应格式

**成功响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 业务数据
  },
  "timestamp": 1690000000000,
  "requestId": "req_xxxxxxxxxxxxx"
}
```

**分页响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  },
  "timestamp": 1690000000000,
  "requestId": "req_xxxxxxxxxxxxx"
}
```

**错误响应**：
```json
{
  "code": 400,
  "message": "参数错误",
  "data": null,
  "errors": [
    {
      "field": "date",
      "message": "日期不能为空"
    }
  ],
  "timestamp": 1690000000000,
  "requestId": "req_xxxxxxxxxxxxx"
}
```

### 1.4 分页参数规范

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码，从1开始 |
| pageSize | number | 20 | 每页数量，最大100 |
| sort | string | - | 排序字段，如 `created_at` |
| order | string | desc | 排序方向：`asc` / `desc` |

### 1.5 HTTP 方法语义

| 方法 | 语义 | 幂等性 |
|------|------|--------|
| GET | 查询资源 | 是 |
| POST | 创建资源 | 否 |
| PUT | 更新资源（全量） | 是 |
| PATCH | 更新资源（部分） | 否 |
| DELETE | 删除资源 | 是 |

---

## 2. 认证机制

### 2.1 Token 获取

通过 `POST /api/v1/auth/login` 获取 Token，Token 通过 HttpOnly Cookie 设置，也可通过响应体返回用于 Bearer 认证。

### 2.2 Token 使用

**方式一：Cookie（推荐）**
```http
Cookie: admin_token=eyJhbGciOiJIUzI1NiIs...
```

**方式二：Bearer Token**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 2.3 Token 刷新

Token 有效期 24 小时，过期后需重新登录。暂不支持自动刷新。

### 2.4 接口权限分类

| 权限级别 | 说明 | 接口前缀 |
|---------|------|---------|
| 公开 | 无需认证 | `/api/v1/*`（非admin） |
| 需认证 | 需要登录 | `/api/v1/admin/*` |
| 需管理员 | 需要 admin+ 角色 | `/api/v1/admin/admins/*` |

---

## 3. 公共接口

### 3.1 获取网站配置

**接口**：`GET /api/v1/settings`

**权限**：公开

**说明**：获取前端可见的网站配置信息。

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "siteName": "毛主席生平纪念网站",
    "siteDescription": "100张珍贵照片，重温伟人波澜壮阔的一生",
    "siteKeywords": "毛泽东,毛主席,生平,纪念,历史照片",
    "siteIcp": "",
    "siteCopyright": "本网站内容仅供学习、教育、纪念使用",
    "dataSource": "共产党员网",
    "dataSourceUrl": "https://www.12371.cn/2021/12/26/ARTI1640485049308845.shtml"
  }
}
```

### 3.2 获取年代分类列表

**接口**：`GET /api/v1/eras`

**权限**：公开

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "youth",
      "name": "求学探索",
      "period": "1918—1926",
      "description": "湖南求学，投身五四运动，参与建党初期工作",
      "icon": "book-open",
      "color": "#4A7C59",
      "sortOrder": 1,
      "nodeCount": 5
    },
    {
      "id": "revolution",
      "name": "革命征程",
      "period": "1927—1936",
      "description": "秋收起义，井冈山革命根据地，万里长征",
      "icon": "flag",
      "color": "#8B0000",
      "sortOrder": 2,
      "nodeCount": 5
    }
  ]
}
```

### 3.3 健康检查

**接口**：`GET /api/v1/health`

**权限**：公开

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 3600,
    "database": "connected",
    "redis": "connected"
  }
}
```

---

## 4. 时间轴接口

### 4.1 获取时间轴节点列表

**接口**：`GET /api/v1/timeline`

**权限**：公开

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量（最大50） |
| era | string | 否 | - | 年代筛选，如 `yanan` |
| year | number | 否 | - | 年份筛选，如 `1949` |
| featured | boolean | 否 | false | 是否只获取精选 |

**请求示例**：
```http
GET /api/v1/timeline?page=1&pageSize=10&era=yanan
```

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 13,
        "date": "1937年4月",
        "dateSort": "1937-04-01",
        "year": 1937,
        "eraId": "yanan",
        "eraName": "延安岁月",
        "title": "毛泽东在延安机场",
        "description": "1937年4月，毛泽东在延安机场。八七会议后毛泽东回湖南领导湘赣边界秋收起义。",
        "thumbnailUrl": "https://cdn.example.com/photos/1937-04.jpg",
        "photoCount": 1,
        "viewCount": 1250,
        "sortOrder": 13,
        "isFeatured": false
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 4.2 获取节点详情

**接口**：`GET /api/v1/timeline/{id}`

**权限**：公开

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 节点ID |

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 48,
    "date": "1949年10月1日",
    "dateSort": "1949-10-01",
    "year": 1949,
    "eraId": "liberation",
    "eraName": "解放战争",
    "title": "中华人民共和国开国大典",
    "description": "1949年10月1日下午3时，毛泽东主席在天安门城楼上庄严宣告：中华人民共和国中央人民政府今天成立了！",
    "historicalContext": "经过三年解放战争，中国人民解放军消灭了国民党军队的主力。1949年10月1日，中华人民共和国开国大典在北京天安门广场隆重举行。",
    "thumbnailUrl": "https://cdn.example.com/photos/1949-10-01.jpg",
    "photoCount": 2,
    "viewCount": 5680,
    "likeCount": 320,
    "sortOrder": 48,
    "isFeatured": true,
    "tags": [
      { "id": 1, "name": "开国大典", "slug": "founding-ceremony" },
      { "id": 2, "name": "新中国成立", "slug": "new-china" }
    ],
    "photos": [
      {
        "id": 95,
        "url": "https://cdn.example.com/photos/1949-10-01-large.jpg",
        "thumbnailUrl": "https://cdn.example.com/photos/1949-10-01-thumb.jpg",
        "caption": "毛泽东主席在天安门城楼上宣告中华人民共和国成立",
        "sortOrder": 1,
        "isCover": true
      }
    ],
    "seoTitle": "1949年开国大典 - 毛主席生平纪念",
    "seoDescription": "1949年10月1日，毛泽东主席在天安门城楼上庄严宣告中华人民共和国成立",
    "createdAt": "2026-07-01T10:00:00Z",
    "updatedAt": "2026-07-03T15:30:00Z"
  }
}
```

### 4.3 获取相邻节点

**接口**：`GET /api/v1/timeline/{id}/adjacent`

**权限**：公开

**说明**：获取指定节点的前一个和后一个节点（用于详情页导航）。

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "prev": {
      "id": 47,
      "date": "1949年",
      "title": "中华人民共和国中央人民政府主席",
      "thumbnailUrl": "https://cdn.example.com/photos/1949-chairman.jpg"
    },
    "next": {
      "id": 49,
      "date": "1949年",
      "title": "中华人民共和国中央人民政府成立",
      "thumbnailUrl": "https://cdn.example.com/photos/1949-gov.jpg"
    }
  }
}
```

### 4.4 记录浏览量

**接口**：`POST /api/v1/timeline/{id}/view`

**权限**：公开

**说明**：记录节点浏览量，同一IP 1小时内只计一次。此接口为 fire-and-forget，前端无需等待响应。

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "viewCount": 5681
  }
}
```

### 4.5 获取精选节点

**接口**：`GET /api/v1/timeline/featured`

**权限**：公开

**查询参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| limit | number | 5 | 数量（最大20） |

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 48,
      "date": "1949年10月1日",
      "title": "中华人民共和国开国大典",
      "description": "毛泽东主席在天安门城楼上庄严宣告...",
      "thumbnailUrl": "https://cdn.example.com/photos/1949-10-01.jpg",
      "eraName": "解放战争"
    }
  ]
}
```

---

## 5. 照片接口

### 5.1 获取照片画廊

**接口**：`GET /api/v1/photos`

**权限**：公开

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 24 | 每页数量 |
| era | string | 否 | - | 年代筛选 |
| year | number | 否 | - | 年份筛选 |
| nodeId | number | 否 | - | 节点ID筛选 |
| sort | string | 否 | date_sort | 排序字段 |

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "nodeId": 1,
        "nodeTitle": "湖南省立第一师范学校第八班合影",
        "nodeDate": "1918年",
        "url": "https://cdn.example.com/photos/1918-large.jpg",
        "thumbnailUrl": "https://cdn.example.com/photos/1918-thumb.jpg",
        "caption": "1918年3月，湖南省立第一师范学校第八班合影。毛泽东在四排右二。",
        "eraId": "youth",
        "eraName": "求学探索",
        "width": 1200,
        "height": 800
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 24,
    "totalPages": 5
  }
}
```

### 5.2 获取照片详情

**接口**：`GET /api/v1/photos/{id}`

**权限**：公开

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "nodeId": 1,
    "node": {
      "id": 1,
      "date": "1918年",
      "title": "湖南省立第一师范学校第八班合影",
      "eraName": "求学探索"
    },
    "url": "https://cdn.example.com/photos/1918-large.jpg",
    "thumbnailUrl": "https://cdn.example.com/photos/1918-thumb.jpg",
    "mediumUrl": "https://cdn.example.com/photos/1918-medium.jpg",
    "largeUrl": "https://cdn.example.com/photos/1918-large.jpg",
    "caption": "1918年3月，湖南省立第一师范学校第八班合影。毛泽东在四排右二。",
    "altText": "1918年湖南省立第一师范学校第八班合影",
    "width": 1200,
    "height": 800,
    "fileSize": 450,
    "sortOrder": 1,
    "isCover": true
  }
}
```

---

## 6. 搜索接口

### 6.1 搜索时间节点

**接口**：`GET /api/v1/search`

**权限**：公开

**查询参数**：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| q | string | 是 | - | 搜索关键词（最少2字） |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

**请求示例**：
```http
GET /api/v1/search?q=延安&page=1&pageSize=20
```

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 16,
        "date": "1938年",
        "title": "毛泽东在延安",
        "description": "1938年，毛泽东在<mark>延安</mark>。",
        "thumbnailUrl": "https://cdn.example.com/photos/1938-yanan.jpg",
        "eraName": "延安岁月",
        "relevanceScore": 2.5
      }
    ],
    "total": 16,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "query": "延安"
  }
}
```

### 6.2 搜索建议

**接口**：`GET /api/v1/search/suggest`

**权限**：公开

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 关键词（最少2字） |

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "suggestions": [
      "毛泽东在延安",
      "毛泽东在延安窑洞撰写《论持久战》",
      "毛泽东在延安机场",
      "毛泽东在延安给120师干部作报告"
    ]
  }
}
```

### 6.3 获取热门搜索

**接口**：`GET /api/v1/search/hot`

**权限**：公开

**查询参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| limit | number | 10 | 数量 |

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    { "keyword": "开国大典", "count": 5680 },
    { "keyword": "延安", "count": 3200 },
    { "keyword": "井冈山", "count": 2800 }
  ]
}
```

---

## 7. 留言接口

### 7.1 获取留言列表

**接口**：`GET /api/v1/messages`

**权限**：公开

**查询参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| pageSize | number | 20 | 每页数量 |

**说明**：只返回已审核通过的留言。

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "nickname": "爱国青年",
        "content": "永远怀念毛主席！",
        "likeCount": 56,
        "isPinned": true,
        "createdAt": "2026-07-01T10:00:00Z"
      }
    ],
    "total": 500,
    "page": 1,
    "pageSize": 20,
    "totalPages": 25
  }
}
```

### 7.2 提交留言

**接口**：`POST /api/v1/messages`

**权限**：公开（需频率限制）

**请求体**：
```json
{
  "nickname": "爱国青年",
  "content": "永远怀念毛主席！"
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 昵称，默认"匿名网友"，最长20字 |
| content | string | 是 | 留言内容，最长200字 |

**响应**（201）：
```json
{
  "code": 201,
  "message": "留言已提交，审核通过后将展示",
  "data": {
    "id": 501,
    "status": "pending"
  }
}
```

**错误响应**（429）：
```json
{
  "code": 429,
  "message": "操作过于频繁，请1小时后再试",
  "data": null
}
```

### 7.3 点赞留言

**接口**：`POST /api/v1/messages/{id}/like`

**权限**：公开

**说明**：同一IP对同一留言只能点赞一次。

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "likeCount": 57,
    "liked": true
  }
}
```

---

## 8. 认证接口

### 8.1 管理员登录

**接口**：`POST /api/v1/auth/login`

**权限**：公开

**请求体**：
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**（200）：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "username": "admin",
      "name": "超级管理员",
      "role": "super_admin",
      "avatarUrl": null,
      "lastLoginAt": "2026-07-02T10:00:00Z"
    }
  }
}
```

> 同时设置 HttpOnly Cookie: `admin_token`

**错误响应**（401）：
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": {
    "remainingAttempts": 4
  }
}
```

### 8.2 退出登录

**接口**：`POST /api/v1/auth/logout`

**权限**：需认证

**响应**：
```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

### 8.3 获取当前用户信息

**接口**：`GET /api/v1/auth/me`

**权限**：需认证

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "name": "超级管理员",
    "email": "admin@mao-memorial.cn",
    "role": "super_admin",
    "avatarUrl": null,
    "lastLoginAt": "2026-07-03T10:00:00Z",
    "loginCount": 56
  }
}
```

### 8.4 修改密码

**接口**：`PUT /api/v1/auth/password`

**权限**：需认证

**请求体**：
```json
{
  "oldPassword": "admin123",
  "newPassword": "newpass456"
}
```

**响应**：
```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

---

## 9. 后台管理接口

### 9.1 时间节点管理

#### 9.1.1 获取节点列表（后台）

**接口**：`GET /api/v1/admin/nodes`

**权限**：需认证

**查询参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| pageSize | number | 20 | 每页数量 |
| keyword | string | - | 搜索关键词 |
| era | string | - | 年代筛选 |
| isPublished | boolean | - | 发布状态筛选 |
| sort | string | sortOrder | 排序字段 |
| order | string | asc | 排序方向 |

**响应**：包含完整字段（含 isPublished、isFeatured 等）

#### 9.1.2 获取节点详情（后台）

**接口**：`GET /api/v1/admin/nodes/{id}`

**权限**：需认证

#### 9.1.3 创建节点

**接口**：`POST /api/v1/admin/nodes`

**权限**：需认证（admin+）

**请求体**：
```json
{
  "date": "1949年10月1日",
  "dateSort": "1949-10-01",
  "eraId": "liberation",
  "title": "中华人民共和国开国大典",
  "description": "1949年10月1日下午3时...",
  "historicalContext": "经过三年解放战争...",
  "sortOrder": 48,
  "isPublished": true,
  "isFeatured": true,
  "seoTitle": "1949年开国大典",
  "seoDescription": "...",
  "tags": ["开国大典", "新中国成立"],
  "photos": [
    {
      "url": "https://cdn.example.com/photos/1949-10-01.jpg",
      "thumbnailUrl": "https://cdn.example.com/photos/1949-10-01-thumb.jpg",
      "caption": "毛泽东主席在天安门城楼上",
      "isCover": true,
      "sortOrder": 1
    }
  ]
}
```

**响应**（201）：返回创建的节点完整信息

#### 9.1.4 更新节点

**接口**：`PUT /api/v1/admin/nodes/{id}`

**权限**：需认证（admin+）

**请求体**：同创建，所有字段可选

#### 9.1.5 删除节点

**接口**：`DELETE /api/v1/admin/nodes/{id}`

**权限**：需认证（admin+）

**响应**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

#### 9.1.6 批量操作

**接口**：`POST /api/v1/admin/nodes/batch`

**权限**：需认证（admin+）

**请求体**：
```json
{
  "action": "publish",  // publish/unpublish/delete/feature
  "ids": [1, 2, 3]
}
```

### 9.2 留言管理

#### 9.2.1 获取留言列表（后台）

**接口**：`GET /api/v1/admin/messages`

**权限**：需认证

**查询参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| pageSize | number | 20 | 每页数量 |
| status | string | - | 状态筛选：pending/approved/rejected |
| keyword | string | - | 内容搜索 |
| startDate | string | - | 开始日期 |
| endDate | string | - | 结束日期 |

#### 9.2.2 审核通过留言

**接口**：`PATCH /api/v1/admin/messages/{id}/approve`

**权限**：需认证

**响应**：
```json
{
  "code": 200,
  "message": "审核通过",
  "data": {
    "id": 501,
    "status": "approved",
    "reviewedAt": "2026-07-03T12:00:00Z"
  }
}
```

#### 9.2.3 拒绝留言

**接口**：`PATCH /api/v1/admin/messages/{id}/reject`

**权限**：需认证

**请求体**：
```json
{
  "reason": "内容不当"
}
```

#### 9.2.4 删除留言

**接口**：`DELETE /api/v1/admin/messages/{id}`

**权限**：需认证

#### 9.2.5 置顶/取消置顶

**接口**：`PATCH /api/v1/admin/messages/{id}/pin`

**权限**：需认证（admin+）

**请求体**：
```json
{
  "isPinned": true
}
```

### 9.3 管理员管理

#### 9.3.1 获取管理员列表

**接口**：`GET /api/v1/admin/admins`

**权限**：需认证（super_admin）

#### 9.3.2 创建管理员

**接口**：`POST /api/v1/admin/admins`

**权限**：需认证（super_admin）

**请求体**：
```json
{
  "username": "editor2",
  "password": "editor123",
  "name": "编辑员2",
  "email": "editor2@mao-memorial.cn",
  "role": "editor"
}
```

#### 9.3.3 更新管理员

**接口**：`PUT /api/v1/admin/admins/{id}`

**权限**：需认证（super_admin）

#### 9.3.4 删除管理员

**接口**：`DELETE /api/v1/admin/admins/{id}`

**权限**：需认证（super_admin）

#### 9.3.5 重置密码

**接口**：`PUT /api/v1/admin/admins/{id}/password`

**权限**：需认证（super_admin）

**请求体**：
```json
{
  "newPassword": "newpass123"
}
```

### 9.4 敏感词管理

#### 9.4.1 获取敏感词列表

**接口**：`GET /api/v1/admin/sensitive-words`

**权限**：需认证（admin+）

#### 9.4.2 添加敏感词

**接口**：`POST /api/v1/admin/sensitive-words`

**权限**：需认证（admin+）

**请求体**：
```json
{
  "word": "敏感词",
  "level": 1,
  "category": "政治",
  "replacement": "*"
}
```

#### 9.4.3 批量导入敏感词

**接口**：`POST /api/v1/admin/sensitive-words/batch`

**权限**：需认证（admin+）

**请求体**：
```json
{
  "words": ["词1", "词2", "词3"],
  "level": 1,
  "category": "广告"
}
```

### 9.5 系统设置管理

#### 9.5.1 获取所有设置

**接口**：`GET /api/v1/admin/settings`

**权限**：需认证（admin+）

#### 9.5.2 更新设置

**接口**：`PUT /api/v1/admin/settings/{key}`

**权限**：需认证（admin+）

**请求体**：
```json
{
  "value": "新的网站名称"
}
```

---

## 10. 文件上传接口

### 10.1 上传图片

**接口**：`POST /api/v1/admin/upload`

**权限**：需认证

**请求格式**：`multipart/form-data`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 图片文件 |
| type | string | 否 | 类型：photo/avatar，默认 photo |

**限制**：
- 格式：JPEG、PNG、WebP
- 大小：≤ 5MB

**响应**：
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/uploads/2026/07/03/photo-001.jpg",
    "thumbnailUrl": "https://cdn.example.com/uploads/2026/07/03/photo-001-thumb.jpg",
    "mediumUrl": "https://cdn.example.com/uploads/2026/07/03/photo-001-medium.jpg",
    "largeUrl": "https://cdn.example.com/uploads/2026/07/03/photo-001-large.jpg",
    "width": 1200,
    "height": 800,
    "fileSize": 450,
    "mimeType": "image/jpeg"
  }
}
```

### 10.2 批量上传图片

**接口**：`POST /api/v1/admin/upload/batch`

**权限**：需认证

**请求格式**：`multipart/form-data`

**参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | File[] | 是 | 图片文件数组（最多10个） |

**响应**：
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "success": [
      {
        "url": "...",
        "thumbnailUrl": "..."
      }
    ],
    "failed": [
      {
        "filename": "error.jpg",
        "reason": "文件格式不支持"
      }
    ]
  }
}
```

### 10.3 删除文件

**接口**：`DELETE /api/v1/admin/upload`

**权限**：需认证

**请求体**：
```json
{
  "url": "https://cdn.example.com/uploads/2026/07/03/photo-001.jpg"
}
```

---

## 11. 统计接口

### 11.1 获取仪表盘数据

**接口**：`GET /api/v1/admin/stats/dashboard`

**权限**：需认证

**查询参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| startDate | string | 7天前 | 开始日期 |
| endDate | string | 今天 | 结束日期 |

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "overview": {
      "totalNodes": 100,
      "totalPhotos": 100,
      "totalMessages": 568,
      "pendingMessages": 12,
      "totalViews": 56800,
      "todayViews": 320
    },
    "viewsTrend": [
      { "date": "2026-06-27", "count": 280 },
      { "date": "2026-06-28", "count": 320 }
    ],
    "topNodes": [
      {
        "id": 48,
        "title": "中华人民共和国开国大典",
        "viewCount": 5680
      }
    ],
    "eraDistribution": [
      { "eraId": "yanan", "eraName": "延安岁月", "nodeCount": 16, "viewCount": 12000 }
    ]
  }
}
```

### 11.2 获取访问统计

**接口**：`GET /api/v1/admin/stats/traffic`

**权限**：需认证

**查询参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| startDate | string | 30天前 | 开始日期 |
| endDate | string | 今天 | 结束日期 |
| granularity | string | day | 粒度：day/hour |

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "pv": [
      { "date": "2026-07-01", "count": 1200 },
      { "date": "2026-07-02", "count": 1500 }
    ],
    "uv": [
      { "date": "2026-07-01", "count": 800 },
      { "date": "2026-07-02", "count": 950 }
    ],
    "topPages": [
      { "path": "/timeline", "pv": 5600, "uv": 3200 },
      { "path": "/", "pv": 4500, "uv": 2800 }
    ],
    "topSources": [
      { "source": "直接访问", "count": 3000 },
      { "source": "百度搜索", "count": 2000 }
    ]
  }
}
```

### 11.3 导出统计报表

**接口**：`GET /api/v1/admin/stats/export`

**权限**：需认证（admin+）

**查询参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 报表类型：nodes/messages/traffic |
| startDate | string | 开始日期 |
| endDate | string | 结束日期 |
| format | string | 格式：csv/xlsx |

**响应**：文件下载流

---

## 12. 错误码定义

### 12.1 业务错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 400 | 400 | 参数错误 |
| 401 | 401 | 未认证 |
| 403 | 403 | 无权限 |
| 404 | 404 | 资源不存在 |
| 409 | 409 | 资源冲突 |
| 422 | 422 | 业务校验失败 |
| 429 | 429 | 请求过于频繁 |
| 500 | 500 | 服务器内部错误 |
| 503 | 503 | 服务不可用 |

### 12.2 常见错误消息

| 场景 | code | message |
|------|------|---------|
| 参数缺失 | 400 | 参数错误：{field}不能为空 |
| 参数格式错误 | 400 | 参数错误：{field}格式不正确 |
| 未登录 | 401 | 请先登录 |
| Token过期 | 401 | 登录已过期，请重新登录 |
| 权限不足 | 403 | 您没有权限执行此操作 |
| 资源不存在 | 404 | 请求的资源不存在 |
| 用户名已存在 | 409 | 用户名已存在 |
| 留言频率超限 | 429 | 操作过于频繁，请1小时后再试 |
| 登录失败超限 | 429 | 登录失败次数过多，请30分钟后再试 |
| 服务器错误 | 500 | 服务器开小差了，请稍后重试 |
| 数据库连接失败 | 503 | 系统维护中，请稍后访问 |

---

## 附录：接口清单速查表

| 序号 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 1 | GET | /api/v1/health | 公开 | 健康检查 |
| 2 | GET | /api/v1/settings | 公开 | 网站配置 |
| 3 | GET | /api/v1/eras | 公开 | 年代列表 |
| 4 | GET | /api/v1/timeline | 公开 | 时间轴列表 |
| 5 | GET | /api/v1/timeline/{id} | 公开 | 节点详情 |
| 6 | GET | /api/v1/timeline/{id}/adjacent | 公开 | 相邻节点 |
| 7 | POST | /api/v1/timeline/{id}/view | 公开 | 记录浏览 |
| 8 | GET | /api/v1/timeline/featured | 公开 | 精选节点 |
| 9 | GET | /api/v1/photos | 公开 | 照片画廊 |
| 10 | GET | /api/v1/photos/{id} | 公开 | 照片详情 |
| 11 | GET | /api/v1/search | 公开 | 搜索 |
| 12 | GET | /api/v1/search/suggest | 公开 | 搜索建议 |
| 13 | GET | /api/v1/search/hot | 公开 | 热门搜索 |
| 14 | GET | /api/v1/messages | 公开 | 留言列表 |
| 15 | POST | /api/v1/messages | 公开 | 提交留言 |
| 16 | POST | /api/v1/messages/{id}/like | 公开 | 点赞留言 |
| 17 | POST | /api/v1/auth/login | 公开 | 登录 |
| 18 | POST | /api/v1/auth/logout | 认证 | 退出 |
| 19 | GET | /api/v1/auth/me | 认证 | 当前用户 |
| 20 | PUT | /api/v1/auth/password | 认证 | 修改密码 |
| 21 | GET | /api/v1/admin/nodes | 认证 | 节点列表 |
| 22 | GET | /api/v1/admin/nodes/{id} | 认证 | 节点详情 |
| 23 | POST | /api/v1/admin/nodes | admin+ | 创建节点 |
| 24 | PUT | /api/v1/admin/nodes/{id} | admin+ | 更新节点 |
| 25 | DELETE | /api/v1/admin/nodes/{id} | admin+ | 删除节点 |
| 26 | POST | /api/v1/admin/nodes/batch | admin+ | 批量操作 |
| 27 | GET | /api/v1/admin/messages | 认证 | 留言列表 |
| 28 | PATCH | /api/v1/admin/messages/{id}/approve | 认证 | 通过留言 |
| 29 | PATCH | /api/v1/admin/messages/{id}/reject | 认证 | 拒绝留言 |
| 30 | DELETE | /api/v1/admin/messages/{id} | 认证 | 删除留言 |
| 31 | PATCH | /api/v1/admin/messages/{id}/pin | admin+ | 置顶留言 |
| 32 | GET | /api/v1/admin/admins | super | 管理员列表 |
| 33 | POST | /api/v1/admin/admins | super | 创建管理员 |
| 34 | PUT | /api/v1/admin/admins/{id} | super | 更新管理员 |
| 35 | DELETE | /api/v1/admin/admins/{id} | super | 删除管理员 |
| 36 | PUT | /api/v1/admin/admins/{id}/password | super | 重置密码 |
| 37 | GET | /api/v1/admin/sensitive-words | admin+ | 敏感词列表 |
| 38 | POST | /api/v1/admin/sensitive-words | admin+ | 添加敏感词 |
| 39 | POST | /api/v1/admin/sensitive-words/batch | admin+ | 批量导入 |
| 40 | GET | /api/v1/admin/settings | admin+ | 系统设置 |
| 41 | PUT | /api/v1/admin/settings/{key} | admin+ | 更新设置 |
| 42 | POST | /api/v1/admin/upload | 认证 | 上传图片 |
| 43 | POST | /api/v1/admin/upload/batch | 认证 | 批量上传 |
| 44 | DELETE | /api/v1/admin/upload | 认证 | 删除文件 |
| 45 | GET | /api/v1/admin/stats/dashboard | 认证 | 仪表盘 |
| 46 | GET | /api/v1/admin/stats/traffic | 认证 | 访问统计 |
| 47 | GET | /api/v1/admin/stats/export | admin+ | 导出报表 |
