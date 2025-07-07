'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  PenTool,
  BookOpen,
  TrendingUp,
  User,
  Settings,
  Crown,
  Users,
  BarChart3,
  Shield,
  FileText,
  Sparkles,
  Target
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string;
}

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const sidebarItems: SidebarItem[] = [
    // Child navigation
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['child', 'mentor', 'admin']
    },
    {
      name: 'Create Story',
      href: '/create-stories',
      icon: PenTool,
      roles: ['child', 'admin']
    },
    {
      name: 'My Stories',
      href: '/my-stories',
      icon: BookOpen,
      roles: ['child', 'admin']
    },
    {
      name: 'Progress',
      href: '/progress',
      icon: TrendingUp,
      roles: ['child', 'admin']
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['child', 'mentor', 'admin']
    },

    // Mentor navigation
    {
      name: 'Mentor Dashboard',
      href: '/mentor-dashboard',
      icon: Users,
      roles: ['mentor', 'admin']
    },
    {
      name: 'Student Stories',
      href: '/student-stories',
      icon: FileText,
      roles: ['mentor', 'admin']
    },

    // Admin navigation
    {
      name: 'Admin Dashboard',
      href: '/admin/dashboard',
      icon: Crown,
      roles: ['admin']
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      roles: ['admin']
    },
    {
      name: 'Content Moderation',
      href: '/admin/content-moderation',
      icon: Shield,
      roles: ['admin']
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      roles: ['admin']
    },

    // Common navigation
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['child', 'mentor', 'admin']
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const filteredItems = sidebarItems.filter(item => 
    item.roles.includes(session?.user?.role || '')
  );

  const getItemsForSection = (section: 'main' | 'mentor' | 'admin' | 'settings') => {
    switch (section) {
      case 'main':
        return filteredItems.filter(item => 
          ['Dashboard', 'Create Story', 'My Stories', 'Progress', 'Profile'].includes(item.name)
        );
      case 'mentor':
        return filteredItems.filter(item => 
          ['Mentor Dashboard', 'Student Stories'].includes(item.name)
        );
      case 'admin':
        return filteredItems.filter(item => 
          ['Admin Dashboard', 'User Management', 'Content Moderation', 'Analytics'].includes(item.name)
        );
      case 'settings':
        return filteredItems.filter(item => item.name === 'Settings');
      default:
        return [];
    }
  };

  const renderNavItems = (items: SidebarItem[]) => {
    return items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.href);

      return (
        <Link key={item.name} href={item.href}>
          <motion.div
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              active
                ? 'bg-purple-100 text-purple-700 shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon
              className={`mr-3 h-5 w-5 transition-colors ${
                active
                  ? 'text-purple-600'
                  : 'text-gray-400 group-hover:text-gray-600'
              }`}
            />
            <span className="truncate">{item.name}</span>
            {item.badge && (
              <span className="ml-auto inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </motion.div>
        </Link>
      );
    });
  };

  if (!session) {
    return null;
  }

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Mintoons</h2>
                <p className="text-xs text-gray-500 capitalize">
                  {session.user.role} Dashboard
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-6">
            {/* Main Navigation */}
            {getItemsForSection('main').length > 0 && (
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Main
                </h3>
                <div className="space-y-1">
                  {renderNavItems(getItemsForSection('main'))}
                </div>
              </div>
            )}

            {/* Mentor Navigation */}
            {getItemsForSection('mentor').length > 0 && (
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Mentoring
                </h3>
                <div className="space-y-1">
                  {renderNavItems(getItemsForSection('mentor'))}
                </div>
              </div>
            )}

            {/* Admin Navigation */}
            {getItemsForSection('admin').length > 0 && (
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Administration
                </h3>
                <div className="space-y-1">
                  {renderNavItems(getItemsForSection('admin'))}
                </div>
              </div>
            )}

            {/* Settings Navigation */}
            {getItemsForSection('settings').length > 0 && (
              <div>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Account
                </h3>
                <div className="space-y-1">
                  {renderNavItems(getItemsForSection('settings'))}
                </div>
              </div>
            )}
          </nav>

          {/* User Info Card */}
          <div className="flex-shrink-0 px-4 mt-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {session.user.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {session.user.role}
                  </p>
                </div>
              </div>
              
              {session.user.role === 'child' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Level Progress</span>
                    <span>Level 3</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full w-3/4"></div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">750 XP</span>
                    <span className="text-xs text-gray-500">1000 XP</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats for Children */}
          {session.user.role === 'child' && (
            <div className="flex-shrink-0 px-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-yellow-600" />
                    <span className="ml-2 text-xs font-medium text-yellow-800">
                      Stories
                    </span>
                  </div>
                  <p className="text-lg font-bold text-yellow-900 mt-1">12</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span className="ml-2 text-xs font-medium text-green-800">
                      Streak
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-900 mt-1">7 days</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}