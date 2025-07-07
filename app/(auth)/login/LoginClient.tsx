'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { showToast } from '@/app/components/ui/toast';
import { loginSchema } from '@/lib/validations';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form data
      const validation = loginSchema.safeParse(formData);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      // Attempt sign in
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: 'Invalid email or password' });
        showToast.error('Login Failed', 'Please check your credentials and try again');
      } else if (result?.ok) {
        showToast.success('Welcome back!', 'You have been logged in successfully');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      showToast.error('Login Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-gray-600">
            Sign in to continue your story adventure
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bg-white rounded-xl shadow-xl p-8 border border-gray-100"
          variants={itemVariants}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <motion.div
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{errors.general}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                leftIcon={<Mail className="h-4 w-4" />}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                leftIcon={<Lock className="h-4 w-4" />}
                showPasswordToggle
                disabled={isLoading}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to Mintoons?</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <Link href="/register">
              <Button variant="outline" size="lg" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Demo Accounts */}
          <motion.div
            className="mt-6 p-4 bg-gray-50 rounded-lg"
            variants={itemVariants}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Student:</span>
                <span>student@mintoons.com / password123</span>
              </div>
              <div className="flex justify-between">
                <span>Mentor:</span>
                <span>mentor@mintoons.com / password123</span>
              </div>
              <div className="flex justify-between">
                <span>Admin:</span>
                <span>admin@mintoons.com / password123</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          className="text-center mt-8 space-y-2"
          variants={itemVariants}
        >
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">
              Support
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            © 2024 Mintoons. Made with ❤️ for young writers.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}