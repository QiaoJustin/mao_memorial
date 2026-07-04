import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

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

function parseDate(dateStr: string): { year: number; dateSort: Date } {
  const yearMatch = dateStr.match(/(\d{4})年/);
  const year = yearMatch ? parseInt(yearMatch[1]) : 1900;
  
  const monthMatch = dateStr.match(/年(\d{1,2})月/);
  const month = monthMatch ? parseInt(monthMatch[1]) - 1 : 0;
  
  const dayMatch = dateStr.match(/月(\d{1,2})日/);
  const day = dayMatch ? parseInt(dayMatch[1]) : 1;
  
  const dateSort = new Date(year, month, day);
  
  return { year, dateSort };
}

function generateTitle(description: string): string {
  const maxLength = 80;
  if (description.length <= maxLength) {
    return description;
  }
  return description.substring(0, maxLength) + '...';
}

async function main() {
  console.log('开始导入时间线数据...');
  
  const dataPath = path.join(__dirname, '../mao-memorial-data/data/timeline_data.json');
  const nameMapPath = path.join(__dirname, '../scripts/image-name-map.json');
  
  const data: TimelineData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const nameMap: Record<string, string> = JSON.parse(fs.readFileSync(nameMapPath, 'utf-8'));
  
  console.log(`共 ${data.nodes.length} 个时间线节点`);
  
  for (let i = 0; i < data.nodes.length; i++) {
    const node = data.nodes[i];
    const { year, dateSort } = parseDate(node.date);
    const title = generateTitle(node.description);
    
    try {
      const timelineNode = await prisma.timelineNode.create({
        data: {
          date: node.date,
          dateSort: dateSort,
          year: year,
          eraId: node.era,
          title: title,
          description: node.description,
          thumbnailUrl: `/timeline/${nameMap[node.images[0].filename]}`,
          photoCount: node.images.length,
          sortOrder: node.sort_order,
          isPublished: true,
          isFeatured: false,
        },
      });
      
      for (let j = 0; j < node.images.length; j++) {
        const image = node.images[j];
        const newFileName = nameMap[image.filename];
        
        await prisma.photo.create({
          data: {
            nodeId: timelineNode.id,
            url: `/timeline/${newFileName}`,
            thumbnailUrl: `/timeline/${newFileName}`,
            caption: node.description,
            isCover: j === 0,
            sortOrder: j,
          },
        });
      }
      
      if ((i + 1) % 10 === 0) {
        console.log(`✓ 已导入 ${i + 1} 个节点`);
      }
    } catch (error) {
      console.error(`✗ 导入节点 "${node.date}" 失败:`, error);
    }
  }
  
  await prisma.$disconnect();
  console.log('\n✅ 时间线数据导入完成！');
}

main().catch((e) => {
  console.error('❌ 时间线数据导入失败:', e);
  process.exit(1);
});