'use client';

import { motion } from 'framer-motion';
import { Flame, Calendar, Target, TrendingUp } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  streakType: 'daily' | 'weekly';
  lastActivityDate?: string;
  streakActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export default function StreakCounter({
  currentStreak,
  longestStreak,
  streakType,
  lastActivityDate,
  streakActive,
  size = 'md',
  showDetails = true,
}: StreakCounterProps) {
  const isExpired = lastActivityDate && 
    new Date().getTime() - new Date(lastActivityDate).getTime() > 
    (streakType === 'daily' ? 2 * 24 * 60 * 60 * 1000 : 14 * 24 * 60 * 60 * 1000);

  const getStreakColor = () => {
    if (!streakActive || isExpired) return 'text-gray-400';
    if (currentStreak >= 30) return 'text-purple-500';
    if (currentStreak >= 14) return 'text-orange-500';
    if (currentStreak >= 7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStreakBgColor = () => {
    if (!streakActive || isExpired) return 'from-gray-100 to-gray-200';
    if (currentStreak >= 30) return 'from-purple-100 to-purple-200';
    if (currentStreak >= 14) return 'from-orange-100 to-orange-200';
    if (currentStreak >= 7) return 'from-yellow-100 to-yellow-200';
    return 'from-red-100 to-red-200';
  };

  const sizes = {
    sm: {
      container: 'p-3',
      icon: 'w-6 h-6',
      number: 'text-2xl',
      label: 'text-xs',
      subtitle: 'text-xs',
    },
    md: {
      container: 'p-4',
      icon: 'w-8 h-8',
      number: 'text-3xl',
      label: 'text-sm',
      subtitle: 'text-sm',
    },
    lg: {
      container: 'p-6',
      icon: 'w-10 h-10',
      number: 'text-4xl',
      label: 'text-base',
      subtitle: 'text-base',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`bg-gradient-to-br ${getStreakBgColor()} rounded-2xl ${sizeConfig.container} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-2 w-8 h-8 border-2 border-current rounded-full" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-2 border-current rounded-full" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-current rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Flame className={`${sizeConfig.icon} ${getStreakColor()} mr-2`} />
            <span className={`font-semibold ${sizeConfig.label} text-gray-700`}>
              {streakType === 'daily' ? 'Daily' : 'Weekly'} Streak
            </span>
          </div>
          
          {streakActive && !isExpired && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          )}
        </div>

        {/* Main Streak Number */}
        <div className="text-center mb-3">
          <motion.div
            key={currentStreak}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`${sizeConfig.number} font-bold ${getStreakColor()}`}
          >
            {currentStreak}
          </motion.div>
          <div className={`${sizeConfig.label} text-gray-600 font-medium`}>
            {currentStreak === 1 ? 'day' : 'days'}
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center mb-3">
          {isExpired ? (
            <div className={`${sizeConfig.subtitle} text-gray-500`}>
              Streak expired. Start a new one!
            </div>
          ) : streakActive ? (
            <div className={`${sizeConfig.subtitle} text-green-600 font-medium`}>
              🔥 Keep it going!
            </div>
          ) : (
            <div className={`${sizeConfig.subtitle} text-gray-500`}>
              Start your streak today!
            </div>
          )}
        </div>

        {/* Details */}
        {showDetails && (
          <div className="space-y-2">
            {/* Longest Streak */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
                <span className={`${sizeConfig.subtitle} text-gray-600`}>Best</span>
              </div>
              <span className={`${sizeConfig.subtitle} font-semibold text-gray-700`}>
                {longestStreak} days
              </span>
            </div>

            {/* Last Activity */}
            {lastActivityDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <span className={`${sizeConfig.subtitle} text-gray-600`}>Last</span>
                </div>
                <span className={`${sizeConfig.subtitle} text-gray-600`}>
                  {new Date(lastActivityDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Progress Indicators */}
        <div className="mt-4 flex justify-center space-x-1">
          {[7, 14, 30, 60].map((milestone, index) => (
            <div
              key={milestone}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentStreak >= milestone
                  ? 'bg-current opacity-100'
                  : 'bg-gray-300 opacity-50'
              }`}
              title={`${milestone} day milestone`}
            />
          ))}
        </div>

        {/* Motivational Messages */}
        {streakActive && !isExpired && (
          <div className="mt-3 text-center">
            {currentStreak >= 30 && (
              <div className={`${sizeConfig.subtitle} text-purple-600 font-medium`}>
                🏆 Writing Master!
              </div>
            )}
            {currentStreak >= 14 && currentStreak < 30 && (
              <div className={`${sizeConfig.subtitle} text-orange-600 font-medium`}>
                🌟 On Fire!
              </div>
            )}
            {currentStreak >= 7 && currentStreak < 14 && (
              <div className={`${sizeConfig.subtitle} text-yellow-600 font-medium`}>
                💪 Building momentum!
              </div>
            )}
            {currentStreak < 7 && (
              <div className={`${sizeConfig.subtitle} text-red-600 font-medium`}>
                🚀 Great start!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}