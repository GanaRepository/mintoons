import { Metadata } from 'next';
import StudentStoriesClient from './StudentStoriesClient';

export const metadata: Metadata = {
  title: 'Student Stories | Mintoons',
  description: 'Review and provide feedback on student creative writing submissions.',
  keywords: ['student stories', 'mentor review', 'feedback', 'writing assessment'],
};

export default function StudentStoriesPage() {
  return <StudentStoriesClient />;
}