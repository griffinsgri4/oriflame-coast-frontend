'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  className,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const renderSpinner = () => (
    <Loader2 className={cn('animate-spin text-[#4CAF50]', sizeClasses[size])} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-[#4CAF50] rounded-full animate-pulse',
            size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-6 w-6'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s',
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        'bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] rounded-full animate-pulse',
        sizeClasses[size]
      )}
    />
  );

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      {variant !== 'skeleton' && renderVariant()}
      {text && (
        <p className={cn('text-gray-600 font-medium', textSizeClasses[size])}>
          {text}
        </p>
      )}
      {variant === 'skeleton' && renderVariant()}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Specific loading components for common use cases
export const PageLoading: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading size="lg" text={text} />
  </div>
);

export const ButtonLoading: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center space-x-2">
    <Loading size="sm" />
    {text && <span>{text}</span>}
  </div>
);

export const CardLoading: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <Loading variant="skeleton" />
  </div>
);

export const TableLoading: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

export const ProductCardLoading: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  </div>
);

export default Loading;