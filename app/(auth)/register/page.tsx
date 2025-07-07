import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
  title: 'Create Account | Mintoons - Start Your Creative Writing Journey',
  description: 'Join Mintoons and start your creative writing adventure! Create amazing stories with AI assistance, get feedback from teachers, and track your progress.',
  keywords: 'register, sign up, create account, creative writing, children stories, AI collaboration, education, storytelling, writing platform',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Join Mintoons - AI-Powered Story Writing Platform',
    description: 'Create your account and start writing amazing stories with AI assistance and teacher mentorship.',
    type: 'website',
    url: 'https://mintoons.com/register',
    images: [
      {
        url: '/images/og-register.jpg',
        width: 1200,
        height: 630,
        alt: 'Join Mintoons - Start Your Creative Writing Journey',
      },
    ],
    siteName: 'Mintoons',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join Mintoons - AI-Powered Story Writing',
    description: 'Create your account and start writing amazing stories with AI assistance.',
    images: ['/images/twitter-register.jpg'],
    creator: '@mintoons',
  },
  alternates: {
    canonical: 'https://mintoons.com/register',
  },
  other: {
    'apple-mobile-web-app-title': 'Join Mintoons',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export default async function RegisterPage() {
  // Redirect if already authenticated
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  }

  return <RegisterClient />;
}