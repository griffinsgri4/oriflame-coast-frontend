'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, Product, Cart } from '@/lib/types';

// Cart Actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number | string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number | string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

// Cart Context Type
interface CartContextType {
  cart: Cart;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number | string) => boolean;
  getItemQuantity: (productId: number | string) => number;
}

// Cart Reducer
function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.find(item => item.product.id === product.id);

      if (existingItem) {
        return state.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...state,
        {
          id: Date.now(), // Temporary ID for cart items
          product,
          quantity,
          price: product.price
        }
      ];
    }

    case 'REMOVE_ITEM': {
      return state.filter(item => item.product.id !== action.payload.productId);
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return state.filter(item => item.product.id !== productId);
      }

      return state.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
    }

    case 'CLEAR_CART': {
      return [];
    }

    case 'LOAD_CART': {
      return action.payload;
    }

    default:
      return state;
  }
}

// Helper function to calculate cart totals
function calculateCartTotals(items: CartItem[]): Cart {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    total,
    itemCount
  };
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, dispatch] = useReducer(cartReducer, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate cart totals
  const cart = calculateCartTotals(cartItems);

  // Cart actions
  const addItem = (product: Product, quantity: number = 1) => {
    // Check if product has stock
    if (product.stock && (typeof product.stock !== 'number') && product.stock.quantity < quantity) {
      throw new Error(`Only ${product.stock.quantity} items available in stock`);
    }

    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (productId: number | string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId: number | string, quantity: number) => {
    const item = cartItems.find(item => item.product.id === productId);
    
    if (item && item.product.stock && (typeof item.product.stock !== 'number') && item.product.stock.quantity < quantity) {
      throw new Error(`Only ${item.product.stock.quantity} items available in stock`);
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId: number | string): boolean => {
    return cartItems.some(item => item.product.id === productId);
  };

  const getItemQuantity = (productId: number | string): number => {
    const item = cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}