'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface CartIconProps {
  className?: string;
  showBadge?: boolean;
  href?: string;
}

export default function CartIcon({ 
  className, 
  showBadge = true,
  href = '/cart'
}: CartIconProps) {
  const { cart } = useCart();

  return (
    <Link
      href={href}
      className={cn(
        'relative inline-flex items-center p-2 text-gray-600 hover:text-blue-600 transition-colors',
        className
      )}
      aria-label={`Shopping cart with ${cart.itemCount} items`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      
      {showBadge && cart.itemCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[1.25rem] h-5">
          {cart.itemCount > 99 ? '99+' : cart.itemCount}
        </span>
      )}
    </Link>
  );
}