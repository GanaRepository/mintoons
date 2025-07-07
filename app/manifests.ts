import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mintoons - AI-Powered Story Writing Platform',
    short_name: 'Mintoons',
    description: 'Where young writers create amazing stories with AI collaboration and teacher mentorship',
    start_url: '/',
    display: 'standalone',
    background_color: '#111827',
    theme_color: '#22c55e',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    dir: 'ltr',
    
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    
    screenshots: [
      {
        src: '/screenshots/desktop-home.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Mintoons home page on desktop',
      },
      {
        src: '/screenshots/mobile-create.png',
        sizes: '360x640',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Story creation on mobile',
      },
    ],
    
    categories: ['education', 'kids', 'creativity', 'writing'],
    
    shortcuts: [
      {
        name: 'Create Story',
        short_name: 'Create',
        description: 'Start writing a new story',
        url: '/create-stories',
        icons: [
          {
            src: '/icons/create-story-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'My Stories',
        short_name: 'Stories',
        description: 'View my published stories',
        url: '/my-stories',
        icons: [
          {
            src: '/icons/my-stories-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Progress',
        short_name: 'Progress',
        description: 'Check writing progress',
        url: '/progress',
        icons: [
          {
            src: '/icons/progress-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
    ],
    
    related_applications: [],
    prefer_related_applications: false,
    
    // PWA features
    display_override: ['window-controls-overlay', 'standalone'],
    
    // Edge-specific
    edge_side_panel: {
      preferred_width: 400,
    },
    
    // Protocol handlers (future)
    protocol_handlers: [
      {
        protocol: 'web+mintoons',
        url: '/story/%s',
      },
    ],
  };
}