import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-blue-500',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
        warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500',
      },
      size: {
        default: 'min-h-[80px]',
        sm: 'min-h-[60px] px-2 py-1 text-xs',
        lg: 'min-h-[120px] px-4 py-3 text-base',
        xl: 'min-h-[160px] px-4 py-3 text-lg',
      },
      resize: {
        none: 'resize-none',
        both: 'resize',
        horizontal: 'resize-x',
        vertical: 'resize-y',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      resize: 'vertical',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    size,
    resize,
    label,
    error,
    success,
    warning,
    helperText,
    showCharCount,
    maxLength,
    autoResize = false,
    id,
    value,
    onChange,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [charCount, setCharCount] = React.useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Generate unique ID if not provided
    const textareaId = id || React.useId();
    
    // Determine variant based on validation state
    const finalVariant = error ? 'error' : success ? 'success' : warning ? 'warning' : variant;
    
    // Handle auto-resize
    const handleResize = React.useCallback(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [autoResize]);

    // Handle value changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setCharCount(newValue.length);
      
      if (autoResize) {
        handleResize();
      }
      
      onChange?.(e);
    };

    // Set up refs
    React.useImperativeHandle(ref, () => textareaRef.current!, []);

    // Update character count when value changes externally
    React.useEffect(() => {
      if (typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value]);

    // Handle auto-resize on mount and value change
    React.useEffect(() => {
      if (autoResize) {
        handleResize();
      }
    }, [value, handleResize, autoResize]);

    // Calculate character count status
    const getCharCountStatus = () => {
      if (!maxLength) return 'default';
      const percentage = (charCount / maxLength) * 100;
      if (percentage >= 100) return 'error';
      if (percentage >= 90) return 'warning';
      if (percentage >= 80) return 'caution';
      return 'default';
    };

    const charCountStatus = getCharCountStatus();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium mb-2 transition-colors',
              error ? 'text-red-700' : 
              success ? 'text-green-700' : 
              warning ? 'text-yellow-700' : 
              'text-gray-700'
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <textarea
            id={textareaId}
            ref={textareaRef}
            className={cn(
              textareaVariants({ variant: finalVariant, size, resize }),
              isFocused && 'ring-2 ring-offset-2',
              autoResize && 'resize-none overflow-hidden',
              className
            )}
            value={value}
            maxLength={maxLength}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={handleChange}
            {...props}
          />
          
          {showCharCount && (
            <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 rounded">
              <span className={cn(
                charCountStatus === 'error' && 'text-red-500',
                charCountStatus === 'warning' && 'text-yellow-500',
                charCountStatus === 'caution' && 'text-orange-500'
              )}>
                {charCount}
                {maxLength && `/${maxLength}`}
              </span>
            </div>
          )}
        </div>
        
        {(error || success || warning || helperText || (showCharCount && maxLength)) && (
          <div className="mt-1 flex justify-between items-start">
            <div className="flex-1">
              {error && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}
              
              {success && !error && (
                <p className="text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </p>
              )}
              
              {warning && !error && !success && (
                <p className="text-sm text-yellow-600 flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {warning}
                </p>
              )}
              
              {helperText && !error && !success && !warning && (
                <p className="text-sm text-gray-500">{helperText}</p>
              )}
            </div>
            
            {!showCharCount && maxLength && (
              <div className="ml-2 flex-shrink-0">
                <span className={cn(
                  'text-xs',
                  charCountStatus === 'error' ? 'text-red-500' :
                  charCountStatus === 'warning' ? 'text-yellow-500' :
                  charCountStatus === 'caution' ? 'text-orange-500' :
                  'text-gray-400'
                )}>
                  {charCount}/{maxLength}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };