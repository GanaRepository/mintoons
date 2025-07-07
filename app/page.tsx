import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Home - Where Young Writers Create Amazing Stories',
  description: 'Join Mintoons, the AI-powered collaborative story writing platform where children ages 2-18 develop creativity through interactive writing with AI assistance and teacher mentorship.',
  keywords: [
    'story writing for kids',
    'creative writing platform',
    'AI story assistant',
    'children education',
    'collaborative writing',
    'story creation',
    'creative learning',
  ],
  openGraph: {
    title: 'Mintoons - Where Young Writers Create Amazing Stories',
    description: 'Discover the magic of collaborative story writing with AI assistance',
    images: ['/og-images/og-home.jpg'],
    url: '/',
  },
  twitter: {
    title: 'Mintoons - Creative Writing Platform for Kids',
    description: 'Where young writers create amazing stories with AI collaboration',
    images: ['/og-images/twitter-home.jpg'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return <HomeClient />;
}