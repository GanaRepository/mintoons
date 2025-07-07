'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Calendar, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { showToast } from '@/app/components/ui/toast';
import { registerSchema } from '@/lib/validations';

export default function RegisterClient() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    parentEmail: '',
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const needsParentalConsent = parseInt(formData.age) < 13;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Calculate password strength
    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (stepNumber === 2) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (stepNumber === 3) {
      if (!formData.age) newErrors.age = 'Age is required';
      else {
        const age = parseInt(formData.age);
        if (age < 2 || age > 18) newErrors.age = 'Age must be between 2 and 18';
      }
      if (needsParentalConsent && !formData.parentEmail.trim()) {
        newErrors.parentEmail = 'Parent email is required for users under 13';
      }
      if (!formData.agreedToTerms) {
        newErrors.agreedToTerms = 'You must agree to the terms of service';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      // Validate with Zod schema
      const validation = registerSchema.safeParse({
        ...formData,
        age: parseInt(formData.age),
      });

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      // Submit registration
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.message || 'Registration failed' });
        }
        showToast.error('Registration Failed', result.message || 'Please try again');
      } else {
        showToast.success(
          'Account Created! 🎉',
          needsParentalConsent 
            ? 'Please check your parent\'s email for verification'
            : 'Welcome to Mintoons! You can now sign in.'
        );
        router.push('/login?message=registered');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      showToast.error('Registration Error', 'Something went wrong. Please try again.');
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

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Mintoons! ✨
          </h1>
          <p className="text-gray-600">
            Start your creative writing journey today
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div className="mb-6" variants={itemVariants}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressPercentage)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Registration Form */}
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

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Tell us about yourself
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Let's start with your basic information
                  </p>
                </div>

                <Input
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  leftIcon={<User className="h-4 w-4" />}
                  disabled={isLoading}
                  autoComplete="name"
                  required
                />

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
              </motion.div>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Create a secure password
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Choose a strong password to protect your account
                  </p>
                </div>

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
                    autoComplete="new-password"
                    required
                  />
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Password strength:</span>
                        <span className={`text-xs font-medium ${
                          passwordStrength >= 75 ? 'text-green-600' :
                          passwordStrength >= 50 ? 'text-yellow-600' :
                          passwordStrength >= 25 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  type="password"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="h-4 w-4" />}
                  showPasswordToggle
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
              </motion.div>
            )}

            {/* Step 3: Age and Consent */}
            {step === 3 && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Almost there!
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Just a few more details to complete your registration
                  </p>
                </div>

                <Input
                  type="number"
                  label="Age"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  error={errors.age}
                  leftIcon={<Calendar className="h-4 w-4" />}
                  disabled={isLoading}
                  min="2"
                  max="18"
                  required
                />

                {needsParentalConsent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center text-blue-700">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium">Parental consent required</p>
                          <p>Since you're under 13, we need a parent's email for verification.</p>
                        </div>
                      </div>
                    </div>

                    <Input
                      type="email"
                      label="Parent's Email Address"
                      placeholder="Enter your parent's email"
                      value={formData.parentEmail}
                      onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                      error={errors.parentEmail}
                      leftIcon={<Mail className="h-4 w-4" />}
                      disabled={isLoading}
                      required={needsParentalConsent}
                    />
                  </motion.div>
                )}

                {/* Terms Agreement */}
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={isLoading}
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreedToTerms && (
                    <p className="text-sm text-red-600">{errors.agreedToTerms}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading}
                >
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <Button
                  type="button"
                  variant="gradient"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="gradient"
                  loading={isLoading}
                  disabled={isLoading}
                  rightIcon={<CheckCircle className="h-4 w-4" />}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <div className="text-center">
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full">
                Sign In Instead
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8"
          variants={itemVariants}
        >
          <p className="text-xs text-gray-500">
            By creating an account, you're joining a safe and creative community
            designed specifically for young writers.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}