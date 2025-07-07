import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

const modalVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      variant: {
        default: 'bg-white border border-gray-200 rounded-lg',
        destructive: 'bg-white border border-red-200 rounded-lg',
        success: 'bg-white border border-green-200 rounded-lg',
        warning: 'bg-white border border-yellow-200 rounded-lg',
      },
      size: {
        default: 'max-w-lg',
        sm: 'max-w-sm',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full w-[95vw] h-[95vh]',
      },
      position: {
        center: 'left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        top: 'left-[50%] top-[10%] translate-x-[-50%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[8%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[8%]',
        bottom: 'left-[50%] bottom-[10%] translate-x-[-50%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-bottom-[8%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-bottom-[8%]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      position: 'center',
    },
  }
);

const Modal = DialogPrimitive.Root;

const ModalTrigger = DialogPrimitive.Trigger;

const ModalPortal = DialogPrimitive.Portal;

const ModalClose = DialogPrimitive.Close;

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof modalVariants> & {
      showCloseButton?: boolean;
      closeOnOverlayClick?: boolean;
    }
>(({ 
  className, 
  variant, 
  size, 
  position,
  showCloseButton = true,
  closeOnOverlayClick = true,
  children, 
  ...props 
}, ref) => (
  <ModalPortal>
    <ModalOverlay 
      onClick={closeOnOverlayClick ? undefined : (e) => e.preventDefault()}
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(modalVariants({ variant, size, position }), className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </ModalPortal>
));
ModalContent.displayName = DialogPrimitive.Content.displayName;

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
));
ModalHeader.displayName = 'ModalHeader';

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
));
ModalFooter.displayName = 'ModalFooter';

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

// Specialized modal components
interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent variant={variant} size="sm">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>
        <ModalFooter className="mt-6">
          <ModalClose
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              'sm:mr-3 sm:w-auto'
            )}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </ModalClose>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
              variant === 'destructive'
                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
              'sm:w-auto',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'default' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const InfoModal: React.FC<InfoModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'default',
  variant = 'default',
}) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent variant={variant} size={size}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
        <ModalFooter className="mt-6">
          <ModalClose
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Got it
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ConfirmModal,
  InfoModal,
};