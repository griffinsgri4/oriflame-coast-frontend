import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';

export default function OrderDetails({ params }: { params: { id: string } }) {
  // Mock order data based on ID
  const order = {
    id: params.id,
    date: '2023-10-12',
    total: 54.25,
    status: 'Shipped',
    customer: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      address: '123 Main St, Anytown, ST 12345'
    },
    items: [
      { name: 'Matte Lipstick', quantity: 2, price: 12.99, image: '/placeholder.jpg' },
      { name: 'Volumizing Mascara', quantity: 1, price: 15.99, image: '/placeholder.jpg' },
      { name: 'Foundation SPF 15', quantity: 1, price: 22.99, image: '/placeholder.jpg' }
    ],
    timeline: [
      { status: 'Order Placed', date: '2023-10-12', time: '09:15 AM' },
      { status: 'Processing', date: '2023-10-12', time: '02:30 PM' },
      { status: 'Shipped', date: '2023-10-13', time: '10:45 AM' }
    ]
  };

  // Status icon mapping
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      default:
        return <Package className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <h1 className="text-2xl font-bold">Order {order.id}</h1>
      </div>

      {/* Order Summary */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium">Status:</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-medium text-lg">${order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Order Timeline</h2>
          <div className="relative">
            {order.timeline.map((event, index) => (
              <div key={index} className="mb-8 flex items-start last:mb-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  {getStatusIcon(event.status)}
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium">{event.status}</h3>
                  <p className="text-sm text-muted-foreground">
                    {event.date} at {event.time}
                  </p>
                </div>
                {index < order.timeline.length - 1 && (
                  <div className="absolute left-4 top-8 h-full w-px bg-border -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Order Items</h2>
          <div className="divide-y">
            {order.items.map((item, index) => (
              <div key={index} className="py-4 flex items-center gap-4">
                <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  Image
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-medium">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4">Shipping Information</h2>
          <div>
            <p className="font-medium">{order.customer.name}</p>
            <p className="text-muted-foreground">{order.customer.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}