import { Metadata } from 'next';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Mintoons',
  description: 'Platform administration and analytics overview.',
  keywords: ['admin', 'dashboard', 'analytics', 'platform management', 'user statistics'],
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}