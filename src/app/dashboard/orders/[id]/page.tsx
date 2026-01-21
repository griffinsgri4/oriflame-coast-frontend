import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';

export default async function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Mock order data based on ID
  const order = {
    id: id,
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

  function getStatusIcon(status: string) {
    switch (status) {
      case 'Shipped':
        return <Truck className="h-4 w-4" />;
      case 'Processing':
        return <Package className="h-4 w-4" />;
      case 'Delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  }

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
          <h2 className="text-lg font-medium">Order Timeline</h2>
          <div className="mt-4 space-y-4">
            {order.timeline.map((event, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-600" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{event.status}</span>
                  <span className="ml-2">{event.date}</span>
                  <span className="ml-2">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-medium">Items</h2>
          <div className="mt-4 space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{item.name}</span>
                <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                <span className="font-medium">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-medium">Customer</h2>
          <div className="mt-2 text-sm text-muted-foreground">
            <p>{order.customer.name}</p>
            <p>{order.customer.email}</p>
            <p>{order.customer.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}