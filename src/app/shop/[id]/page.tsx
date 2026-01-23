'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, Share2, Star, Truck, Shield, RotateCcw, Plus, Minus } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { Product } from '@/lib/types';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'additional' | 'how_to_use' | 'ingredients' | 'reviews'>('description');

  // Fetch product data
  const { data: productResponse, loading, error } = useApi<any>(`/products/${productId}`);
  const product = (productResponse?.data ?? productResponse?.data?.product) as Product | undefined;

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayProduct.name,
          text: displayProduct.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 sm:h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8 sm:py-12">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">The product you're looking for doesn't exist or has been removed.</p>
            <Link 
              href="/shop"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white font-medium rounded-lg hover:from-[#45a049] hover:to-[#6d4bb8] transition-all duration-200 text-sm sm:text-base"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8 sm:py-12">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">The product you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/shop"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white font-medium rounded-lg hover:from-[#45a049] hover:to-[#6d4bb8] transition-all duration-200 text-sm sm:text-base"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayProduct = product;
  const stockQty = ((typeof displayProduct.stock === 'number' ? displayProduct.stock : displayProduct.stock?.quantity) ?? 0);

  const productImages = useMemo(() => {
    const images = (Array.isArray(displayProduct.gallery) ? displayProduct.gallery : []).filter(Boolean);
    if (images.length > 0) return images;
    return displayProduct.image ? [displayProduct.image] : [];
  }, [displayProduct.gallery, displayProduct.image]);

  useEffect(() => {
    if (selectedImageIndex >= productImages.length) {
      setSelectedImageIndex(0);
    }
  }, [productImages.length, selectedImageIndex]);

  // Reviews will be loaded from backend if available
  const reviews: { id: number; name: string; rating: number; comment: string; date: string }[] = [];
  const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  // Product structured data (JSON-LD)
  const productUrl = typeof window !== 'undefined' ? window.location.href : '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const baseStructured: any = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: displayProduct.name,
    image: productImages,
    description: displayProduct.description,
    sku: (displayProduct as any).sku ?? String(displayProduct.id),
    brand: { '@type': 'Brand', name: (displayProduct as any).brand ?? 'Oriflame' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KES',
      price: Number(displayProduct.sale_price ?? displayProduct.price).toFixed(2),
      availability: stockQty > 0 ? 'http://schema.org/InStock' : 'http://schema.org/OutOfStock',
      url: productUrl,
    },
  };
  const structuredData = reviews.length
    ? {
        ...baseStructured,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: averageRating.toFixed(1),
          ratingCount: reviews.length,
        },
      }
    : baseStructured;

  // Breadcrumb structured data
  const breadcrumbStructured = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${origin}/shop` },
      ...(displayProduct?.category
        ? [{ '@type': 'ListItem', position: 3, name: String(displayProduct.category), item: `${origin}/shop?category=${encodeURIComponent(String(displayProduct.category))}` }]
        : []),
      { '@type': 'ListItem', position: displayProduct?.category ? 4 : 3, name: displayProduct.name, item: productUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructured) }} />
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 lg:mb-8 overflow-x-auto">
          <Link href="/" className="hover:text-[#4CAF50] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#4CAF50] transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${displayProduct.category}`} className="hover:text-[#4CAF50] transition-colors">
            {displayProduct.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{displayProduct.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-[#4CAF50] transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {productImages.length > 0 ? (
                <Image
                  src={productImages[selectedImageIndex]}
                  alt={displayProduct.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4CAF50]/10 to-[#7E57C2]/10">
                  <div className="text-5xl text-gray-400">📦</div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all duration-200",
                      selectedImageIndex === index
                        ? "border-[#4CAF50] ring-2 ring-[#4CAF50]/20"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${displayProduct.name} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 pr-4">{displayProduct.name}</h1>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={cn(
                      "p-1.5 sm:p-2 rounded-lg transition-all duration-200",
                      isWishlisted
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", isWishlisted && "fill-current")} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-1.5 sm:p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200"
                  >
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3 sm:h-4 sm:w-4",
                        i < Math.floor(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                {displayProduct.sale_price != null ? (
                  <>
                    <span className="text-xl sm:text-2xl font-semibold text-gray-500 line-through">
                      KSh {Number(displayProduct.original_price ?? displayProduct.price).toFixed(2)}
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold text-[#4CAF50]">
                      KSh {Number(displayProduct.sale_price).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-[#4CAF50]">
                    KSh {Number(displayProduct.price).toFixed(2)}
                  </span>
                )}
                {displayProduct.featured && (
                  <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white text-xs sm:text-sm font-medium rounded-full">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full",
                stockQty > 10 ? "bg-green-500" :
                stockQty > 0 ? "bg-yellow-500" : "bg-red-500"
              )}></div>
              <span className={cn(
                "text-xs sm:text-sm font-medium",
                stockQty > 10 ? "text-green-600" :
                stockQty > 0 ? "text-yellow-600" : "text-red-600"
              )}>
                {stockQty > 10 ? "In Stock" :
                 stockQty > 0 ? `Only ${stockQty} left` : "Out of Stock"}
              </span>
            </div>

            {/* Short Description / Highlights */}
            {displayProduct.short_description && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Highlights</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base text-gray-600">
                  {displayProduct.short_description.split(/\r?\n|•/).filter(Boolean).map((line, idx) => (
                    <li key={idx}>{line.trim()}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Quantity</h3>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-1.5 sm:p-2 text-gray-600 hover:text-[#4CAF50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-base sm:text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= stockQty}
                    className="p-1.5 sm:p-2 text-gray-600 hover:text-[#4CAF50] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  {stockQty} available
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3 sm:space-y-4">
              <AddToCartButton
                product={displayProduct}
                quantity={quantity}
                className="w-full bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] hover:from-[#45a049] hover:to-[#6d4bb8] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] text-sm sm:text-base"
                disabled={stockQty === 0}
              />
              
              {stockQty === 0 && (
                <p className="text-center text-red-600 text-xs sm:text-sm">This product is currently out of stock</p>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-[#4CAF50]/10 rounded-lg">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-[#4CAF50]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Free Shipping</p>
                  <p className="text-xs sm:text-sm text-gray-600">On orders over KSh 2,000</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-[#4CAF50]/10 rounded-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[#4CAF50]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Secure Payment</p>
                  <p className="text-xs sm:text-sm text-gray-600">100% secure checkout</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-[#4CAF50]/10 rounded-lg">
                  <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-[#4CAF50]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Easy Returns</p>
                  <p className="text-xs sm:text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-4 sm:space-x-6 lg:space-x-8 px-4 sm:px-6 overflow-x-auto">
                {[
                  { key: 'description', label: 'Description' },
                  { key: 'additional', label: 'Additional Information' },
                  { key: 'how_to_use', label: 'How to use' },
                  { key: 'ingredients', label: 'Ingredients' },
                  { key: 'reviews', label: `Reviews (${reviews.length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={cn(
                      'py-3 sm:py-4 font-medium text-sm sm:text-base whitespace-nowrap',
                      activeTab === (tab.key as any)
                        ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
                        : 'text-gray-600 hover:text-gray-900 transition-colors'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {activeTab === 'description' && (
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Product Description</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{displayProduct.description}</p>
                </div>
              )}

              {activeTab === 'additional' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">SKU:</span>
                    <span className="text-gray-600 text-sm sm:text-base text-right">{displayProduct.sku || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">Brand:</span>
                    <span className="text-gray-600 text-sm sm:text-base text-right">{displayProduct.brand || 'Oriflame'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-900 text-sm sm:text-base">Category:</span>
                    <span className="text-gray-600 text-sm sm:text-base text-right">{displayProduct.category}</span>
                  </div>
                  {displayProduct.weight && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">Weight:</span>
                      <span className="text-gray-600 text-sm sm:text-base text-right">{displayProduct.weight}</span>
                    </div>
                  )}
                  {displayProduct.dimensions && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">Dimensions:</span>
                      <span className="text-gray-600 text-sm sm:text-base text-right">
                        {[displayProduct.dimensions.length, displayProduct.dimensions.width, displayProduct.dimensions.height]
                          .filter((v) => v !== undefined)
                          .join(' x ')}
                      </span>
                    </div>
                  )}
                  {displayProduct.tags && displayProduct.tags.length > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">Tags:</span>
                      <span className="text-gray-600 text-sm sm:text-base text-right">{displayProduct.tags.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'how_to_use' && (
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">How to use</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{displayProduct.how_to_use || 'Apply as directed.'}</p>
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Ingredients</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{displayProduct.ingredients || 'Refer to packaging for full ingredients list.'}</p>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="space-y-4 sm:space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-4 sm:pb-6 last:border-b-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <span className="font-medium text-gray-900 text-sm sm:text-base">{review.name}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'h-3 w-3 sm:h-4 sm:w-4',
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Customer Reviews</h3>
            <div className="space-y-4 sm:space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 sm:pb-6 last:border-b-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{review.name}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3 sm:h-4 sm:w-4",
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
