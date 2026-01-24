'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { withAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { PageLoading, ButtonLoading } from '@/components/ui/Loading';
import ErrorDisplay, { ValidationError } from '@/components/ui/ErrorDisplay';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'mpesa' | 'card' | 'bank';
  icon: string;
  description: string;
  fees?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
}

interface PaymentDetails {
  mpesa?: {
    phoneNumber: string;
  };
  card?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'mpesa',
    name: 'M-Pesa',
    type: 'mpesa',
    icon: '📱',
    description: 'Pay securely with your M-Pesa mobile money',
    fees: 'No additional fees'
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    type: 'card',
    icon: '💳',
    description: 'Visa, Mastercard, and other major cards accepted',
    fees: '2.9% processing fee'
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    type: 'bank',
    icon: '🏦',
    description: 'Direct bank transfer (manual verification required)',
    fees: 'No additional fees'
  }
];

const kenyanCounties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
  'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho',
  'Embu', 'Migori', 'Homa Bay', 'Naivasha', 'Voi', 'Wajir', 'Marsabit',
  'Isiolo', 'Maralal', 'Kapenguria', 'Bungoma', 'Webuye', 'Busia', 'Siaya',
  'Kisii', 'Keroka', 'Kilifi', 'Lamu', 'Taveta', 'Moyale', 'Mandera',
  'Lodwar', 'Lokichoggio', 'Makindu', 'Mtito Andei', 'Kajiado', 'Namanga',
  'Loitokitok', 'Sultan Hamud', 'Makueni', 'Wote', 'Kitui', 'Mwingi',
  'Mutomo', 'Ikutha'
];

function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const items = cart.items;
  const total = cart.total;
  
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    county: '',
    postalCode: ''
  });

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    mpesa: { phoneNumber: '' },
    card: { cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop');
    }
  }, [items, router]);

  const shippingCost = total > 50 ? 0 : 5.99;
  const tax = total * 0.16; // 16% VAT in Kenya
  const finalTotal = total + shippingCost + tax;

  const validateShipping = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!shippingAddress.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingAddress.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingAddress.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) newErrors.email = 'Invalid email format';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^(\+254|0)[17]\d{8}$/.test(shippingAddress.phone)) newErrors.phone = 'Invalid Kenyan phone number';
    if (!shippingAddress.address.trim()) newErrors.address = 'Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.county) newErrors.county = 'County is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (selectedPaymentMethod === 'mpesa') {
      if (!paymentDetails.mpesa?.phoneNumber.trim()) {
        newErrors.mpesaPhone = 'M-Pesa phone number is required';
      } else if (!/^(\+254|0)[17]\d{8}$/.test(paymentDetails.mpesa.phoneNumber)) {
        newErrors.mpesaPhone = 'Invalid M-Pesa phone number';
      }
    } else if (selectedPaymentMethod === 'card') {
      if (!paymentDetails.card?.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
      if (!paymentDetails.card?.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
      if (!paymentDetails.card?.cvv.trim()) newErrors.cvv = 'CVV is required';
      if (!paymentDetails.card?.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 'shipping' && validateShipping()) {
      setCurrentStep('payment');
    } else if (currentStep === 'payment' && validatePayment()) {
      setCurrentStep('review');
    }
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setGeneralError(null);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const orderPayload = {
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          price: i.price,
        })),
        shipping_address: {
          first_name: shippingAddress.firstName,
          last_name: shippingAddress.lastName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.county,
          zip_code: shippingAddress.postalCode,
          country: 'Kenya',
        },
        payment_method: selectedPaymentMethod,
      };

      const response = await api.orders.create(orderPayload as any);
      const createdOrderId = (response as any)?.data?.id;
      if (!createdOrderId) {
        throw new Error('Order creation failed');
      }

      if (selectedPaymentMethod === 'mpesa') {
        const phone = paymentDetails.mpesa?.phoneNumber || shippingAddress.phone;
        if (!phone) {
          throw new Error('M-Pesa phone number is required');
        }
        await api.payments.mpesa.stkPush({ order_id: Number(createdOrderId), phone });
      }

      clearCart();
      router.push(`/order-confirmation/${createdOrderId}`);
      
    } catch (error: any) {
      console.error('Payment failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Payment failed. Please try again.';
      setGeneralError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <Link href="/cart" className="text-[#4CAF50] hover:text-[#45a049] font-medium">
              ← Back to Cart
            </Link>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center">
              {['shipping', 'payment', 'review'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step 
                      ? 'bg-[#4CAF50] text-white' 
                      : index < ['shipping', 'payment', 'review'].indexOf(currentStep)
                        ? 'bg-[#4CAF50] text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep === step ? 'text-[#4CAF50]' : 'text-gray-600'
                  }`}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                  {index < 2 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      index < ['shipping', 'payment', 'review'].indexOf(currentStep)
                        ? 'bg-[#4CAF50]'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shipping Information */}
            {currentStep === 'shipping' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                        errors.firstName ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                        errors.lastName ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                        errors.phone ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="+254 7XX XXX XXX"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                        errors.address ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter your street address"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                        errors.city ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter your city"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">County *</label>
                    <select
                      value={shippingAddress.county}
                      onChange={(e) => setShippingAddress({...shippingAddress, county: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                        errors.county ? 'border-red-300' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select County</option>
                      {kenyanCounties.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                    {errors.county && <p className="text-red-500 text-sm mt-1">{errors.county}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                      placeholder="00100"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white px-8 py-3 rounded-lg font-medium hover:from-[#45a049] hover:to-[#6d4bb8] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment Method */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                
                {/* Payment Method Selection */}
                <div className="space-y-4 mb-8">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          className="mt-1 text-[#4CAF50] focus:ring-[#4CAF50]"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{method.icon}</span>
                            <div>
                              <h3 className="font-medium text-gray-900">{method.name}</h3>
                              <p className="text-sm text-gray-600">{method.description}</p>
                              {method.fees && (
                                <p className="text-xs text-gray-500 mt-1">{method.fees}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Payment Details */}
                {selectedPaymentMethod === 'mpesa' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-4">M-Pesa Payment Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number *</label>
                      <input
                        type="tel"
                        value={paymentDetails.mpesa?.phoneNumber || ''}
                        onChange={(e) => setPaymentDetails({
                          ...paymentDetails,
                          mpesa: { phoneNumber: e.target.value }
                        })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                          errors.mpesaPhone ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="+254 7XX XXX XXX"
                      />
                      {errors.mpesaPhone && <p className="text-red-500 text-sm mt-1">{errors.mpesaPhone}</p>}
                      <p className="text-sm text-gray-600 mt-2">
                        You will receive an M-Pesa prompt on your phone to complete the payment.
                      </p>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === 'card' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Card Payment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                        <input
                          type="text"
                          value={paymentDetails.card?.cardholderName || ''}
                          onChange={(e) => setPaymentDetails({
                            ...paymentDetails,
                            card: { ...paymentDetails.card!, cardholderName: e.target.value }
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                            errors.cardholderName ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="John Doe"
                        />
                        {errors.cardholderName && <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                        <input
                          type="text"
                          value={paymentDetails.card?.cardNumber || ''}
                          onChange={(e) => setPaymentDetails({
                            ...paymentDetails,
                            card: { ...paymentDetails.card!, cardNumber: e.target.value }
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                            errors.cardNumber ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="1234 5678 9012 3456"
                        />
                        {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                        <input
                          type="text"
                          value={paymentDetails.card?.expiryDate || ''}
                          onChange={(e) => setPaymentDetails({
                            ...paymentDetails,
                            card: { ...paymentDetails.card!, expiryDate: e.target.value }
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                            errors.expiryDate ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="MM/YY"
                        />
                        {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                        <input
                          type="text"
                          value={paymentDetails.card?.cvv || ''}
                          onChange={(e) => setPaymentDetails({
                            ...paymentDetails,
                            card: { ...paymentDetails.card!, cvv: e.target.value }
                          })}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors ${
                            errors.cvv ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="123"
                        />
                        {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === 'bank' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Bank Transfer Details</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Bank:</span> Equity Bank Kenya
                      </div>
                      <div>
                        <span className="font-medium">Account Name:</span> Oriflame Coast Region
                      </div>
                      <div>
                        <span className="font-medium">Account Number:</span> 0123456789
                      </div>
                      <div>
                        <span className="font-medium">Branch:</span> Mombasa Branch
                      </div>
                      <div>
                        <span className="font-medium">Reference:</span> Your order will be processed after payment verification
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white px-8 py-3 rounded-lg font-medium hover:from-[#45a049] hover:to-[#6d4bb8] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Order Review */}
            {currentStep === 'review' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>
                
                {/* Shipping Address Review */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.county} {shippingAddress.postalCode}</p>
                    <p>{shippingAddress.phone}</p>
                    <p>{shippingAddress.email}</p>
                  </div>
                </div>

                {/* Payment Method Review */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
                      </span>
                      <div>
                        <p className="font-medium">
                          {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                        </p>
                        {selectedPaymentMethod === 'mpesa' && (
                          <p className="text-sm text-gray-600">{paymentDetails.mpesa?.phoneNumber}</p>
                        )}
                        {selectedPaymentMethod === 'card' && (
                          <p className="text-sm text-gray-600">
                            **** **** **** {paymentDetails.card?.cardNumber?.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {errors.payment && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.payment}</p>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep('payment')}
                    className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    disabled={isProcessing}
                  >
                    Back to Payment
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white px-8 py-3 rounded-lg font-medium hover:from-[#45a049] hover:to-[#6d4bb8] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      `Place Order - $${finalTotal.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (VAT 16%)</span>
                  <span className="text-gray-900">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-[#4CAF50]">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure SSL encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CheckoutPage, '/login');
