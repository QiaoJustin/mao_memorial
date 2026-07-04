import fs from 'fs';
import path from 'path';

interface TimelineNode {
  id: number;
  date: string;
  description: string;
  images: Array<{
    filename: string;
    local_path: string;
  }>;
  era: string;
  sort_order: number;
}

interface TimelineData {
  nodes: TimelineNode[];
}

const LOCATION_MAP: Record<string, string> = {
  '长沙': 'changsha',
  '北京': 'beijing',
  '上海': 'shanghai',
  '广州': 'guangzhou',
  '武汉': 'wuhan',
  '瑞金': 'ruijin',
  '保安': 'baoan',
  '延安': 'yanan',
  '重庆': 'chongqing',
  '北平': 'beijing',
  '香山': 'xiangshan',
  '北戴河': 'beidaihe',
  '南京': 'nanjing',
  '长春': 'changchun',
  '河南': 'henan',
  '庐山': 'lushan',
  '井冈山': 'jinggangshan',
  '南宁': 'nanning',
  '绍兴': 'shaoxing',
  '故宫': 'beijing',
  '西子湖': 'hangzhou',
};

const LOCATION_KEYWORDS = Object.keys(LOCATION_MAP);

function extractLocation(description: string): string {
  for (const keyword of LOCATION_KEYWORDS) {
    if (description.includes(keyword)) {
      return LOCATION_MAP[keyword];
    }
  }
  return 'unknown';
}

function parseDate(dateStr: string): { year: string; month: string } {
  const yearMatch = dateStr.match(/(\d{4})年/);
  const year = yearMatch ? yearMatch[1] : '0000';
  
  const monthMatch = dateStr.match(/年(\d{1,2})月/);
  const month = monthMatch ? monthMatch[1].padStart(2, '0') : '00';
  
  return { year, month };
}

function generateFileName(node: TimelineNode, imageIndex: number, existingNames: Set<string>): string {
  const { year, month } = parseDate(node.date);
  const location = extractLocation(node.description);
  
  let baseName = `${year}-${month}-${location}`;
  let counter = imageIndex + 1;
  let fileName = `${baseName}-${counter.toString().padStart(2, '0')}.jpg`;
  
  while (existingNames.has(fileName)) {
    counter++;
    fileName = `${baseName}-${counter.toString().padStart(2, '0')}.jpg`;
  }
  
  existingNames.add(fileName);
  return fileName;
}

async function main() {
  const dataPath = path.join(__dirname, '../mao-memorial-data/data/timeline_data.json');
  const imagesSrcDir = path.join(__dirname, '../mao-memorial-data/images');
  const imagesDestDir = path.join(__dirname, '../public/timeline');
  
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ 数据文件不存在: ${dataPath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(imagesSrcDir)) {
    console.error(`❌ 图片源目录不存在: ${imagesSrcDir}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(imagesDestDir)) {
    fs.mkdirSync(imagesDestDir, { recursive: true });
    console.log(`✅ 创建目标目录: ${imagesDestDir}`);
  }
  
  const data: TimelineData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`📊 共读取到 ${data.nodes.length} 个时间线节点`);
  
  const existingNames = new Set<string>();
  let copiedCount = 0;
  const nameMap: Record<string, string> = {};
  
  for (const node of data.nodes) {
    for (let i = 0; i < node.images.length; i++) {
      const image = node.images[i];
      const srcPath = path.join(imagesSrcDir, image.filename);
      
      if (!fs.existsSync(srcPath)) {
        console.warn(`⚠️ 源文件不存在，跳过: ${image.filename}`);
        continue;
      }
      
      const newFileName = generateFileName(node, i, existingNames);
      const destPath = path.join(imagesDestDir, newFileName);
      
      fs.copyFileSync(srcPath, destPath);
      nameMap[image.filename] = newFileName;
      copiedCount++;
      
      if (copiedCount % 10 === 0) {
        console.log(`📦 已复制 ${copiedCount} 张图片`);
      }
    }
  }
  
  const mappingFilePath = path.join(__dirname, '../scripts/image-name-map.json');
  fs.writeFileSync(mappingFilePath, JSON.stringify(nameMap, null, 2), 'utf-8');
  console.log(`✅ 生成文件名映射表: ${mappingFilePath}`);
  
  console.log(`\n🎉 图片复制完成！共复制 ${copiedCount} 张图片到 ${imagesDestDir}`);
  
  const destFiles = fs.readdirSync(imagesDestDir);
  console.log(`📁 目标目录文件数: ${destFiles.length}`);
}

main().catch((err) => {
  console.error('❌ 执行失败:', err);
  process.exit(1);
});