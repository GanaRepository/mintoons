import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  
  const userName = session?.user?.name || 'Writer';
  
  return {
    title: `${userName}'s Dashboard | Mintoons - Track Your Writing Progress`,
    description: `Welcome back, ${userName}! Track your writing progress, view your stories, check achievements, and continue your creative writing journey with AI assistance.`,
    keywords: 'dashboard, writing progress, story management, achievements, creative writing, AI assistance, user dashboard',
    robots: {
      index: false, // Private dashboard
      follow: false,
    },
    openGraph: {
      title: `${userName}'s Writing Dashboard - Mintoons`,
      description: 'Track your creative writing progress and manage your stories with AI assistance.',
      type: 'website',
      url: 'https://mintoons.com/dashboard',
      images: [
        {
          url: '/images/og-dashboard.jpg',
          width: 1200,
          height: 630,
          alt: 'Mintoons Dashboard - Creative Writing Progress',
        },
      ],
      siteName: 'Mintoons',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${userName}'s Writing Dashboard`,
      description: 'Track your creative writing progress and achievements.',
      images: ['/images/twitter-dashboard.jpg'],
    },
    other: {
      'apple-mobile-web-app-title': 'Mintoons Dashboard',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
    },
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return <DashboardClient />;
}