'use client';

import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Crown, 
  Zap, 
  Target, 
  BookOpen, 
  Sparkles,
  Award,
  Shield,
  Flame,
  Heart,
  Lightbulb
} from 'lucide-react';

interface Achievement {
  _id: string;
  name: string;
  description: string;
  category: 'writing' | 'creativity' | 'consistency' | 'collaboration' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  unlockedAt?: string;
  progress?: {
    current: number;
    required: number;
  };
}

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  onClick?: () => void;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  crown: Crown,
  zap: Zap,
  target: Target,
  book: BookOpen,
  sparkles: Sparkles,
  award: Award,
  shield: Shield,
  flame: Flame,
  heart: Heart,
  lightbulb: Lightbulb,
};

const tierColors = {
  bronze: {
    bg: 'from-amber-100 to-orange-100',
    border: 'border-amber-300',
    icon: 'text-amber-600',
    text: 'text-amber-800',
    glow: 'shadow-amber-200',
  },
  silver: {
    bg: 'from-gray-100 to-slate-100',
    border: 'border-gray-300',
    icon: 'text-gray-600',
    text: 'text-gray-800',
    glow: 'shadow-gray-200',
  },
  gold: {
    bg: 'from-yellow-100 to-amber-100',
    border: 'border-yellow-300',
    icon: 'text-yellow-600',
    text: 'text-yellow-800',
    glow: 'shadow-yellow-200',
  },
  platinum: {
    bg: 'from-purple-100 to-indigo-100',
    border: 'border-purple-300',
    icon: 'text-purple-600',
    text: 'text-purple-800',
    glow: 'shadow-purple-200',
  },
};

const sizes = {
  sm: {
    container: 'w-16 h-20',
    icon: 'w-6 h-6',
    title: 'text-xs',
    description: 'text-xs',
  },
  md: {
    container: 'w-20 h-24',
    icon: 'w-8 h-8',
    title: 'text-sm',
    description: 'text-sm',
  },
  lg: {
    container: 'w-24 h-28',
    icon: 'w-10 h-10',
    title: 'text-base',
    description: 'text-base',
  },
};

export default function AchievementBadge({
  achievement,
  isUnlocked,
  showProgress = false,
  size = 'md',
  animated = true,
  onClick,
}: AchievementBadgeProps) {
  const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
  const tierStyle = tierColors[achievement.tier];
  const sizeStyle = sizes[size];

  const progressPercentage = achievement.progress 
    ? (achievement.progress.current / achievement.progress.required) * 100 
    : 0;

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      whileHover={animated ? { scale: 1.05 } : undefined}
      whileTap={animated ? { scale: 0.95 } : undefined}
      className={`
        relative cursor-pointer group
        ${sizeStyle.container}
      `}
      onClick={onClick}
    >
      {/* Badge Container */}
      <div
        className={`
          relative w-full h-full rounded-2xl border-2 transition-all duration-300
          ${isUnlocked 
            ? `bg-gradient-to-br ${tierStyle.bg} ${tierStyle.border} ${tierStyle.glow} shadow-lg` 
            : 'bg-gray-100 border-gray-300 opacity-60'
          }
          ${onClick ? 'hover:shadow-xl hover:-translate-y-1' : ''}
        `}
      >
        {/* Unlock Animation */}
        {isUnlocked && animated && (
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: [0, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 opacity-20"
          />
        )}

        {/* Icon */}
        <div className="flex items-center justify-center pt-3">
          <IconComponent 
            className={`
              ${sizeStyle.icon}
              ${isUnlocked ? tierStyle.icon : 'text-gray-400'}
              transition-colors duration-300
            `}
          />
        </div>

        {/* Tier Indicator */}
        {isUnlocked && (
          <div className="absolute top-1 right-1">
            <div className={`
              w-3 h-3 rounded-full border-2 border-white
              ${achievement.tier === 'bronze' && 'bg-amber-500'}
              ${achievement.tier === 'silver' && 'bg-gray-400'}
              ${achievement.tier === 'gold' && 'bg-yellow-500'}
              ${achievement.tier === 'platinum' && 'bg-purple-500'}
            `} />
          </div>
        )}

        {/* Progress Bar (if showing progress) */}
        {showProgress && achievement.progress && !isUnlocked && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
              />
            </div>
          </div>
        )}

        {/* Lock Overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-2xl">
            <div className="w-4 h-4 border-2 border-gray-400 rounded bg-gray-300" />
          </div>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap max-w-48">
          <div className="font-semibold">{achievement.name}</div>
          <div className="text-gray-300 mt-1">{achievement.description}</div>
          
          {showProgress && achievement.progress && !isUnlocked && (
            <div className="text-gray-400 mt-1">
              {achievement.progress.current}/{achievement.progress.required}
            </div>
          )}
          
          {isUnlocked && achievement.unlockedAt && (
            <div className="text-gray-400 mt-1">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
          
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      </div>

      {/* Glow Effect for Unlocked Achievements */}
      {isUnlocked && animated && (
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`
            absolute inset-0 rounded-2xl blur-sm -z-10
            ${achievement.tier === 'bronze' && 'bg-amber-200'}
            ${achievement.tier === 'silver' && 'bg-gray-200'}
            ${achievement.tier === 'gold' && 'bg-yellow-200'}
            ${achievement.tier === 'platinum' && 'bg-purple-200'}
          `}
        />
      )}
    </motion.div>
  );
}