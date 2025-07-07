import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const progressVariants = cva(
  'relative overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-1',
        default: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
      variant: {
        default: 'bg-gray-200',
        success: 'bg-green-100',
        warning: 'bg-yellow-100',
        danger: 'bg-red-100',
        info: 'bg-blue-100',
        purple: 'bg-purple-100',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

const progressBarVariants = cva(
  'h-full transition-all duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-gray-600',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
        info: 'bg-blue-500',
        purple: 'bg-purple-500',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
      },
      animated: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
    },
  }
);

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  color?: string;
  animated?: boolean;
  barVariant?: VariantProps<typeof progressBarVariants>['variant'];
  showPercentage?: boolean;
  striped?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    size, 
    variant, 
    showLabel = false, 
    label, 
    color,
    animated = false,
    barVariant = 'default',
    showPercentage = false,
    striped = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const roundedPercentage = Math.round(percentage);

    return (
      <div className="w-full" {...props} ref={ref}>
        {(showLabel || label || showPercentage) && (
          <div className="flex items-center justify-between mb-1">
            {(showLabel || label) && (
              <span className="text-sm font-medium text-gray-700">
                {label || `Progress: ${value}/${max}`}
              </span>
            )}
            {showPercentage && (
              <span className="text-sm font-medium text-gray-600">
                {roundedPercentage}%
              </span>
            )}
          </div>
        )}
        
        <div className={cn(progressVariants({ size, variant }), className)}>
          <div
            className={cn(
              progressBarVariants({ 
                variant: barVariant, 
                animated: animated 
              }),
              color,
              striped && 'bg-striped',
              'transition-[width] duration-500 ease-out'
            )}
            style={{ 
              width: `${percentage}%`,
              backgroundImage: striped ? 
                'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)' 
                : undefined,
              backgroundSize: striped ? '1rem 1rem' : undefined,
              animation: striped && animated ? 'progress-bar-stripes 1s linear infinite' : undefined,
            }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label || `Progress: ${roundedPercentage}%`}
          />
          
          {/* Shimmer effect for loading states */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

// Circular Progress Component
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({
    value,
    max = 100,
    size = 80,
    strokeWidth = 8,
    className,
    color = '#8b5cf6',
    backgroundColor = '#e5e7eb',
    showLabel = true,
    label,
    animated = true,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div 
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        {...props}
        ref={ref}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={animated ? 'transition-all duration-1000 ease-out' : ''}
          />
        </svg>
        
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">
              {label || `${Math.round(percentage)}%`}
            </span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

// Multi-step Progress Component
export interface StepProgressProps {
  steps: string[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  orientation?: 'horizontal' | 'vertical';
}

export const StepProgress = React.forwardRef<HTMLDivElement, StepProgressProps>(
  ({
    steps,
    currentStep,
    completedSteps = [],
    className,
    size = 'default',
    orientation = 'horizontal',
    ...props
  }, ref) => {
    const isHorizontal = orientation === 'horizontal';
    
    const sizeClasses = {
      sm: { circle: 'w-6 h-6', text: 'text-xs', connector: isHorizontal ? 'h-0.5' : 'w-0.5' },
      default: { circle: 'w-8 h-8', text: 'text-sm', connector: isHorizontal ? 'h-1' : 'w-1' },
      lg: { circle: 'w-10 h-10', text: 'text-base', connector: isHorizontal ? 'h-1.5' : 'w-1.5' },
    };

    const { circle, text, connector } = sizeClasses[size];

    return (
      <div 
        className={cn(
          'flex',
          isHorizontal ? 'items-center space-x-4' : 'flex-col space-y-4',
          className
        )}
        {...props}
        ref={ref}
      >
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div
              key={index}
              className={cn(
                'flex items-center',
                isHorizontal ? 'flex-1' : 'w-full'
              )}
            >
              <div className="flex items-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    circle,
                    'rounded-full flex items-center justify-center font-medium transition-all duration-300',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && 'bg-purple-500 text-white ring-4 ring-purple-100',
                    isUpcoming && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className={text}>{index + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className={cn('ml-3', isHorizontal && 'flex-1')}>
                  <div
                    className={cn(
                      text,
                      'font-medium transition-colors duration-300',
                      isCompleted && 'text-green-700',
                      isCurrent && 'text-purple-700',
                      isUpcoming && 'text-gray-500'
                    )}
                  >
                    {step}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'bg-gray-300 transition-colors duration-300',
                    isHorizontal ? `flex-1 ${connector} ml-4` : `${connector} h-8 ml-4 mt-2`,
                    isCompleted && 'bg-green-500'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

StepProgress.displayName = 'StepProgress';

export { ProgressBar };