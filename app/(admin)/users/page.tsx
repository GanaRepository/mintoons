import { Metadata } from 'next';
import UserManagementClient from './UserManagementClient';

export const metadata: Metadata = {
  title: 'User Management | Mintoons Admin',
  description: 'Manage platform users, roles, and permissions.',
  keywords: ['user management', 'admin', 'roles', 'permissions', 'user accounts'],
};

export default function AdminUsersPage() {
  return <UserManagementClient />;
}