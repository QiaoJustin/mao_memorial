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
  
  const node20 = await prisma.timelineNode.findUnique({
    where: { id: 20 },
    include: { era: { select: { id: true, name: true } }, photos: { take: 1 } },
  });
  
  console.log('\nNode ID 20:');
  console.log('  exists:', !!node20);
  console.log('  id:', node20?.id);
  console.log('  date:', node20?.date);
  console.log('  title:', node20?.title);
  console.log('  isDeleted:', node20?.isDeleted);
  console.log('  isPublished:', node20?.isPublished);
  console.log('  era:', node20?.era);
  console.log('  photos:', node20?.photos?.length);
  
  const ids = await prisma.timelineNode.findMany({
    select: { id: true, isPublished: true },
    orderBy: { id: 'asc' },
  });
  
  console.log('\nAll Node IDs (published):');
  ids.forEach(n => {
    if (n.isPublished) {
      console.log(`  ${n.id}`);
    }
  });
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});