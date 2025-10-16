// Product types
export interface Product {
  id: number | string;
  name: string;
  sku?: string;
  description: string;
  price: number;
  original_price?: number;
  sale_price?: number;
  image?: string;
  gallery?: string[];
  category: string;
  brand?: string;
  tags?: string[];
  attributes?: Record<string, any>;
  short_description?: string;
  how_to_use?: string;
  ingredients?: string;
  weight?: string | number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  meta?: Record<string, any>;
  featured: boolean;
  status: 'active' | 'inactive';
  stock?: Stock | number; // Can be Stock object or just quantity number
  created_at?: string;
  updated_at?: string;
}

export interface Stock {
  id: number;
  product_id: number;
  quantity: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

// Cart types
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number; // Price at time of adding to cart
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Order types
export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  items: OrderItem[];
  shipping_address: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  role: 'admin' | 'customer';
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    path: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Category type (optional backend support)
export interface Category {
  id?: number | string;
  name: string;
  slug: string;
  order?: number;
  thumbnail_url?: string; // Full URL to image
  product_count?: number;
  sales_count?: number;
  meta?: Record<string, any>;
}