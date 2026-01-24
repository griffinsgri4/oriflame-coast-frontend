import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import { handleApiError, isApiError, api } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

// Overloaded function signatures
export function useApi<T>(
  endpoint: string,
  params?: Record<string, any>,
  options?: UseApiOptions
): UseApiState<T> & { execute: () => Promise<T | undefined>; reset: () => void; refetch: () => Promise<T | undefined> };

export function useApi<T>(
  apiCall: () => Promise<T>,
  options?: UseApiOptions
): UseApiState<T> & { execute: () => Promise<T | undefined>; reset: () => void; refetch: () => Promise<T | undefined> };

export function useApi<T>(
  endpointOrApiCall: string | (() => Promise<T>),
  paramsOrOptions?: Record<string, any> | UseApiOptions,
  optionsParam?: UseApiOptions
) {
  // Determine if first parameter is endpoint or apiCall
  const isEndpoint = typeof endpointOrApiCall === 'string';
  
  let endpoint: string | undefined;
  let params: Record<string, any> | undefined;
  let apiCall: (() => Promise<T>) | undefined;
  let options: UseApiOptions;

  if (isEndpoint) {
    endpoint = endpointOrApiCall;
    params = paramsOrOptions as Record<string, any>;
    options = optionsParam || {};
  } else {
    apiCall = endpointOrApiCall;
    options = (paramsOrOptions as UseApiOptions) || {};
  }

  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let result: T;
      
      if (isEndpoint && endpoint) {
        // Handle endpoint-based API calls
        if (endpoint === '/products') {
          result = await api.products.getAll(params) as T;
        } else if (endpoint.startsWith('/products/')) {
          const productId = endpoint.split('/')[2];
          result = await api.products.getById(parseInt(productId)) as T;
        } else if (endpoint === '/orders') {
          result = await api.orders.getAll(params) as T;
        } else if (endpoint === '/my-orders') {
          result = await api.orders.myOrders(params) as T;
        } else if (endpoint.startsWith('/my-orders/')) {
          const orderId = endpoint.split('/')[2];
          result = await api.orders.myOrderById(parseInt(orderId)) as T;
        } else if (endpoint.startsWith('/orders/')) {
          const orderId = endpoint.split('/')[2];
          result = await api.orders.getById(parseInt(orderId)) as T;
        } else if (endpoint === '/stocks') {
          result = await api.stock.getAll(params) as T;
        } else if (endpoint === '/users') {
          result = await api.users.getAll(params) as T;
        } else if (endpoint.startsWith('/users/')) {
          const userId = endpoint.split('/')[2];
          result = await api.users.getById(parseInt(userId)) as T;
        } else {
          throw new Error(`Unsupported endpoint: ${endpoint}`);
        }
      } else if (apiCall) {
        result = await apiCall();
      } else {
        throw new Error('Invalid API call configuration');
      }
      
      setState({ data: result, loading: false, error: null });
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const errorMessage = isApiError(error) 
        ? handleApiError(error as AxiosError)
        : 'An unexpected error occurred';
      
      setState({ data: null, loading: false, error: errorMessage });
      
      if (onError) {
        onError(errorMessage);
      }
      
      return undefined;
    }
  }, [endpoint, JSON.stringify(params), apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    refetch: execute,
  };
}

// Specialized hook for mutations (POST, PUT, DELETE)
export function useMutation<T, P = any>(
  apiCall: (params: P) => Promise<T>,
  options: UseApiOptions = {}
) {
  const { onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall(params);
      setState({ data: result, loading: false, error: null });
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const errorMessage = isApiError(error) 
        ? handleApiError(error as AxiosError)
        : 'An unexpected error occurred';
      
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw error;
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// Hook for paginated data
export function usePaginatedApi<T>(
  apiCall: (page: number, params?: any) => Promise<{ data: T[]; meta: any }>,
  initialParams: any = {},
  options: UseApiOptions = {}
) {
  const [page, setPage] = useState(1);
  const [params, setParams] = useState(initialParams);
  const [allData, setAllData] = useState<T[]>([]);
  const [meta, setMeta] = useState<any>(null);

  const { data, loading, error, execute } = useApi(
    () => apiCall(page, params),
    { ...options, immediate: false }
  );

  useEffect(() => {
    execute();
  }, [page, JSON.stringify(params), execute]);

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllData(data.data);
      } else {
        setAllData(prev => [...prev, ...data.data]);
      }
      setMeta(data.meta);
    }
  }, [data, page]);

  const loadMore = useCallback(() => {
    if (meta && meta.current_page < meta.last_page) {
      setPage(prev => prev + 1);
    }
  }, [meta]);

  const refresh = useCallback(() => {
    setPage(1);
    setAllData([]);
    execute();
  }, [execute]);

  const updateParams = useCallback((newParams: any) => {
    setParams(newParams);
    setPage(1);
    setAllData([]);
  }, []);

  return {
    data: allData,
    meta,
    loading,
    error,
    loadMore,
    refresh,
    updateParams,
    hasMore: meta ? meta.current_page < meta.last_page : false,
  };
}
