import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const nodeCount = await prisma.timelineNode.count();
  const photoCount = await prisma.photo.count();
  const eraCount = await prisma.era.count();
  
  console.log('Database Statistics:');
  console.log('  timeline_nodes:', nodeCount);
  console.log('  photos:', photoCount);
  console.log('  eras:', eraCount);
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});