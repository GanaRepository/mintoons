import { Metadata } from 'next';
import MentorDashboardClient from './MentorDashboardClient';

export const metadata: Metadata = {
  title: 'Mentor Dashboard | Mintoons',
  description: 'Guide and support young writers on their creative journey.',
  keywords: ['mentor', 'teaching', 'writing guidance', 'student stories', 'feedback'],
};

export default function MentorDashboardPage() {
  return <MentorDashboardClient />;
}