'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, X, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning' | 'info' | 'success';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showRetry?: boolean;
  showHome?: boolean;
  showDismiss?: boolean;
  onRetry?: () => void;
  onHome?: () => void;
  onDismiss?: () => void;
  className?: string;
  fullPage?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  variant = 'error',
  size = 'md',
  showIcon = true,
  showRetry = false,
  showHome = false,
  showDismiss = false,
  onRetry,
  onHome,
  onDismiss,
  className,
  fullPage = false,
}) => {
  const variantStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600 bg-red-100',
      title: 'text-red-900',
      message: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700 text-white',
      iconComponent: AlertTriangle,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600 bg-yellow-100',
      title: 'text-yellow-900',
      message: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      iconComponent: AlertCircle,
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600 bg-blue-100',
      title: 'text-blue-900',
      message: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      iconComponent: Info,
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600 bg-green-100',
      title: 'text-green-900',
      message: 'text-green-700',
      button: 'bg-green-600 hover:bg-green-700 text-white',
      iconComponent: CheckCircle,
    },
  };

  const sizeStyles = {
    sm: {
      container: 'p-3',
      icon: 'h-5 w-5',
      iconContainer: 'h-8 w-8',
      title: 'text-sm font-medium',
      message: 'text-sm',
      button: 'px-3 py-1.5 text-sm',
    },
    md: {
      container: 'p-4',
      icon: 'h-6 w-6',
      iconContainer: 'h-10 w-10',
      title: 'text-base font-semibold',
      message: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
    lg: {
      container: 'p-6',
      icon: 'h-8 w-8',
      iconContainer: 'h-16 w-16',
      title: 'text-lg font-bold',
      message: 'text-base',
      button: 'px-6 py-3 text-base',
    },
  };

  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const IconComponent = styles.iconComponent;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const content = (
    <div
      className={cn(
        'border rounded-lg relative',
        styles.container,
        sizes.container,
        className
      )}
    >
      {showDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      )}

      <div className={cn('flex', fullPage ? 'flex-col items-center text-center' : 'items-start space-x-3')}>
        {showIcon && (
          <div
            className={cn(
              'rounded-full flex items-center justify-center flex-shrink-0',
              styles.icon,
              sizes.iconContainer,
              fullPage && 'mb-4'
            )}
          >
            <IconComponent className={sizes.icon} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn(styles.title, sizes.title, fullPage && 'mb-2')}>
              {title}
            </h3>
          )}
          
          <p className={cn(styles.message, sizes.message, fullPage && 'mb-6')}>
            {message}
          </p>

          {(showRetry || showHome) && (
            <div className={cn('flex gap-3 mt-4', fullPage && 'justify-center')}>
              {showRetry && (
                <button
                  onClick={handleRetry}
                  className={cn(
                    'inline-flex items-center font-medium rounded-lg transition-colors',
                    styles.button,
                    sizes.button
                  )}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </button>
              )}
              
              {showHome && (
                <button
                  onClick={handleHome}
                  className={cn(
                    'inline-flex items-center font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors',
                    sizes.button
                  )}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Specific error components for common use cases
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorDisplay
    title="Connection Error"
    message="Unable to connect to the server. Please check your internet connection and try again."
    variant="error"
    showRetry
    onRetry={onRetry}
  />
);

export const NotFoundError: React.FC<{ resource?: string }> = ({ resource = 'page' }) => (
  <ErrorDisplay
    title="Not Found"
    message={`The ${resource} you're looking for doesn't exist or has been moved.`}
    variant="warning"
    showHome
    fullPage
  />
);

export const UnauthorizedError: React.FC = () => (
  <ErrorDisplay
    title="Access Denied"
    message="You don't have permission to access this resource. Please log in or contact support."
    variant="warning"
    showHome
    fullPage
  />
);

export const ServerError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorDisplay
    title="Server Error"
    message="Something went wrong on our end. Our team has been notified and is working to fix this issue."
    variant="error"
    showRetry
    showHome
    onRetry={onRetry}
    fullPage
  />
);

export const ValidationError: React.FC<{ errors: string[] }> = ({ errors }) => (
  <ErrorDisplay
    title="Validation Error"
    message={errors.length === 1 ? errors[0] : `Please fix the following errors: ${errors.join(', ')}`}
    variant="warning"
    size="sm"
  />
);

export default ErrorDisplay;