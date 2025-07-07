'use client';

import { motion } from 'framer-motion';
import { Star, Crown, Zap, Trophy, Sparkles } from 'lucide-react';

interface LevelIndicatorProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXPForCurrentLevel: number;
  levelTitle?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function LevelIndicator({
  currentLevel,
  currentXP,
  xpToNextLevel,
  totalXPForCurrentLevel,
  levelTitle,
  showProgress = true,
  size = 'md',
  animated = true,
}: LevelIndicatorProps) {
  const progressPercentage = ((currentXP - totalXPForCurrentLevel) / (xpToNextLevel - totalXPForCurrentLevel)) * 100;
  
  const getLevelIcon = (level: number) => {
    if (level >= 50) return Crown;
    if (level >= 25) return Trophy;
    if (level >= 10) return Zap;
    return Star;
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'from-purple-500 to-indigo-600';
    if (level >= 25) return 'from-yellow-500 to-orange-600';
    if (level >= 10) return 'from-blue-500 to-cyan-600';
    return 'from-green-500 to-emerald-600';
  };

  const getLevelBg = (level: number) => {
    if (level >= 50) return 'from-purple-100 to-indigo-100';
    if (level >= 25) return 'from-yellow-100 to-orange-100';
    if (level >= 10) return 'from-blue-100 to-cyan-100';
    return 'from-green-100 to-emerald-100';
  };

  const getLevelTitle = (level: number) => {
    if (levelTitle) return levelTitle;
    if (level >= 50) return 'Legendary Writer';
    if (level >= 25) return 'Master Storyteller';
    if (level >= 10) return 'Creative Writer';
    if (level >= 5) return 'Rising Author';
    return 'Story Beginner';
  };

  const IconComponent = getLevelIcon(currentLevel);

  const sizes = {
    sm: {
      container: 'p-3',
      icon: 'w-6 h-6',
      level: 'text-xl',
      title: 'text-xs',
      xp: 'text-xs',
      progress: 'h-2',
    },
    md: {
      container: 'p-4',
      icon: 'w-8 h-8',
      level: 'text-2xl',
      title: 'text-sm',
      xp: 'text-sm',
      progress: 'h-3',
    },
    lg: {
      container: 'p-6',
      icon: 'w-10 h-10',
      level: 'text-3xl',
      title: 'text-base',
      xp: 'text-base',
      progress: 'h-4',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`bg-gradient-to-br ${getLevelBg(currentLevel)} rounded-2xl ${sizeConfig.container} relative overflow-hidden`}>
      {/* Sparkle Effects */}
      {animated && (
        <>
          <motion.div
            animate={{
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 0,
            }}
            className="absolute top-2 right-2 text-yellow-400"
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
          
          <motion.div
            animate={{
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 1.5,
            }}
            className="absolute bottom-2 left-2 text-yellow-400"
          >
            <Sparkles className="w-3 h-3" />
          </motion.div>
        </>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`bg-gradient-to-r ${getLevelColor(currentLevel)} rounded-full p-2 mr-3`}>
              <IconComponent className={`${sizeConfig.icon} text-white`} />
            </div>
            <div>
              <div className={`font-bold ${sizeConfig.level} text-gray-800`}>
                Level {currentLevel}
              </div>
              <div className={`${sizeConfig.title} text-gray-600 font-medium`}>
                {getLevelTitle(currentLevel)}
              </div>
            </div>
          </div>
        </div>

        {/* XP Display */}
        <div className="text-center mb-4">
          <div className={`${sizeConfig.xp} text-gray-700`}>
            <span className="font-semibold">{currentXP.toLocaleString()}</span>
            <span className="text-gray-500"> / </span>
            <span className="font-semibold">{xpToNextLevel.toLocaleString()}</span>
            <span className="text-gray-500"> XP</span>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="mb-4">
            <div className={`w-full bg-gray-200 rounded-full ${sizeConfig.progress} overflow-hidden`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`${sizeConfig.progress} bg-gradient-to-r ${getLevelColor(currentLevel)} rounded-full relative`}
              >
                {/* Progress Bar Glow */}
                {animated && (
                  <motion.div
                    animate={{
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className={`absolute inset-0 bg-gradient-to-r ${getLevelColor(currentLevel)} rounded-full blur-sm`}
                  />
                )}
              </motion.div>
            </div>
            
            {/* Progress Percentage */}
            <div className="flex justify-between items-center mt-2">
              <span className={`${sizeConfig.title} text-gray-500`}>
                {Math.round(progressPercentage)}% to next level
              </span>
              <span className={`${sizeConfig.title} text-gray-600 font-medium`}>
                {(xpToNextLevel - currentXP).toLocaleString()} XP needed
              </span>
            </div>
          </div>
        )}

        {/* Level Milestones */}
        <div className="flex justify-center space-x-1">
          {[5, 10, 25, 50, 100].map((milestone, index) => (
            <div
              key={milestone}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentLevel >= milestone
                  ? `bg-gradient-to-r ${getLevelColor(milestone)} shadow-lg`
                  : 'bg-gray-300'
              }`}
              title={`Level ${milestone} milestone`}
            />
          ))}
        </div>

        {/* Next Level Preview */}
        {currentLevel < 100 && (
          <div className="mt-4 text-center">
            <div className={`${sizeConfig.title} text-gray-600 mb-1`}>
              Next: {getLevelTitle(currentLevel + 1)}
            </div>
            <div className={`${sizeConfig.title} text-gray-500`}>
              Unlock at Level {currentLevel + 1}
            </div>
          </div>
        )}

        {/* Max Level Achievement */}
        {currentLevel >= 100 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 text-center"
          >
            <div className={`${sizeConfig.title} font-bold text-purple-600 mb-1`}>
              🏆 MAX LEVEL ACHIEVED! 🏆
            </div>
            <div className={`${sizeConfig.title} text-gray-600`}>
              You are a true master of storytelling!
            </div>
          </motion.div>
        )}

        {/* Level Up Animation Trigger */}
        {animated && progressPercentage >= 100 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl"
          >
            <div className="text-white font-bold text-xl">
              LEVEL UP!
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}