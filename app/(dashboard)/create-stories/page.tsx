import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { redirect } from 'next/navigation';
import CreateStoriesClient from './CreateStoriesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  
  const userName = session?.user?.name || 'Writer';
  
  return {
    title: 'Create Stories | Mintoons - AI-Powered Story Writing Platform',
    description: 'Start your creative writing journey! Choose story elements, collaborate with AI, and create amazing stories with guidance from our intelligent assistant.',
    keywords: 'create stories, story writing, AI collaboration, creative writing, children stories, story elements, AI assistance, interactive writing',
    robots: {
      index: false, // Private creation page
      follow: false,
    },
    openGraph: {
      title: 'Create Amazing Stories with AI - Mintoons',
      description: 'Collaborative story writing platform where children work WITH AI to create incredible stories.',
      type: 'website',
      url: 'https://mintoons.com/create-stories',
      images: [
        {
          url: '/images/og-create-stories.jpg',
          width: 1200,
          height: 630,
          alt: 'Create Stories with AI - Mintoons Platform',
        },
      ],
      siteName: 'Mintoons',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Create Amazing Stories with AI',
      description: 'Collaborative story writing platform for creative minds.',
      images: ['/images/twitter-create-stories.jpg'],
      creator: '@mintoons',
    },
    other: {
      'apple-mobile-web-app-title': 'Create Stories',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
    },
  };
}

export default async function CreateStoriesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login?callbackUrl=/create-stories');
  }

  return <CreateStoriesClient />;
}