'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export default function AddToCartButton({
  product,
  quantity = 1,
  className,
  variant = 'default',
  size = 'md',
  disabled = false
}: AddToCartButtonProps) {
  const { addItem, isInCart, getItemQuantity } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isProductInCart = isInCart(product.id);
  const currentQuantity = getItemQuantity(product.id);
  const stockQty = typeof product.stock === 'number' ? product.stock : product.stock?.quantity;
  const isOutOfStock = typeof stockQty === 'number' && stockQty === 0;
  const hasInsufficientStock = typeof stockQty === 'number' && stockQty < quantity;

  const handleAddToCart = async () => {
    if (disabled || isOutOfStock || hasInsufficientStock) return;

    setIsLoading(true);
    
    try {
      addItem(product, quantity);
      setShowSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Adding...';
    if (showSuccess) return 'Added!';
    if (isOutOfStock) return 'Out of Stock';
    if (hasInsufficientStock) return 'Insufficient Stock';
    if (isProductInCart) return `In Cart (${currentQuantity})`;
    return 'Add to Cart';
  };

  const getVariantClasses = () => {
    const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (variant) {
      case 'outline':
        return `${baseClasses} border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white focus:ring-blue-500`;
      case 'ghost':
        return `${baseClasses} bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500`;
      default:
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm rounded-md';
      case 'lg':
        return 'px-6 py-3 text-lg rounded-lg';
      default:
        return 'px-4 py-2 text-base rounded-md';
    }
  };

  const getDisabledClasses = () => {
    if (disabled || isOutOfStock || hasInsufficientStock) {
      return 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400 text-white';
    }
    return '';
  };

  const getSuccessClasses = () => {
    if (showSuccess) {
      return 'bg-green-600 hover:bg-green-600 text-white';
    }
    return '';
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isOutOfStock || hasInsufficientStock || isLoading}
      className={cn(
        getVariantClasses(),
        getSizeClasses(),
        getDisabledClasses(),
        getSuccessClasses(),
        className
      )}
      aria-label={`Add ${product.name} to cart`}
    >
      <span className="flex items-center justify-center gap-2">
        {isLoading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {showSuccess && (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {getButtonText()}
      </span>
    </button>
  );
}