'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    // Navigate to checkout page
    router.push('/checkout');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <nav className="mt-2">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/shop" className="hover:text-blue-600">
                  Shop
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900">Cart</li>
            </ol>
          </nav>
        </div>

        {cart.items.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                {/* Cart Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cart Items ({cart.itemCount})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <div key={item.id} className="p-6">
                      <CartItem item={item} />
                    </div>
                  ))}
                </div>

                {/* Cart Actions */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/shop"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      Continue Shopping
                    </Link>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Subtotal</div>
                      <div className="text-xl font-semibold text-gray-900">
                        ${cart.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">Shipping Information</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Free shipping on orders over $50. Standard delivery takes 3-5 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="sticky top-8">
                <CartSummary
                  onCheckout={handleCheckout}
                  showContinueShoppingButton={false}
                />

                {/* Security Features */}
                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Why shop with us?</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Free returns within 30 days
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Secure payment processing
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      24/7 customer support
                    </div>
                  </div>
                </div>

                {/* Recently Viewed */}
                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">You might also like</h3>
                  <div className="text-sm text-gray-600">
                    <Link href="/shop" className="text-blue-600 hover:text-blue-700">
                      Browse our featured products →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}