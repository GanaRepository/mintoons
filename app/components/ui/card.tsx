import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200',
        elevated: 'bg-white border-gray-200 shadow-lg',
        gradient: 'bg-gradient-to-br from-white to-gray-50 border-gray-200',
        outlined: 'bg-transparent border-2 border-gray-300',
        ghost: 'bg-transparent border-transparent shadow-none',
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        none: '',
        hover: 'transition-all duration-200 hover:shadow-md hover:-translate-y-1',
        clickable: 'transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer active:scale-95',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: 'none',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : 'div';
    
    if (asChild) {
      return <>{props.children}</>;
    }
    
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, size, interactive }), className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }
>(({ className, as: Comp = 'h3', ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight text-gray-900',
      className
    )}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground text-gray-600', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

// Specialized card components for common use cases
const StoryCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    title: string;
    excerpt?: string;
    author?: string;
    createdAt?: Date;
    status?: 'draft' | 'published' | 'reviewed';
    score?: number;
    onClick?: () => void;
  }
>(({ 
  title, 
  excerpt, 
  author, 
  createdAt, 
  status, 
  score, 
  onClick,
  className,
  ...props 
}, ref) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Card
      ref={ref}
      variant="default"
      interactive={onClick ? 'clickable' : 'hover'}
      className={cn('h-full', className)}
      onClick={onClick}
      {...props}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
          {status && (
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              getStatusColor(status)
            )}>
              {status}
            </span>
          )}
        </div>
        {author && (
          <CardDescription>by {author}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        {excerpt && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">{excerpt}</p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          {createdAt && (
            <span>{createdAt.toLocaleDateString()}</span>
          )}
          {score && (
            <span className={cn('font-medium', getScoreColor(score))}>
              Score: {score}/100
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

StoryCard.displayName = 'StoryCard';

const MetricCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    title: string;
    value: string | number;
    change?: number;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ReactNode;
    description?: string;
  }
>(({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  description,
  className,
  ...props 
}, ref) => {
  const getChangeColor = (type?: string) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (type?: string) => {
    switch (type) {
      case 'positive': return '↗';
      case 'negative': return '↘';
      default: return '→';
    }
  };

  return (
    <Card
      ref={ref}
      variant="default"
      className={cn('', className)}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                <span className={cn('text-sm font-medium', getChangeColor(changeType))}>
                  {getChangeIcon(changeType)} {Math.abs(change)}%
                </span>
                {description && (
                  <span className="text-xs text-gray-500 ml-2">{description}</span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="ml-4 p-3 bg-blue-50 rounded-full">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';

const FeatureCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    comingSoon?: boolean;
  }
>(({ 
  title, 
  description, 
  icon, 
  action,
  comingSoon = false,
  className,
  ...props 
}, ref) => {
  return (
    <Card
      ref={ref}
      variant="default"
      interactive="hover"
      className={cn('h-full relative', comingSoon && 'opacity-60', className)}
      {...props}
    >
      {comingSoon && (
        <div className="absolute top-4 right-4">
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Coming Soon
          </span>
        </div>
      )}
      
      <CardHeader>
        {icon && (
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            {icon}
          </div>
        )}
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      
      {action && (
        <CardFooter>
          {action}
        </CardFooter>
      )}
    </Card>
  );
});

FeatureCard.displayName = 'FeatureCard';

const ProfileCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
    stats?: Array<{ label: string; value: string | number }>;
    actions?: React.ReactNode;
  }
>(({ 
  name, 
  email, 
  avatar, 
  role, 
  stats,
  actions,
  className,
  ...props 
}, ref) => {
  return (
    <Card
      ref={ref}
      variant="default"
      className={cn('', className)}
      {...props}
    >
      <CardHeader className="text-center">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-blue-100 flex items-center justify-center">
            <span className="text-xl font-semibold text-blue-600">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <CardTitle className="text-xl">{name}</CardTitle>
        {email && <CardDescription>{email}</CardDescription>}
        {role && (
          <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full mt-2">
            {role}
          </span>
        )}
      </CardHeader>
      
      {stats && stats.length > 0 && (
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      )}
      
      {actions && (
        <CardFooter className="justify-center">
          {actions}
        </CardFooter>
      )}
    </Card>
  );
});

ProfileCard.displayName = 'ProfileCard';

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  StoryCard,
  MetricCard,
  FeatureCard,
  ProfileCard,
  cardVariants
};