import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { redirect } from 'next/navigation';
import ProgressClient from './ProgressClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Progress | Mintoons - Track Your Writing Journey',
  description: 'Monitor your writing progress, view achievements, and see how your creative skills are developing over time.',
  keywords: 'writing progress, achievements, analytics, skill development, creative writing',
};

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  if (session.user?.role !== 'child' && session.user?.role !== 'admin') {
    redirect('/unauthorized');
  }

  return <ProgressClient />;
}