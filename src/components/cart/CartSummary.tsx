'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface CartSummaryProps {
  className?: string;
  showCheckoutButton?: boolean;
  showContinueShoppingButton?: boolean;
  checkoutButtonText?: string;
  onCheckout?: () => void;
}

export default function CartSummary({
  className,
  showCheckoutButton = true,
  showContinueShoppingButton = true,
  checkoutButtonText = 'Proceed to Checkout',
  onCheckout
}: CartSummaryProps) {
  const { cart } = useCart();
  const router = useRouter();

  const subtotal = cart.total;
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className={cn(
        'bg-white border border-gray-200 rounded-lg p-6 shadow-sm',
        className
      )}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-4">Add some products to get started</p>
          {showContinueShoppingButton && (
            <Link
              href="/shop"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg p-6 shadow-sm',
      className
    )}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      {/* Cart Items Count */}
      <div className="flex justify-between items-center py-2 text-sm">
        <span className="text-gray-600">Items ({cart.itemCount})</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between items-center py-2 text-sm border-t border-gray-100">
        <span className="text-gray-600">Shipping</span>
        <span className="font-medium">
          {shipping === 0 ? (
            <span className="text-green-600">Free</span>
          ) : (
            `$${shipping.toFixed(2)}`
          )}
        </span>
      </div>

      {/* Free Shipping Notice */}
      {shipping > 0 && (
        <div className="py-2 text-xs text-blue-600 bg-blue-50 rounded-md px-3 mt-2">
          Add ${(50 - subtotal).toFixed(2)} more for free shipping!
        </div>
      )}

      {/* Tax */}
      <div className="flex justify-between items-center py-2 text-sm border-t border-gray-100">
        <span className="text-gray-600">Tax</span>
        <span className="font-medium">${tax.toFixed(2)}</span>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center py-3 text-lg font-semibold border-t-2 border-gray-200 mt-2">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 mt-6">
        {showCheckoutButton && (
          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Proceed to Checkout
          </button>
        )}
        
        {showContinueShoppingButton && (
          <Link
            href="/shop"
            className="block w-full text-center bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
          </Link>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2zm10-12V6a4 4 0 00-8 0v3h8z" />
        </svg>
        Secure checkout
      </div>

      {/* Payment Methods */}
      <div className="mt-3 flex items-center justify-center space-x-2">
        <div className="text-xs text-gray-400">We accept:</div>
        <div className="flex space-x-1">
          {['Visa', 'MC', 'PayPal'].map((method) => (
            <div
              key={method}
              className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
            >
              {method}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}