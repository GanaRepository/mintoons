import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: {
    default: 'Mintoons - AI-Powered Story Writing Platform for Children',
    template: '%s | Mintoons',
  },
  description:
    'Unleash your creative magic with Mintoons! A collaborative AI-powered platform where children ages 2-18 create amazing stories with AI assistance and teacher mentorship.',
  keywords: [
    'creative writing',
    'children stories',
    'AI collaboration',
    'education',
    'story writing',
    'kids creativity',
    'teacher mentorship',
    'collaborative writing',
    'AI-powered education',
    'story creation',
  ],
  authors: [{ name: 'Mintoons Team' }],
  creator: 'Mintoons Platform',
  publisher: 'Mintoons',
  applicationName: 'Mintoons',
  category: 'Education',
  classification: 'Educational Platform',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://mintoons.com',
    siteName: 'Mintoons',
    title: 'Mintoons - Where Young Writers Create Amazing Stories',
    description:
      'AI-powered collaborative story writing platform for children ages 2-18. Develop creativity through interactive writing with AI assistance and teacher mentorship.',
    images: [
      {
        url: '/og-images/og-main.jpg',
        width: 1200,
        height: 630,
        alt: 'Mintoons - Creative Writing Platform for Children',
      },
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    site: '@mintoons',
    creator: '@mintoons',
    title: 'Mintoons - AI-Powered Story Writing for Kids',
    description:
      'Where young writers create amazing stories with AI collaboration and teacher guidance.',
    images: ['/og-images/twitter-main.jpg'],
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#22c55e' },
    ],
  },

  // Manifest
  manifest: '/site.webmanifest',

  // Robot indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },

  // Additional metadata
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Mintoons',
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#22c55e',
    'theme-color': '#22c55e',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#22c55e' },
    { media: '(prefers-color-scheme: dark)', color: '#15803d' },
  ],
  colorScheme: 'light dark',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/poppins-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//api.openai.com" />
        <link rel="dns-prefetch" href="//api.anthropic.com" />
        <link rel="dns-prefetch" href="//js.stripe.com" />

        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'Mintoons',
              description:
                'AI-powered collaborative story writing platform for children',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://mintoons.com',
              logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mintoons.com'}/logos/mintoons-logo.png`,
              sameAs: [
                'https://twitter.com/mintoons',
                'https://facebook.com/mintoons',
                'https://instagram.com/mintoons',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-555-MINTOONS',
                contactType: 'customer service',
                email: 'hello@mintoons.com',
              },
              areaServed: 'Worldwide',
              audience: {
                '@type': 'EducationalAudience',
                educationalRole: 'student',
                audienceType: 'children',
              },
            }),
          }}
        />
      </head>
      <body
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning
      >
        <Providers>
          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
          >
            Skip to main content
          </a>

          {/* Main content */}
          <main id="main-content" className="relative">
            <Header />
            {children}
            <Footer />
          </main>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(17, 24, 39, 0.95)',
                color: '#ffffff',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
              },
              success: {
                style: {
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                },
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ffffff',
                },
              },
              error: {
                style: {
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Providers>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }).catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
