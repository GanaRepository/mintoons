'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push(redirectTo);
      return;
    }

    // Check if user role is allowed
    if (allowedRoles.length > 0 && session.user?.role) {
      if (!allowedRoles.includes(session.user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [session, status, router, allowedRoles, redirectTo]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or not authorized
  if (!session) {
    return null;
  }

  if (allowedRoles.length > 0 && session.user?.role) {
    if (!allowedRoles.includes(session.user.role)) {
      return null;
    }
  }

  return <>{children}</>;
}