'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { CartItem as CartItemType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
  className?: string;
  showRemoveButton?: boolean;
  showQuantityControls?: boolean;
}

export default function CartItem({
  item,
  className,
  showRemoveButton = true,
  showQuantityControls = true
}: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      updateQuantity(item.product.id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = () => {
    removeItem(item.product.id);
  };

  const incrementQuantity = () => {
    handleQuantityChange(item.quantity + 1);
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      handleQuantityChange(item.quantity - 1);
    }
  };

  const itemTotal = item.price * item.quantity;
  const stockQty = typeof item.product.stock === 'number' ? item.product.stock : item.product.stock?.quantity;
  const isOutOfStock = typeof stockQty === 'number' && stockQty === 0;
  const hasInsufficientStock = typeof stockQty === 'number' && stockQty < item.quantity;

  const disableIncrease = isUpdating || (typeof stockQty === 'number' ? item.quantity >= stockQty : false);

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm',
      isOutOfStock && 'opacity-60',
      className
    )}>
      {/* Product Image */}
      <div className="flex-shrink-0">
        <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-md overflow-hidden">
          {item.product.image ? (
            <Image
              src={item.product.image}
              alt={item.product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex-1">
            <Link 
              href={`/shop/products/${item.product.id}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
            >
              {item.product.name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">{item.product.category}</p>
            
            {/* Stock Status */}
            {isOutOfStock && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                Out of Stock
              </span>
            )}
            {hasInsufficientStock && !isOutOfStock && typeof stockQty === 'number' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                Only {stockQty} left
              </span>
            )}
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              ${itemTotal.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              ${item.price.toFixed(2)} each
            </p>
          </div>
        </div>

        {/* Quantity Controls and Remove Button */}
        <div className="flex items-center justify-between mt-3">
          {showQuantityControls && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Qty:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={decrementQuantity}
                  disabled={item.quantity <= 1 || isUpdating}
                  className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                
                <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center">
                  {isUpdating ? '...' : item.quantity}
                </span>
                
                <button
                  onClick={incrementQuantity}
                  disabled={disableIncrease}
                  className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {showRemoveButton && (
            <button
              onClick={handleRemove}
              className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
              aria-label={`Remove ${item.product.name} from cart`}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}