import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { redirect } from 'next/navigation';
import MyStoriesClient from './MyStoriesClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Stories | Mintoons - Your Creative Collection',
  description: 'View and manage all your creative stories. Track your writing progress and see your improvement over time.',
  keywords: 'my stories, writing collection, story management, creative writing',
};

export default async function MyStoriesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  if (session.user?.role !== 'child' && session.user?.role !== 'admin') {
    redirect('/unauthorized');
  }

  return <MyStoriesClient />;
}