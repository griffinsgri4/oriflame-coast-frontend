'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import AddToCartButton from '@/components/cart/AddToCartButton';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured products from backend
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.products.getAll({
          featured: true,
          per_page: 4,
          page: 1
        });
        
        if (response.success && response.data) {
          setFeaturedProducts(response.data.data || []);
        } else {
          // Fallback to mock data if API fails
          setFeaturedProducts([
            { 
              id: '1', 
              name: 'Hydrating Face Cream', 
              price: 24.99, 
              image: '/api/placeholder/300/300',
              sku: 'HFC-001',
              description: 'A luxurious moisturizing cream',
              category: 'Skincare',
              attributes: {},
              stock: 50,
              featured: true,
              status: 'active'
            },
            { 
              id: '2', 
              name: 'Vitamin C Serum', 
              price: 29.99, 
              image: '/api/placeholder/300/300',
              sku: 'VCS-002',
              description: 'Brightening vitamin C serum',
              category: 'Skincare',
              attributes: {},
              stock: 30,
              featured: true,
              status: 'active'
            },
            { 
              id: '3', 
              name: 'Rejuvenating Night Cream', 
              price: 34.99, 
              image: '/api/placeholder/300/300',
              sku: 'RNC-003',
              description: 'Anti-aging night cream',
              category: 'Skincare',
              attributes: {},
              stock: 25,
              featured: true,
              status: 'active'
            },
            { 
              id: '4', 
              name: 'Exfoliating Face Scrub', 
              price: 19.99, 
              image: '/api/placeholder/300/300',
              sku: 'EFS-004',
              description: 'Gentle exfoliating scrub',
              category: 'Skincare',
              attributes: {},
              stock: 40,
              featured: true,
              status: 'active'
            },
          ]);
        }
      } catch (err: any) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products');
        // Fallback to mock data on error
        setFeaturedProducts([
          { 
            id: '1', 
            name: 'Hydrating Face Cream', 
            price: 24.99, 
            image: '/api/placeholder/300/300',
            sku: 'HFC-001',
            description: 'A luxurious moisturizing cream',
            category: 'Skincare',
            attributes: {},
            stock: 50,
            featured: true,
            status: 'active'
          },
          { 
            id: '2', 
            name: 'Vitamin C Serum', 
            price: 29.99, 
            image: '/api/placeholder/300/300',
            sku: 'VCS-002',
            description: 'Brightening vitamin C serum',
            category: 'Skincare',
            attributes: {},
            stock: 30,
            featured: true,
            status: 'active'
          },
          { 
            id: '3', 
            name: 'Rejuvenating Night Cream', 
            price: 34.99, 
            image: '/api/placeholder/300/300',
            sku: 'RNC-003',
            description: 'Anti-aging night cream',
            category: 'Skincare',
            attributes: {},
            stock: 25,
            featured: true,
            status: 'active'
          },
          { 
            id: '4', 
            name: 'Exfoliating Face Scrub', 
            price: 19.99, 
            image: '/api/placeholder/300/300',
            sku: 'EFS-004',
            description: 'Gentle exfoliating scrub',
            category: 'Skincare',
            attributes: {},
            stock: 40,
            featured: true,
            status: 'active'
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="flex flex-col gap-8 lg:gap-12 pb-8">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] bg-gradient-to-br from-[#4CAF50]/10 via-white to-[#7E57C2]/10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%234CAF50%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center relative z-10 py-12 sm:py-16 lg:py-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl space-y-6 sm:space-y-8"
          >
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                Discover Your 
                <span className="text-[#4CAF50] block">Natural Beauty</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Premium beauty products from Oriflame Coast Region. Enhance your natural beauty with our carefully crafted, sustainable products that celebrate your unique radiance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link 
                href="/shop" 
                className="inline-flex h-12 sm:h-14 items-center justify-center rounded-full bg-[#4CAF50] px-6 sm:px-8 text-base sm:text-lg font-semibold text-white shadow-lg transition-all hover:bg-[#45a049] hover:shadow-xl transform hover:-translate-y-1"
              >
                Shop Now
              </Link>
              <Link 
                href="/about" 
                className="inline-flex h-12 sm:h-14 items-center justify-center rounded-full border-2 border-[#7E57C2] bg-white px-6 sm:px-8 text-base sm:text-lg font-semibold text-[#7E57C2] shadow-md transition-all hover:bg-[#7E57C2] hover:text-white transform hover:-translate-y-1"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 right-0 w-1/4 sm:w-1/3 h-full bg-gradient-to-l from-[#7E57C2]/20 to-transparent"></div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 lg:mb-12 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-sm sm:text-base text-gray-600">Discover our most popular beauty essentials</p>
            {error && (
              <p className="text-sm text-amber-600 mt-2">
                {error} - Showing sample products
              </p>
            )}
          </div>
          <Link 
            href="/shop" 
            className="text-base sm:text-lg font-semibold text-[#4CAF50] hover:text-[#45a049] transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            View All
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="group rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4 sm:p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group rounded-2xl border border-gray-200 bg-white shadow-lg hover:shadow-xl overflow-hidden"
              >
                <Link href={`/shop/${product.id}`} className="block">
                  <div className="aspect-square bg-gradient-to-br from-[#4CAF50]/10 to-[#7E57C2]/10 relative">
                    {product.image && product.image !== '/api/placeholder/300/300' ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl text-gray-400">📦</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4CAF50]/20 to-[#7E57C2]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                </Link>
                <div className="p-4 sm:p-6">
                  <Link href={`/shop/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2 hover:text-[#4CAF50] transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-xl sm:text-2xl font-bold text-[#4CAF50] mb-3 sm:mb-4">${product.price}</p>
                  <AddToCartButton 
                    product={product}
                    className="w-full rounded-full bg-[#4CAF50] px-4 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-md hover:bg-[#45a049] hover:shadow-lg transition-all transform hover:-translate-y-1"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-[#4CAF50]/5 to-[#7E57C2]/5 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 lg:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Oriflame Coast</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              We're committed to bringing you the finest beauty products with values that matter
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 lg:h-18 lg:w-18 rounded-full bg-gradient-to-br from-[#4CAF50] to-[#45a049] flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-7 sm:h-7">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Natural Ingredients</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">Our products are made with carefully selected natural ingredients sourced sustainably from around the world.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 lg:h-18 lg:w-18 rounded-full bg-gradient-to-br from-[#7E57C2] to-[#6a4c93] flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-7 sm:h-7">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Cruelty Free</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">We never test our products on animals and are committed to ethical practices that respect all living beings.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1"
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 lg:h-18 lg:w-18 rounded-full bg-gradient-to-br from-[#4CAF50] to-[#7E57C2] flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-7 sm:h-7">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Quality Guaranteed</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">Every Oriflame product is crafted with precision and care, using the finest ingredients and cutting-edge technology to deliver exceptional results you can trust.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
