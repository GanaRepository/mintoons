'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  BookOpen,
  PlusCircle,
  BarChart3,
  Award,
  Bell,
  ChevronDown,
  Crown,
  Sparkles,
  Home,
  Users,
  Shield,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { useToast } from '@/app/components/ui/toast';

interface NotificationData {
  id: string;
  type: 'comment' | 'achievement' | 'story' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  useEffect(() => {
    // Close menus when route changes
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
      showToast({
        variant: 'success',
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      showToast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to log out. Please try again.',
      });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you'd persist this preference
    document.documentElement.classList.toggle('dark');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
      current: pathname === '/',
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      current: pathname === '/dashboard',
      requireAuth: true,
    },
    {
      name: 'Create Story',
      href: '/create-stories',
      icon: PlusCircle,
      current: pathname === '/create-stories',
      requireAuth: true,
      highlight: true,
    },
    {
      name: 'My Stories',
      href: '/my-stories',
      icon: BookOpen,
      current: pathname === '/my-stories',
      requireAuth: true,
    },
    {
      name: 'Progress',
      href: '/progress',
      icon: Award,
      current: pathname === '/progress',
      requireAuth: true,
    },
  ];

  const adminNavigation = [
    {
      name: 'Admin Dashboard',
      href: '/admin',
      icon: Shield,
      current: pathname === '/admin',
    },
    {
      name: 'Mentor Dashboard',
      href: '/mentor-dashboard',
      icon: Users,
      current: pathname === '/mentor-dashboard',
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'comment': return '💬';
      case 'story': return '📖';
      case 'reminder': return '⏰';
      default: return '📢';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Crown className="w-2.5 h-2.5 text-yellow-800" />
                </div>
              </motion.div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Mintoons
                </div>
                <div className="text-xs text-gray-500 -mt-1">AI Story Platform</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              if (item.requireAuth && !session) return null;
              
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${item.highlight ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}

            {/* Admin/Mentor Links */}
            {session?.user?.role === 'admin' && (
              <>
                {adminNavigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.current
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </motion.div>
                  </Link>
                ))}
              </>
            )}

            {session?.user?.role === 'mentor' && (
              <Link href="/mentor-dashboard">
                <motion.div
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/mentor-dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Users className="w-4 h-4" />
                  <span>Mentor Dashboard</span>
                </motion.div>
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {session ? (
              <>
                {/* Dark Mode Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="hidden sm:flex"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                {/* Notifications */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-red-500 text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <Badge variant="secondary">{unreadCount} new</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.slice(0, 5).map((notification) => (
                              <motion.div
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                  !notification.read ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => {
                                  markNotificationAsRead(notification.id);
                                  if (notification.actionUrl) {
                                    router.push(notification.actionUrl);
                                  }
                                }}
                                whileHover={{ backgroundColor: '#f9fafb' }}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {notification.title}
                                      </p>
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(notification.timestamp).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-gray-500">
                              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p>No notifications yet</p>
                            </div>
                          )}
                        </div>

                        {notifications.length > 5 && (
                          <div className="p-3 text-center border-t border-gray-200">
                            <Button variant="ghost" size="sm" className="text-purple-600">
                              View All Notifications
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      {session.user?.name ? (
                        <span className="text-white text-sm font-medium">
                          {session.user.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {session.user?.name || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                              {session.user?.name ? (
                                <span className="text-white text-lg font-medium">
                                  {session.user.name.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <User className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {session.user?.name || 'User'}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {session.user?.email}
                              </p>
                              <Badge variant="secondary" className="mt-1 text-xs capitalize">
                                {session.user?.role}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link href="/profile">
                            <motion.div
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              whileHover={{ backgroundColor: '#f3f4f6' }}
                            >
                              <User className="w-4 h-4" />
                              <span>Profile Settings</span>
                            </motion.div>
                          </Link>
                          
                          <Link href="/help">
                            <motion.div
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              whileHover={{ backgroundColor: '#f3f4f6' }}
                            >
                              <HelpCircle className="w-4 h-4" />
                              <span>Help & Support</span>
                            </motion.div>
                          </Link>

                          <div className="border-t border-gray-200 my-2"></div>

                          <motion.button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            whileHover={{ backgroundColor: '#fef2f2' }}
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Guest Actions */
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-200"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="py-4 space-y-2">
                {navigation.map((item) => {
                  if (item.requireAuth && !session) return null;
                  
                  return (
                    <Link key={item.name} href={item.href}>
                      <motion.div
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          item.current
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        } ${item.highlight ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : ''}`}
                        whileHover={{ backgroundColor: item.highlight ? undefined : '#f3f4f6' }}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </motion.div>
                    </Link>
                  );
                })}

                {/* Mobile Dark Mode Toggle */}
                <motion.button
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full text-left"
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </motion.button>

                {!session && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <Link href="/login" className="block">
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/register" className="block">
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}