'use client';

import Link from 'next/link';
import { Eye, Package, Truck, CheckCircle } from 'lucide-react';
import { useAuth, withAuth } from '@/contexts/AuthContext';

function CustomerDashboard() {
  const { user } = useAuth();
  // Mock order data
  const orders = [
    { 
      id: 'ORD-1234', 
      date: '2023-10-05', 
      total: 78.97, 
      status: 'Delivered',
      items: [
        { name: 'Hydrating Face Cream', quantity: 1, price: 24.99 },
        { name: 'Vitamin C Serum', quantity: 1, price: 29.99 },
        { name: 'Exfoliating Face Scrub', quantity: 1, price: 19.99 }
      ]
    },
    { 
      id: 'ORD-1235', 
      date: '2023-10-12', 
      total: 54.25, 
      status: 'Shipped',
      items: [
        { name: 'Matte Lipstick', quantity: 2, price: 12.99 },
        { name: 'Volumizing Mascara', quantity: 1, price: 15.99 },
        { name: 'Foundation SPF 15', quantity: 1, price: 22.99 }
      ]
    },
    { 
      id: 'ORD-1236', 
      date: '2023-10-18', 
      total: 34.99, 
      status: 'Processing',
      items: [
        { name: 'Rejuvenating Night Cream', quantity: 1, price: 34.99 }
      ]
    },
  ];

  // Status badge and icon mapping
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Delivered':
        return { 
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />
        };
      case 'Processing':
        return { 
          color: 'bg-blue-100 text-blue-800',
          icon: <Package className="h-5 w-5 text-blue-500" />
        };
      case 'Shipped':
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
      
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            
            return (
              <div key={order.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{order.id}</h3>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.color}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Placed on {order.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <Link 
                        href={`/dashboard/orders/${order.id}`}
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
                          {order.status === 'Delivered' && 'Your order has been delivered.'}
                          {order.status === 'Shipped' && 'Your order is on the way.'}
                          {order.status === 'Processing' && 'Your order is being processed.'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order items summary */}
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Order Items</h4>
                    <ul className="space-y-2">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
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