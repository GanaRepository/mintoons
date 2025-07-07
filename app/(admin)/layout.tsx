import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated or not admin
  if (!session || session.user.role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>

          <nav className="mt-6">
            <div className="px-6 space-y-1">
              <a
                href="/admin/dashboard"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                📊 Dashboard
              </a>
              <a
                href="/admin/users"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                👥 Users
              </a>
              <a
                href="/admin/content-moderation"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                🛡️ Content Moderation
              </a>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
