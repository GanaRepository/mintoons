import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/utils/authOptions';
import Header from '@/components/layout/Header';
import MentorSidebar from '@/components/layout/MentorSidebar';

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Only allow mentors, teachers, and admins
  if (!['mentor', 'teacher', 'admin'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <MentorSidebar userRole={session.user.role} />
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}