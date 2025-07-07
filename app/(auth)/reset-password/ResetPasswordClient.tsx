'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  KeyRound
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ResetPasswordClientProps {
  token: string;
}

export default function ResetPasswordClient({ token }: ResetPasswordClientProps) {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const router = useRouter();

  const passwordRequirements = [
    { 
      label: 'At least 8 characters', 
      met: formData.password.length >= 8 
    },
    { 
      label: 'Contains uppercase letter', 
      met: /[A-Z]/.test(formData.password) 
    },
    { 
      label: 'Contains lowercase letter', 
      met: /[a-z]/.test(formData.password) 
    },
    { 
      label: 'Contains number', 
      met: /\d/.test(formData.password) 
    },
    { 
      label: 'Contains special character', 
      met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) 
    }
  ];

  const allRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!allRequirementsMet) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      if (response.ok) {
        toast.success('Password reset successfully!');
        router.push('/login?message=password_reset_success');
      } else {
        const data = await response.json();
        if (data.error === 'INVALID_TOKEN') {
          setTokenValid(false);
          toast.error('Password reset link has expired or is invalid');
        } else {
          toast.error(data.error || 'Password reset failed');
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Link Expired
            </h1>
            <p className="text-gray-600 mb-6">
              This password reset link has expired or is invalid. Please request a new one.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Back to Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create New Password
            </h1>
            <p className="text-gray-600">
              Enter a strong password to secure your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle 
                        className={`w-4 h-4 mr-2 ${
                          requirement.met ? 'text-green-500' : 'text-gray-300'
                        }`} 
                      />
                      <span className={requirement.met ? 'text-green-600' : 'text-gray-500'}>
                        {requirement.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formData.confirmPassword && !passwordsMatch 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-sm text-red-600 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}