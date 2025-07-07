'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { showToast } from '@/app/components/ui/toast';
import { forgotPasswordSchema } from '@/lib/validations';

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate email
      const validation = forgotPasswordSchema.safeParse({ email });
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      // Submit forgot password request
      const response = await fetch('/api/user/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.message || 'Failed to send reset email' });
        }
        showToast.error('Error', result.message || 'Failed to send reset email');
      } else {
        setIsSubmitted(true);
        showToast.success('Email Sent! 📧', 'Check your inbox for password reset instructions');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      showToast.error('Error', 'Something went wrong. Please try again.');
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl p-8 border border-gray-100"
            variants={itemVariants}
          >
            {/* Success Icon */}
            <motion.div
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>

            {/* Success Message */}
            <motion.div variants={itemVariants}>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Check Your Email! 📧
              </h1>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to{' '}
                <span className="font-medium text-gray-900">{email}</span>
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start text-blue-800">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">What to do next:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check your inbox (and spam folder)</li>
                      <li>Click the reset link in the email</li>
                      <li>Create a new secure password</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/login">
                  <Button variant="gradient" size="lg" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
                
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                    setErrors({});
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Try a different email address
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Resend Timer */}
          <motion.div
            className="mt-6 text-center"
            variants={itemVariants}
          >
            <p className="text-xs text-gray-500">
              Didn't receive an email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                try again
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password? 🔐
          </h1>
          <p className="text-gray-600">
            No worries! We'll send you reset instructions
          </p>
        </motion.div>

        {/* Reset Form */}
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

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start text-blue-800">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">How it works:</p>
                  <p>
                    Enter your email address and we'll send you a secure link to reset your password.
                    The link will expire in 1 hour for security.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                error={errors.email}
                leftIcon={<Mail className="h-4 w-4" />}
                disabled={isLoading}
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
              rightIcon={<Send className="h-4 w-4" />}
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Remember your password?</span>
            </div>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <Link href="/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Sign In
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          className="mt-8 text-center"
          variants={itemVariants}
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Need more help?
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              If you continue having trouble accessing your account, our support team is here to help.
            </p>
            <Link
              href="/contact"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Contact Support →
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-6"
          variants={itemVariants}
        >
          <p className="text-xs text-gray-500">
            Password reset links expire after 1 hour for your security
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}