import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StoryViewClient from './StoryViewClient';

interface StoryPageProps {
  params: {
    id: string;
  };
}

// Generate metadata for the story page
export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  try {
    // In a real app, you'd fetch the story data here
    // For now, we'll use a default title
    return {
      title: `Story | Mintoons`,
      description: 'Read and enjoy this creative story on Mintoons.',
      keywords: ['story', 'reading', 'creative writing', 'children stories'],
      openGraph: {
        title: `Story | Mintoons`,
        description: 'Read and enjoy this creative story on Mintoons.',
        type: 'article',
        url: `https://mintoons.com/story/${params.id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `Story | Mintoons`,
        description: 'Read and enjoy this creative story on Mintoons.',
      }
    };
  } catch (error) {
    return {
      title: 'Story Not Found | Mintoons',
      description: 'The story you are looking for could not be found.',
    };
  }
}

export default function StoryPage({ params }: StoryPageProps) {
  // Validate the story ID format (optional)
  if (!params.id || params.id.length < 3) {
    notFound();
  }

  return <StoryViewClient storyId={params.id} />;
}