import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.timelineNode.count();
  const deleted = await prisma.timelineNode.count({ where: { isDeleted: true } });
  const notDeleted = await prisma.timelineNode.count({ where: { isDeleted: false } });
  const published = await prisma.timelineNode.count({ where: { isPublished: true } });
  
  console.log('Database Statistics:');
  console.log('  Total:', total);
  console.log('  isDeleted = true:', deleted);
  console.log('  isDeleted = false:', notDeleted);
  console.log('  isPublished = true:', published);
  
  const firstNode = await prisma.timelineNode.findFirst({
    include: { era: { select: { id: true, name: true } }, photos: { take: 1 } },
  });
  
  console.log('\nFirst Node:');
  console.log('  id:', firstNode?.id);
  console.log('  date:', firstNode?.date);
  console.log('  title:', firstNode?.title);
  console.log('  isDeleted:', firstNode?.isDeleted);
  console.log('  isPublished:', firstNode?.isPublished);
  console.log('  era:', firstNode?.era);
  console.log('  photos:', firstNode?.photos?.length);
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});