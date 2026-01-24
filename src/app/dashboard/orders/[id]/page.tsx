'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { withAuth } from '@/contexts/AuthContext';
import { ApiResponse, Order } from '@/lib/types';

function OrderDetails() {
  const params = useParams();
  const id = params.id as string;
  const orderId = Number(id);

  const { data: orderResponse, loading, error } = useApi<ApiResponse<Order>>(`/my-orders/${orderId}`);
  const order = orderResponse?.data as any;

  function getStatusIcon(status: string) {
    switch ((status || '').toLowerCase()) {
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <p className="text-sm text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">{error || 'Order not found.'}</p>
      </div>
    );
  }

  const items = (order.order_items ?? order.orderItems ?? order.items ?? []) as any[];
  const shippingAddress = order.shipping_address;
  const total = Number(order.total ?? 0);
  const createdAt = order.created_at ? new Date(order.created_at).toLocaleString() : '-';
  const status = String(order.status || '');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Placed on {createdAt}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium">Status:</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                  {getStatusIcon(status)}
                  <span>{status}</span>
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-medium text-lg">${total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-medium">Items</h2>
          <div className="mt-4 space-y-4">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{item.product?.name || item.name || 'Item'}</span>
                  <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                  <span className="font-medium">${Number(item.price ?? 0).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No items found for this order.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-medium">Shipping</h2>
          <div className="mt-2 text-sm text-muted-foreground">
            {typeof shippingAddress === 'object' && shippingAddress ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(shippingAddress, null, 2)}</pre>
            ) : (
              <p>{shippingAddress || '-'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(OrderDetails);
