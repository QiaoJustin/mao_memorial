import { prisma } from '@/lib/db';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const staticRoutes = [
    { url: '/', lastModified: new Date(), priority: 1.0 },
    { url: '/timeline', lastModified: new Date(), priority: 0.9 },
    { url: '/photos', lastModified: new Date(), priority: 0.8 },
    { url: '/messages', lastModified: new Date(), priority: 0.7 },
    { url: '/search', lastModified: new Date(), priority: 0.6 },
  ];

  const nodes = await prisma.timelineNode.findMany({
    select: { id: true, updatedAt: true },
    where: { isPublished: true },
  });

  const nodeRoutes = nodes.map((node) => ({
    url: `/timeline/${node.id}`,
    lastModified: node.updatedAt,
    priority: 0.85,
  }));

  const photos = await prisma.photo.findMany({
    select: { id: true, updatedAt: true },
  });

  const photoRoutes = photos.map((photo) => ({
    url: `/photos/${photo.id}`,
    lastModified: photo.updatedAt,
    priority: 0.75,
  }));

  return [...staticRoutes, ...nodeRoutes, ...photoRoutes].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: route.lastModified,
    priority: route.priority,
  }));
}