import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Sign In | Mintoons - AI-Powered Story Writing Platform',
  description: 'Sign in to your Mintoons account and continue your creative writing journey with AI assistance and teacher mentorship.',
  keywords: 'login, sign in, creative writing, children stories, AI collaboration, education, storytelling',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Sign In to Mintoons',
    description: 'Access your creative writing dashboard and continue crafting amazing stories with AI assistance.',
    type: 'website',
    url: 'https://mintoons.com/login',
    images: [
      {
        url: '/images/og-login.jpg',
        width: 1200,
        height: 630,
        alt: 'Mintoons Login - AI-Powered Story Writing',
      },
    ],
    siteName: 'Mintoons',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign In to Mintoons',
    description: 'Access your creative writing dashboard and continue crafting amazing stories.',
    images: ['/images/twitter-login.jpg'],
    creator: '@mintoons',
  },
  alternates: {
    canonical: 'https://mintoons.com/login',
  },
  other: {
    'apple-mobile-web-app-title': 'Mintoons Login',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export default async function LoginPage() {
  // Redirect if already authenticated
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  }

  return <LoginClient />;
}