import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking remote database connection...');
  
  try {
    const total = await prisma.timelineNode.count();
    const notDeleted = await prisma.timelineNode.count({ where: { isDeleted: false } });
    
    console.log('Remote Database Statistics:');
    console.log('  Total timeline_nodes:', total);
    console.log('  isDeleted = false:', notDeleted);
    
    const firstNode = await prisma.timelineNode.findFirst({
      where: { isDeleted: false },
      include: { era: { select: { id: true, name: true } }, photos: { take: 1 } },
    });
    
    console.log('\nFirst Node (isDeleted=false):');
    if (firstNode) {
      console.log('  id:', firstNode.id);
      console.log('  date:', firstNode.date);
      console.log('  title:', firstNode.title);
      console.log('  isDeleted:', firstNode.isDeleted);
      console.log('  isPublished:', firstNode.isPublished);
      console.log('  era:', firstNode.era);
      console.log('  photos:', firstNode.photos?.length);
    } else {
      console.log('  No node found with isDeleted=false');
    }
    
    await prisma.$disconnect();
  } catch (e) {
    console.error('Database error:', e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();