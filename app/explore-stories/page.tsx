import { Metadata } from 'next';
import ExploreStoriesClient from './ExploreStoriesClient';

export const metadata: Metadata = {
  title: 'Explore Stories | Mintoons - Discover Amazing Children\'s Stories',
  description: 'Explore creative stories written by children with AI collaboration. Get inspired and discover new storytelling ideas.',
  keywords: ['explore stories', 'children stories', 'creative writing', 'AI stories', 'inspiration'],
  openGraph: {
    title: 'Explore Stories | Mintoons',
    description: 'Discover amazing stories written by children with AI collaboration',
    type: 'website',
    url: 'https://mintoons.com/explore-stories',
    images: [
      {
        url: 'https://mintoons.com/images/og-explore.jpg',
        width: 1200,
        height: 630,
        alt: 'Explore Children Stories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Stories | Mintoons',
    description: 'Discover amazing stories written by children with AI collaboration',
    images: ['https://mintoons.com/images/og-explore.jpg'],
  },
};

export default function ExploreStoriesPage() {
  return <ExploreStoriesClient />;
}