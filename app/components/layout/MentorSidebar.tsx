'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  User,
  Award,
  Calendar,
  FileText,
  TrendingUp,
  Shield,
} from 'lucide-react';

export default function MentorSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/mentor/mentor-dashboard',
      icon: LayoutDashboard,
      description: 'Overview and quick actions',
    },
    {
      name: 'Student Stories',
      href: '/mentor/student-stories',
      icon: BookOpen,
      description: 'Review and provide feedback',
    },
    {
      name: 'My Students',
      href: '/mentor/students',
      icon: Users,
      description: 'Manage student relationships',
    },
    {
      name: 'Feedback History',
      href: '/mentor/feedback',
      icon: MessageCircle,
      description: 'View past feedback given',
    },
    {
      name: 'Progress Reports',
      href: '/mentor/reports',
      icon: TrendingUp,
      description: 'Student progress analytics',
    },
    {
      name: 'Mentoring Resources',
      href: '/mentor/resources',
      icon: FileText,
      description: 'Teaching guides and tools',
    },
    {
      name: 'Schedule',
      href: '/mentor/schedule',
      icon: Calendar,
      description: 'Manage mentoring sessions',
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mintoons</h1>
              <p className="text-xs text-purple-600 font-medium">
                Mentor Panel
              </p>
            </div>
          )}
        </div>

        {/* Desktop collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-4 h-4 text-gray-500" />
        </button>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'Mentor'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-purple-600" />
            )}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || 'Mentor'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email}
              </p>
              <div className="flex items-center mt-1">
                <Award className="w-3 h-3 text-purple-500 mr-1" />
                <span className="text-xs text-purple-600 font-medium">
                  Mentor
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">12</div>
              <div className="text-xs text-gray-600">Students</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">34</div>
              <div className="text-xs text-gray-600">Reviews</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                active
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  active
                    ? 'text-purple-600'
                    : 'text-gray-500 group-hover:text-gray-700'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.description}
                  </div>
                </div>
              )}

              {!isCollapsed && active && (
                <div className="w-2 h-2 bg-purple-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                3
              </span>
            </button>

            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
              <Search className="w-4 h-4" />
              <span>Quick Search</span>
            </button>
          </div>
        </div>
      )}

      {/* Settings and Logout */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <Link
          href="/settings"
          className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <Settings className="w-5 h-5 text-gray-500" />
          {!isCollapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-md border"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-gray-200 transition-all duration-300 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } z-30`}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Spacer for desktop content */}
      <div
        className={`hidden lg:block transition-all duration-300 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        }`}
      />
    </>
  );
}
