import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mintoons.com';
  const currentDate = new Date();

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/explore-stories`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // TODO: Add dynamic pages when implemented
  // const dynamicPages = await getDynamicPages();

  return staticPages;
}

// Future implementation for dynamic pages
// async function getDynamicPages() {
//   try {
//     // Fetch public stories for sitemap
//     const publicStories = await getPublicStories();
//     
//     return publicStories.map((story: any) => ({
//       url: `${baseUrl}/stories/${story.id}`,
//       lastModified: new Date(story.updatedAt),
//       changeFrequency: 'weekly' as const,
//       priority: 0.7,
//     }));
//   } catch (error) {
//     console.error('Error generating dynamic sitemap pages:', error);
//     return [];
//   }
// }