import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import ResetPasswordClient from './ResetPasswordClient';

export const metadata: Metadata = {
  title: 'Reset Password | Mintoons - Create New Password',
  description: 'Reset your Mintoons password securely. Create a new password to access your account.',
  keywords: ['reset password', 'password recovery', 'account security', 'children writing'],
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Reset Password | Mintoons',
    description: 'Reset your Mintoons password securely',
    type: 'website',
    url: 'https://mintoons.com/reset-password',
  },
  twitter: {
    card: 'summary',
    title: 'Reset Password | Mintoons',
    description: 'Reset your Mintoons password securely',
  },
};

interface ResetPasswordPageProps {
  searchParams: { token?: string };
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  }

  const token = searchParams.token;

  if (!token) {
    redirect('/login?error=missing_token');
  }

  return <ResetPasswordClient token={token} />;
}