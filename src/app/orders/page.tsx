'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sku: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  shippingCost: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    county: string;
    postalCode: string;
    phone: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: string;
    timestamp: string;
    description: string;
    location?: string;
  }[];
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORF-2024-001',
    status: 'shipped',
    items: [
      {
        id: '1',
        productId: '1',
        name: 'Hydrating Face Cream',
        image: '/api/placeholder/300/300',
        price: 29.99,
        quantity: 2,
        sku: 'HFC-001'
      },
      {
        id: '2',
        productId: '2',
        name: 'Vitamin C Serum',
        image: '/api/placeholder/300/300',
        price: 39.99,
        quantity: 1,
        sku: 'VCS-002'
      }
    ],
    total: 99.97,
    shippingCost: 5.99,
    tax: 8.00,
    grandTotal: 113.96,
    paymentMethod: 'M-Pesa',
    paymentStatus: 'paid',
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Doe',
      address: '123 Kimathi Street',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100',
      phone: '+254712345678'
    },
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-01-25',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-22T14:30:00Z',
    statusHistory: [
      {
        status: 'Order Placed',
        timestamp: '2024-01-20T10:00:00Z',
        description: 'Your order has been successfully placed and payment confirmed.',
        location: 'Nairobi'
      },
      {
        status: 'Order Confirmed',
        timestamp: '2024-01-20T11:30:00Z',
        description: 'Order confirmed and being prepared for shipment.',
        location: 'Nairobi Warehouse'
      },
      {
        status: 'Processing',
        timestamp: '2024-01-21T09:00:00Z',
        description: 'Items are being picked and packed.',
        location: 'Nairobi Warehouse'
      },
      {
        status: 'Shipped',
        timestamp: '2024-01-22T14:30:00Z',
        description: 'Package has been shipped and is on its way to you.',
        location: 'Nairobi Distribution Center'
      }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORF-2024-002',
    status: 'processing',
    items: [
      {
        id: '3',
        productId: '3',
        name: 'Lipstick - Ruby Red',
        image: '/api/placeholder/300/300',
        price: 24.99,
        quantity: 1,
        sku: 'LIP-003'
      }
    ],
    total: 24.99,
    shippingCost: 5.99,
    tax: 2.50,
    grandTotal: 33.48,
    paymentMethod: 'Card',
    paymentStatus: 'paid',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Smith',
      address: '456 Moi Avenue',
      city: 'Mombasa',
      county: 'Mombasa',
      postalCode: '80100',
      phone: '+254723456789'
    },
    estimatedDelivery: '2024-01-28',
    createdAt: '2024-01-23T15:00:00Z',
    updatedAt: '2024-01-23T16:00:00Z',
    statusHistory: [
      {
        status: 'Order Placed',
        timestamp: '2024-01-23T15:00:00Z',
        description: 'Your order has been successfully placed and payment confirmed.',
        location: 'Mombasa'
      },
      {
        status: 'Order Confirmed',
        timestamp: '2024-01-23T16:00:00Z',
        description: 'Order confirmed and being prepared for shipment.',
        location: 'Nairobi Warehouse'
      }
    ]
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [searchResults, setSearchResults] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading orders from API
    setOrders(mockOrders);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTrackOrder = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const order = orders.find(o => 
        o.orderNumber.toLowerCase().includes(trackingInput.toLowerCase()) ||
        o.trackingNumber?.toLowerCase().includes(trackingInput.toLowerCase())
      );
      setSearchResults(order || null);
      setLoading(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
          <p className="mt-2 text-gray-600">Track your orders and view order history</p>
        </div>

        {/* Track Order Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Track Your Order</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter order number or tracking number"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleTrackOrder}
              disabled={!trackingInput.trim() || loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Order Found!</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Order Number:</span>
                  <p className="font-medium">{searchResults.orderNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(searchResults.status)}`}>
                    {searchResults.status.charAt(0).toUpperCase() + searchResults.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Estimated Delivery:</span>
                  <p className="font-medium">{searchResults.estimatedDelivery || 'TBD'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(searchResults)}
                className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
              >
                View Full Details →
              </button>
            </div>
          )}

          {trackingInput && !searchResults && !loading && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">No order found with that number. Please check and try again.</p>
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
              <Link
                href="/shop"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">Total: ${order.grandTotal.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Payment Method:</span>
                      <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Payment Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Items:</span>
                      <p className="font-medium">{order.items.length} item(s)</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Delivery:</span>
                      <p className="font-medium">{order.estimatedDelivery || 'TBD'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {order.items.slice(0, 3).map((item) => (
                        <img
                          key={item.id}
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{order.items.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Order Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-medium">{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking Number:</span>
                        <span className="font-medium">{selectedOrder.trackingNumber || 'Not assigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Delivery:</span>
                        <span className="font-medium">{selectedOrder.estimatedDelivery || 'TBD'}</span>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <h4 className="text-md font-semibold text-gray-900 mt-6 mb-3">Shipping Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                      <p>{selectedOrder.shippingAddress.address}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.county} {selectedOrder.shippingAddress.postalCode}</p>
                      <p>{selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${selectedOrder.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>${selectedOrder.shippingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>${selectedOrder.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                          <span>Total:</span>
                          <span>${selectedOrder.grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status History */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status History</h3>
                  <div className="space-y-4">
                    {selectedOrder.statusHistory.map((status, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{status.status}</h4>
                            <span className="text-sm text-gray-500">{formatDate(status.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{status.description}</p>
                          {status.location && (
                            <p className="text-xs text-gray-500 mt-1">📍 {status.location}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}