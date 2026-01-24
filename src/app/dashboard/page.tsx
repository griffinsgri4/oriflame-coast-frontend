'use client';

import Link from 'next/link';
import { Eye, Package, Truck, CheckCircle } from 'lucide-react';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { ApiResponse, Order, PaginatedResponse } from '@/lib/types';

function CustomerDashboard() {
  const { user } = useAuth();
  const { data: ordersResponse, loading } = useApi<ApiResponse<PaginatedResponse<Order>>>('/my-orders', { page: 1, per_page: 10 });
  const orders = ordersResponse?.data?.data ?? [];

  // Status badge and icon mapping
  const getStatusInfo = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
        return { 
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />
        };
      case 'processing':
        return { 
          color: 'bg-blue-100 text-blue-800',
          icon: <Package className="h-5 w-5 text-blue-500" />
        };
      case 'shipped':
        return { 
          color: 'bg-purple-100 text-purple-800',
          icon: <Truck className="h-5 w-5 text-purple-500" />
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800',
          icon: <Package className="h-5 w-5 text-gray-500" />
        };
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>
      
      {loading ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <p className="text-sm text-muted-foreground">Loading your orders...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const orderId = (order as any).id;
            const createdAt = (order as any).created_at;
            const total = Number((order as any).total ?? 0);
            const items = ((order as any).order_items ?? (order as any).orderItems ?? (order as any).items ?? []) as any[];
            
            return (
              <div key={orderId} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Order #{orderId}</h3>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.color}`}>
                          {String(order.status || '').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Placed on {createdAt ? new Date(createdAt).toLocaleDateString() : '-'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium">${total.toFixed(2)}</p>
                      <Link 
                        href={`/dashboard/orders/${orderId}`}
                        className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90"
                      >
                        <Eye className="h-3 w-3" />
                        View Details
                      </Link>
                    </div>
                  </div>
                  
                  {/* Order status timeline */}
                  <div className="mt-6">
                    <div className="flex items-center">
                      {statusInfo.icon}
                      <div className="ml-4">
                        <p className="text-sm font-medium">Order {order.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {(order.status || '').toLowerCase() === 'delivered' && 'Your order has been delivered.'}
                          {(order.status || '').toLowerCase() === 'shipped' && 'Your order is on the way.'}
                          {(order.status || '').toLowerCase() === 'processing' && 'Your order is being processed.'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order items summary */}
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Order Items</h4>
                    <ul className="space-y-2">
                      {items.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.product?.name || item.name || 'Item'}</span>
                          <span className="text-muted-foreground">${Number(item.price ?? 0).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center">
          <h3 className="font-medium mb-2">No orders yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link 
            href="/shop" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}

export default withAuth(CustomerDashboard);
