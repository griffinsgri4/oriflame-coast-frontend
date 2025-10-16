'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { Order } from '@/lib/types';

const OrderConfirmationPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, loading, error } = useApi<Order>(`/orders/${orderId}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#4CAF50] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
          <button
            onClick={() => router.push('/shop')}
            className="px-6 py-3 bg-gradient-to-r from-[#4CAF50] to-[#45a049] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-[#4CAF50] to-[#45a049] mb-6 shadow-lg">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Thank you for choosing Oriflame Kenya. Your order has been successfully placed and will be processed shortly.</p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Order Header */}
          <div className="bg-gradient-to-r from-gray-50 to-green-50 px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-8 py-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={item.product?.image || '/placeholder-product.jpg'}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">{item.product?.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: <span className="font-medium">{item.quantity}</span></p>
                  </div>
                  <div className="text-lg font-bold text-[#4CAF50]">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-green-50 px-8 py-6 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex justify-between text-base text-gray-700">
                <span>Subtotal</span>
                <span className="font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base text-gray-700">
                <span>Shipping</span>
                <span className="font-medium">${order.shipping_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base text-gray-700">
                <span>Tax</span>
                <span className="font-medium">${order.tax_amount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span className="text-[#4CAF50]">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="px-8 py-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-gray-900 text-base">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
                <p>{order.shipping_address.country}</p>
                {order.shipping_address.phone && (
                  <p className="mt-2 font-medium">Phone: {order.shipping_address.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div className="px-8 py-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Order Notes</h3>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 border border-blue-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h3>
          <div className="text-base text-gray-700 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-[#4CAF50] rounded-full mt-2"></div>
              <p>You will receive an email confirmation shortly with your order details.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-[#4CAF50] rounded-full mt-2"></div>
              <p>We'll send you tracking information once your order ships.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-[#4CAF50] rounded-full mt-2"></div>
              <p>Estimated delivery time is 3-5 business days within Kenya.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-[#4CAF50] rounded-full mt-2"></div>
              <p>If you have any questions, please contact our customer support team.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/shop')}
            className="px-8 py-4 bg-gradient-to-r from-[#4CAF50] to-[#45a049] text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold text-lg"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="px-8 py-4 border-2 border-[#4CAF50] text-[#4CAF50] rounded-lg hover:bg-[#4CAF50] hover:text-white transition-all duration-200 font-semibold text-lg"
          >
            View All Orders
          </button>
          <button
            onClick={() => window.print()}
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 font-semibold text-lg"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;