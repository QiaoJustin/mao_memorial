# 毛主席生平纪念网站 - 原始数据资料包

> **数据来源**：共产党员网《100张照片回顾毛泽东主席一生中的难忘瞬间》
> **原文链接**：https://www.12371.cn/2021/12/26/ARTI1640485049308845.shtml
> **发布日期**：2021年12月26日（毛泽东诞辰128周年）
> **爬取日期**：2026-07-03
> **数据版本**：v1.0.0

---

## 一、资料包内容

本资料包包含从共产党员网爬取的毛主席生平时间线完整数据，包括历史照片、时间节点、事件描述，可直接用于网站开发。

```
mao-memorial-data/
├── README.md                          # 本说明文件
├── data/                              # 结构化数据文件
│   ├── timeline_data.json             # JSON 格式（推荐开发使用）
│   ├── timeline_data.csv              # CSV 格式（Excel 可打开）
│   ├── timeline_data.md               # Markdown 格式（含图片预览）
│   └── timeline_data.sql              # SQL 导入脚本（MySQL）
└── images/                            # 历史照片（100张）
    ├── node_001_1918.jpg
    ├── node_002_1919.jpg
    ├── ...
    └── node_100_1965b.jpg
```

---

## 二、数据统计

| 统计项 | 数值 |
|--------|------|
| 时间节点总数 | 99 个 |
| 历史照片总数 | 100 张 |
| 时间跨度 | 1918年 — 1965年 |
| 照片总大小 | 约 13 MB |
| 数据文件格式 | JSON / CSV / MD / SQL |

### 各年代分布

| 年代分类 | 时间范围 | 节点数 |
|---------|---------|--------|
| 求学探索时期 | 1918-1920 | 5 个 |
| 革命征程时期 | 1921-1934 | 4 个 |
| 延安岁月时期 | 1935-1944 | 22 个 |
| 解放战争时期 | 1945-1949 | 25 个 |
| 建国初期 | 1950-1956 | 20 个 |
| 社会主义建设时期 | 1957-1965 | 23 个 |

---

## 三、数据结构说明

### JSON 数据结构

```json
{
  "source": {
    "title": "100张照片回顾毛泽东主席一生中的难忘瞬间！",
    "url": "https://www.12371.cn/2021/12/26/ARTI1640485049308845.shtml",
    "publishedDate": "2021-12-26",
    "crawledDate": "2026-07-03"
  },
  "stats": {
    "totalNodes": 99,
    "totalImages": 100,
    "dateRange": "1918-1965"
  },
  "nodes": [
    {
      "id": 1,
      "date": "1918年",
      "era": "youth",
      "description": "毛泽东在湖南省立第四师范学校求学时",
      "images": [
        {
          "src": "https://p5.img.cctvpic.com/...",
          "caption": "毛泽东在湖南省立第四师范学校求学时",
          "filename": "node_001_1918.jpg",
          "local_path": "images/node_001_1918.jpg",
          "original_url": "https://p5.img.cctvpic.com/..."
        }
      ]
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 节点ID（1-99） |
| date | string | 时间节点，如"1949年10月1日" |
| era | string | 年代分类标识 |
| description | string | 事件描述 |
| images | array | 照片数组 |
| images[].src | string | 照片原始URL |
| images[].caption | string | 照片配文说明 |
| images[].filename | string | 本地文件名 |
| images[].local_path | string | 本地相对路径 |
| images[].original_url | string | 原始URL（同src） |

### 年代分类标识

| 标识 | 名称 | 时间范围 |
|------|------|---------|
| youth | 求学探索时期 | 1918-1920 |
| revolution | 革命征程时期 | 1921-1934 |
| yanan | 延安岁月时期 | 1935-1944 |
| liberation | 解放战争时期 | 1945-1949 |
| founding | 建国初期 | 1950-1956 |
| construction | 社会主义建设时期 | 1957-1965 |

---

## 四、各格式文件用途

### 1. timeline_data.json（推荐）
- **用途**：前端直接引用、API 返回、数据库导入
- **优势**：结构化程度高，支持嵌套，所有编程语言通用
- **使用**：`import data from './timeline_data.json'`

### 2. timeline_data.csv
- **用途**：Excel/WPS 查看、数据分析、批量编辑
- **优势**：表格形式直观，易于人工浏览和编辑
- **字段**：序号、时间节点、年代分类、年代名称、事件描述、图片说明、原始图片URL、本地图片路径、本地文件名

### 3. timeline_data.md
- **用途**：文档阅读、图片预览、Markdown 编辑器查看
- **优势**：可直接渲染图片，适合内容审阅
- **使用**：在 Typora、VS Code 等 Markdown 编辑器中打开

### 4. timeline_data.sql
- **用途**：直接导入 MySQL 数据库
- **优势**：一键导入，包含建表后的 INSERT 语句
- **使用**：`mysql -u root -p mao_memorial < timeline_data.sql`

---

## 五、开发使用建议

### 1. 前端开发（Next.js / React）

```typescript
// 直接导入 JSON 数据
import timelineData from './data/timeline_data.json';

// 渲染时间轴
function Timeline() {
  return (
    <div>
      {timelineData.nodes.map(node => (
        <div key={node.id}>
          <h3>{node.date}</h3>
          <p>{node.description}</p>
          {node.images.map((img, i) => (
            <img key={i} src={img.local_path} alt={img.caption} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### 2. 后端开发（数据库导入）

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE mao_memorial DEFAULT CHARSET utf8mb4;"

# 2. 导入数据
mysql -u root -p mao_memorial < data/timeline_data.sql
```

### 3. 图片处理建议

- **本地化**：images 目录下的照片可直接复制到项目的 `public/images/` 目录
- **优化**：建议使用 sharp 库生成缩略图（200px / 600px / 1200px）
- **格式**：建议转换为 WebP 格式以减小体积
- **CDN**：生产环境建议上传至 OSS/CDN 加速访问

---

## 六、数据样例（前5个节点）

| 序号 | 时间节点 | 年代 | 事件描述 |
|------|---------|------|---------|
| 1 | 1918年 | 求学探索时期 | 毛泽东在湖南省立第四师范学校求学时 |
| 2 | 1919年 | 求学探索时期 | 毛泽东在长沙 |
| 3 | 1919年11月16日 | 求学探索时期 | 毛泽东同父亲、伯父、堂弟在长沙合影 |
| 4 | 1919年11月 | 求学探索时期 | 毛泽东与母亲、两个弟弟在长沙合影 |
| 5 | 1920年 | 求学探索时期 | 毛泽东在北平（北京） |

---

## 七、版权声明

1. **版权归属**：本资料包中所有历史照片及文字内容，版权归原出处（共产党员网 / 央视网）所有。
2. **使用限制**：本资料包仅供学习、教育、纪念用途，**不得用于任何商业用途**。
3. **责任声明**：使用者需自行承担因不当使用产生的法律责任。
4. **侵权处理**：如涉及版权问题，请联系项目维护者及时处理。

---

## 八、数据质量说明

- ✅ 99个时间节点全部包含完整的事件描述
- ✅ 100张历史照片全部下载成功（无损坏文件）
- ✅ 每个节点至少关联1张照片
- ✅ 所有照片URL可正常访问
- ✅ 数据已按时间顺序排序
- ✅ 年代分类已自动标注
- ✅ 提供多种格式（JSON/CSV/MD/SQL）适配不同开发需求

---

> **生成时间**：2026-07-03
> **数据版本**：v1.0.0
> **资料包大小**：约 13 MB
