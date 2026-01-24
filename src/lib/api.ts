import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Product, Order, User, ApiResponse, PaginatedResponse, Category } from './types';

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://oriflame-backend.onrender.com/api'
    : 'http://localhost:8000/api');

const SANCTUM_BASE_URL =
  process.env.NEXT_PUBLIC_SANCTUM_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://oriflame-backend.onrender.com'
    : 'http://localhost:8000');

const toAbsoluteUrl = (value: any): any => {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  if (!v) return v;

  const toPublicProductImageUrl = (raw: string): string | null => {
    const m = raw.match(/\/storage\/products\/(\d+)\/([^\/?#]+)$/);
    if (!m) return null;
    const [, productId, filename] = m;
    return `${SANCTUM_BASE_URL}/api/products/${productId}/images/${filename}`;
  };

  if (/^https?:\/\//i.test(v)) {
    return toPublicProductImageUrl(v) ?? v;
  }

  if (v.startsWith('/storage/')) {
    return toPublicProductImageUrl(`${SANCTUM_BASE_URL}${v}`) ?? `${SANCTUM_BASE_URL}${v}`;
  }

  if (v.startsWith('/api/')) return `${SANCTUM_BASE_URL}${v}`;
  if (v.startsWith('/')) return `${SANCTUM_BASE_URL}${v}`;
  return v;
};

// Create axios instance for API calls
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for Laravel Sanctum
});

// Create axios instance for CSRF token
const csrfClient: AxiosInstance = axios.create({
  baseURL: SANCTUM_BASE_URL,
  withCredentials: true,
});

// Function to get CSRF token
const getCsrfToken = async (): Promise<void> => {
  try {
    await csrfClient.get('/sanctum/csrf-cookie');
  } catch (error) {
    console.warn('Failed to get CSRF token:', error);
  }
};

// Request interceptor to add auth token and handle CSRF
apiClient.interceptors.request.use(
  async (config) => {
    // Get CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      await getCsrfToken();
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token; redirect only on protected routes
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const protectedRoute = /^\/(admin|dashboard|orders|profile)(\/|$)/.test(path);
        if (protectedRoute) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // Authentication
  auth: {
    register: async (userData: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
      address?: string;
      phone?: string;
    }): Promise<ApiResponse<{ user: User; token: string }>> => {
      const response = await apiClient.post('/register', userData);
      return response.data;
    },

    login: async (credentials: {
      email: string;
      password: string;
    }): Promise<ApiResponse<{ user: User; token: string }>> => {
      const response = await apiClient.post('/login', credentials);
      return response.data;
    },

    logout: async (): Promise<ApiResponse<null>> => {
      const response = await apiClient.post('/logout');
      return response.data;
    },

    getUser: async (): Promise<ApiResponse<User>> => {
      const response = await apiClient.get('/user');
      return response.data;
    },

    me: async (): Promise<ApiResponse<User>> => {
      const response = await apiClient.get('/me');
      return response.data;
    },

    updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
      const response = await apiClient.put('/profile', userData);
      return response.data;
    },
  },

  // Products
  products: {
    // Normalize product payload coming from backend (Laravel returns decimals as strings)
    _normalizeProduct: (p: any): Product => {
      const toNum = (v: any) => (v === null || v === undefined) ? undefined : (typeof v === 'number' ? v : parseFloat(v));
      return {
        ...p,
        price: toNum(p.price) as number,
        sale_price: toNum(p.sale_price),
        original_price: toNum(p.original_price),
        image: toAbsoluteUrl(p.image),
        // Ensure arrays are arrays
        tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? p.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : p.tags),
        gallery: (Array.isArray(p.gallery) ? p.gallery : (p.gallery ? [p.gallery] : [])).map(toAbsoluteUrl),
      } as Product;
    },
    getAll: async (params?: {
      page?: number;
      per_page?: number;
      search?: string;
      category?: string;
      sort?: string;
      featured?: boolean;
    }): Promise<ApiResponse<PaginatedResponse<Product>>> => {
      const response = await apiClient.get('/products', { params });
      const payload = response.data as ApiResponse<PaginatedResponse<Product>>;
      if (payload?.data?.data) {
        payload.data.data = payload.data.data.map(api.products._normalizeProduct);
      }
      return payload;
    },

    getById: async (id: number): Promise<ApiResponse<Product>> => {
      const response = await apiClient.get(`/products/${id}`);
      const payload = response.data as ApiResponse<Product>;
      if (payload?.data) {
        payload.data = api.products._normalizeProduct(payload.data);
      }
      return payload;
    },

    create: async (productData: {
      name: string;
      sku: string;
      description: string;
      short_description?: string | null;
      price: number;
      original_price?: number | null;
      sale_price?: number | null;
      image?: string;
      gallery?: string[];
      category: string;
      brand?: string | null;
      tags?: string[] | null;
      how_to_use?: string | null;
      ingredients?: string | null;
      weight?: string | null;
      featured?: boolean;
      status?: 'active' | 'inactive';
      quantity: number;
      low_stock_threshold?: number;
    }): Promise<ApiResponse<Product>> => {
      const response = await apiClient.post('/products', productData);
      const payload = response.data as ApiResponse<any>;
      const product = payload?.data?.product ?? payload?.data;
      const stock = payload?.data?.stock ?? undefined;
      if (product) {
        const normalized = api.products._normalizeProduct(product);
        if (stock) {
          (normalized as any).stock = stock;
        }
        return {
          status: payload.status,
          message: payload.message,
          data: normalized,
        } as ApiResponse<Product>;
      }
      return payload as ApiResponse<Product>;
    },

    update: async (id: number, productData: Partial<Product>): Promise<ApiResponse<Product>> => {
      const response = await apiClient.put(`/products/${id}`, productData);
      const payload = response.data as ApiResponse<Product>;
      if (payload?.data) {
        payload.data = api.products._normalizeProduct(payload.data);
      }
      return payload;
    },

    delete: async (id: number): Promise<ApiResponse<null>> => {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    },

    uploadImages: async (id: number, files: File[]): Promise<ApiResponse<{ urls: string[]; paths: string[] }>> => {
      const form = new FormData();
      files.forEach((f) => form.append('images[]', f));
      const response = await apiClient.post(`/products/${id}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },

    deleteImage: async (id: number, url: string): Promise<ApiResponse<null>> => {
      const response = await apiClient.delete(`/products/${id}/images`, {
        data: { url },
      });
      return response.data;
    },

    getFeatured: async (params?: { limit?: number }): Promise<ApiResponse<Product[]>> => {
      const response = await apiClient.get('/products', { params: { featured: true, per_page: params?.limit ?? 8 } });
      const payload = response.data as ApiResponse<PaginatedResponse<Product> | Product[]>;
      const productsArray = Array.isArray((payload as any).data)
        ? ((payload as any).data as any[])
        : (((payload as any).data as PaginatedResponse<Product>)?.data || []);
      const normalized = productsArray.map(api.products._normalizeProduct);
      return {
        status: (payload as any).status ?? true,
        message: (payload as any).message ?? 'OK',
        data: normalized,
      } as ApiResponse<Product[]>;
    },
  },

  // Categories (optional backend support)
  categories: {
    getAll: async (params?: {
      page?: number;
      per_page?: number;
      sort?: string;
      period?: '30d' | '90d' | 'all';
    }): Promise<ApiResponse<PaginatedResponse<Category> | Category[]>> => {
      const response = await apiClient.get('/categories', { params });
      return response.data;
    },
    create: async (data: {
      name: string;
      slug?: string;
      order?: number;
      thumbnail_url?: string;
      meta?: Record<string, any>;
    }): Promise<ApiResponse<Category>> => {
      const response = await apiClient.post('/categories', data);
      return response.data;
    },
    update: async (
      id: number,
      data: Partial<{
        name: string;
        slug: string;
        order: number;
        thumbnail_url: string;
        meta: Record<string, any>;
      }>
    ): Promise<ApiResponse<Category>> => {
      const response = await apiClient.put(`/categories/${id}`, data);
      return response.data;
    },
    delete: async (id: number): Promise<ApiResponse<null>> => {
      const response = await apiClient.delete(`/categories/${id}`);
      return response.data;
    },
    uploadThumbnail: async (id: number, file: File): Promise<ApiResponse<Category>> => {
      const form = new FormData();
      form.append('image', file);
      const response = await apiClient.post(`/categories/${id}/thumbnail`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  },

  // Orders
  orders: {
    getAll: async (params?: {
      page?: number;
      per_page?: number;
      status?: string;
      sort?: string;
    }): Promise<ApiResponse<PaginatedResponse<Order>>> => {
      const response = await apiClient.get('/orders', { params });
      return response.data;
    },

    getById: async (id: number): Promise<ApiResponse<Order>> => {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    },

    myOrders: async (params?: {
      page?: number;
      per_page?: number;
      status?: string;
      sort?: string;
    }): Promise<ApiResponse<PaginatedResponse<Order>>> => {
      const response = await apiClient.get('/my-orders', { params });
      return response.data;
    },

    myOrderById: async (id: number): Promise<ApiResponse<Order>> => {
      const response = await apiClient.get(`/my-orders/${id}`);
      return response.data;
    },

    create: async (orderData: {
      items: Array<{
        product_id: number;
        quantity: number;
        price: number;
      }>;
      shipping_address: any;
      payment_method: string;
    }): Promise<ApiResponse<Order>> => {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    },

    updateStatus: async (id: number, status: string): Promise<ApiResponse<Order>> => {
      const response = await apiClient.patch(`/orders/${id}/status`, { status });
      return response.data;
    },
  },

  // Stock Management
  stock: {
    getAll: async (params?: {
      page?: number;
      per_page?: number;
      low_stock?: boolean;
      in_stock?: boolean;
    }): Promise<PaginatedResponse<any>> => {
      const response = await apiClient.get('/stocks', { params });
      return response.data;
    },

    update: async (productId: number, quantity: number): Promise<ApiResponse<any>> => {
      const response = await apiClient.put(`/stocks/${productId}`, { quantity });
      return response.data;
    },

    getLowStock: async (): Promise<ApiResponse<any[]>> => {
      const response = await apiClient.get('/stocks/low-stock');
      return response.data;
    },
  },

  // Users (Admin only)
  users: {
    getAll: async (params?: {
      page?: number;
      per_page?: number;
      role?: string;
      search?: string;
    }): Promise<PaginatedResponse<User>> => {
      const response = await apiClient.get('/users', { params });
      return response.data;
    },

    getById: async (id: number): Promise<ApiResponse<User>> => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    },

    update: async (id: number, userData: Partial<User>): Promise<ApiResponse<User>> => {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    },

    delete: async (id: number): Promise<ApiResponse<any>> => {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    },
  },

  // Analytics
  analytics: {
    getDashboard: async (params?: {
      period?: number;
    }): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/analytics/dashboard', { params });
      return response.data;
    },

    getSalesSummary: async (params?: {
      period?: number;
    }): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/analytics/sales-summary', { params });
      return response.data;
    },

    getInventorySummary: async (): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/analytics/inventory-summary');
      return response.data;
    },

    getCustomerInsights: async (params?: {
      period?: number;
    }): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/analytics/customer-insights', { params });
      return response.data;
    },

    topCategories: async (params?: { period?: '30d' | '90d' | 'all'; limit?: number }): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/analytics/top-categories', { params });
      return response.data;
    },
  },

  // Settings
  settings: {
    getAll: async (): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/settings');
      return response.data;
    },

    update: async (settings: any): Promise<ApiResponse<any>> => {
      const response = await apiClient.put('/settings', settings);
      return response.data;
    },

    getSetting: async (key: string): Promise<ApiResponse<any>> => {
      const response = await apiClient.get(`/settings/${key}`);
      return response.data;
    },

    uploadImage: async (key: string, file: File): Promise<ApiResponse<any>> => {
      const formData = new FormData();
      formData.append('key', key);
      formData.append('image', file);
      const response = await apiClient.post('/settings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
  },
};

// Utility functions
export const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const errorData = error.response.data as any;
    if (errorData.message) {
      return errorData.message;
    }
    if (errorData.errors) {
      // Handle validation errors
      const firstError = Object.values(errorData.errors)[0] as string[];
      return firstError[0];
    }
  }
  return error.message || 'An unexpected error occurred';
};

export const isApiError = (error: any): error is AxiosError => {
  return error.isAxiosError === true;
};

export default apiClient;
