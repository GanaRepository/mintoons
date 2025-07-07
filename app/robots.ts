import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mintoons.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/login',
          '/register',
          '/contact',
          '/about',
          '/privacy',
          '/terms',
          '/explore-stories',
          '/forgot-password',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/my-stories/',
          '/progress/',
          '/profile/',
          '/create-stories/',
          '/mentor-dashboard/',
          '/admin/',
          '/unauthorized',
          '/reset-password/',
          '/_next/',
          '/files/',
          '/export/',
          '/realtime/',
          '/email/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'Claude-Web',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
      {
        userAgent: 'Baiduspider',
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}