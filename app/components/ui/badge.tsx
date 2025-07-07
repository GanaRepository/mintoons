import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
        success: 'bg-green-100 text-green-800 hover:bg-green-200',
        warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        info: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
        pink: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
        gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
        xl: 'px-4 py-1.5 text-lg',
      },
      shape: {
        rounded: 'rounded-full',
        square: 'rounded-md',
        pill: 'rounded-full px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'rounded',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  onRemove?: () => void;
  removable?: boolean;
  dot?: boolean;
  pulse?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    shape, 
    icon, 
    onRemove, 
    removable = false, 
    dot = false,
    pulse = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <div 
        className={cn(
          badgeVariants({ variant, size, shape }), 
          pulse && 'animate-pulse',
          className
        )} 
        ref={ref} 
        {...props}
      >
        {dot && (
          <div className="w-2 h-2 bg-current rounded-full mr-1.5 opacity-75" />
        )}
        
        {icon && (
          <div className="mr-1 opacity-75">
            {icon}
          </div>
        )}
        
        {children}
        
        {(removable || onRemove) && (
          <button
            onClick={onRemove}
            className="ml-1.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
            aria-label="Remove badge"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// Status Badge Component
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'online' | 'offline' | 'away' | 'busy' | 'pending' | 'active' | 'inactive' | 'completed' | 'failed';
}

const statusVariants = {
  online: 'bg-green-100 text-green-800',
  offline: 'bg-gray-100 text-gray-800',
  away: 'bg-yellow-100 text-yellow-800',
  busy: 'bg-red-100 text-red-800',
  pending: 'bg-orange-100 text-orange-800',
  active: 'bg-blue-100 text-blue-800',
  inactive: 'bg-gray-100 text-gray-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const statusLabels = {
  online: 'Online',
  offline: 'Offline',
  away: 'Away',
  busy: 'Busy',
  pending: 'Pending',
  active: 'Active',
  inactive: 'Inactive',
  completed: 'Completed',
  failed: 'Failed',
};

export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, className, children, ...props }, ref) => {
    return (
      <Badge
        className={cn(statusVariants[status], className)}
        dot
        ref={ref}
        {...props}
      >
        {children || statusLabels[status]}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// Achievement Badge Component
export interface AchievementBadgeProps extends Omit<BadgeProps, 'variant'> {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned?: boolean;
}

const rarityVariants = {
  common: 'bg-gray-100 text-gray-800 border-gray-300',
  rare: 'bg-blue-100 text-blue-800 border-blue-300',
  epic: 'bg-purple-100 text-purple-800 border-purple-300',
  legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-500',
};

export const AchievementBadge = React.forwardRef<HTMLDivElement, AchievementBadgeProps>(
  ({ rarity, earned = true, className, children, ...props }, ref) => {
    return (
      <Badge
        className={cn(
          rarityVariants[rarity],
          'border-2',
          !earned && 'opacity-50 grayscale',
          earned && rarity === 'legendary' && 'shadow-lg',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Badge>
    );
  }
);

AchievementBadge.displayName = 'AchievementBadge';

// Notification Badge Component
export interface NotificationBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  count: number;
  max?: number;
  showZero?: boolean;
}

export const NotificationBadge = React.forwardRef<HTMLDivElement, NotificationBadgeProps>(
  ({ count, max = 99, showZero = false, className, ...props }, ref) => {
    if (count === 0 && !showZero) return null;

    const displayCount = count > max ? `${max}+` : count.toString();

    return (
      <Badge
        variant="destructive"
        size="sm"
        className={cn(
          'min-w-[1.25rem] h-5 px-1 text-xs font-bold',
          count === 0 && 'bg-gray-400',
          className
        )}
        ref={ref}
        {...props}
      >
        {displayCount}
      </Badge>
    );
  }
);

NotificationBadge.displayName = 'NotificationBadge';

// Role Badge Component
export interface RoleBadgeProps extends Omit<BadgeProps, 'variant'> {
  role: 'admin' | 'mentor' | 'student' | 'user' | 'guest';
}

const roleVariants = {
  admin: 'bg-red-100 text-red-800 border-red-300',
  mentor: 'bg-blue-100 text-blue-800 border-blue-300',
  student: 'bg-green-100 text-green-800 border-green-300',
  user: 'bg-gray-100 text-gray-800 border-gray-300',
  guest: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

const roleLabels = {
  admin: 'Admin',
  mentor: 'Mentor',
  student: 'Student',
  user: 'User',
  guest: 'Guest',
};

export const RoleBadge = React.forwardRef<HTMLDivElement, RoleBadgeProps>(
  ({ role, className, children, ...props }, ref) => {
    return (
      <Badge
        className={cn(roleVariants[role], 'border', className)}
        ref={ref}
        {...props}
      >
        {children || roleLabels[role]}
      </Badge>
    );
  }
);

RoleBadge.displayName = 'RoleBadge';

// Priority Badge Component
export interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const priorityVariants = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PriorityBadge = React.forwardRef<HTMLDivElement, PriorityBadgeProps>(
  ({ priority, className, children, ...props }, ref) => {
    return (
      <Badge
        className={cn(priorityVariants[priority], className)}
        ref={ref}
        {...props}
      >
        {children || priorityLabels[priority]}
      </Badge>
    );
  }
);

PriorityBadge.displayName = 'PriorityBadge';

// Progress Badge Component
export interface ProgressBadgeProps extends Omit<BadgeProps, 'variant'> {
  progress: number;
  showPercentage?: boolean;
}

export const ProgressBadge = React.forwardRef<HTMLDivElement, ProgressBadgeProps>(
  ({ progress, showPercentage = true, className, children, ...props }, ref) => {
    const percentage = Math.min(Math.max(progress, 0), 100);
    
    const getVariant = () => {
      if (percentage === 100) return 'success';
      if (percentage >= 75) return 'info';
      if (percentage >= 50) return 'warning';
      return 'gray';
    };

    return (
      <Badge
        variant={getVariant() as any}
        className={className}
        ref={ref}
        {...props}
      >
        {children || (showPercentage ? `${Math.round(percentage)}%` : `${progress}/100`)}
      </Badge>
    );
  }
);

ProgressBadge.displayName = 'ProgressBadge';

export { Badge, badgeVariants };