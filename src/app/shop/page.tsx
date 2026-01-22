'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { Product, ApiResponse, PaginatedResponse } from '@/lib/types';
import AddToCartButton from '@/components/cart/AddToCartButton';

function ShopContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [skuSearch, setSkuSearch] = useState<string>('');
  const [debouncedSkuSearch, setDebouncedSkuSearch] = useState<string>('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const sku = searchParams.get('sku') || '';
    const categoryParam = searchParams.get('category');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');

    if (q) setSearchQuery(q);
    if (sku) setSkuSearch(sku);
    if (sortParam) setSortBy(sortParam);
    if (pageParam && !isNaN(Number(pageParam))) setCurrentPage(Number(pageParam));
    if (categoryParam) {
      const toTitle = (s: string) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setSelectedCategory(toTitle(categoryParam));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL when filters change (debounced values)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
    if (debouncedSkuSearch) params.set('sku', debouncedSkuSearch);
    if (selectedCategory && selectedCategory !== 'All') {
      const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');
      params.set('category', toSlug(selectedCategory));
    }
    if (sortBy && sortBy !== 'name') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', String(currentPage));
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : '/shop', { scroll: false });
  }, [debouncedSearchQuery, debouncedSkuSearch, selectedCategory, sortBy, currentPage, router]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce SKU search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSkuSearch(skuSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [skuSearch]);



  // API call for products with fallback to mock data
  const { 
    data: productsResponse, 
    loading, 
    error, 
    refetch 
  } = useApi<ApiResponse<PaginatedResponse<Product>>>('/products', {
    page: currentPage,
    per_page: 9,
    search: debouncedSearchQuery ? debouncedSearchQuery : undefined,
    sku: debouncedSkuSearch ? debouncedSkuSearch : undefined,
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    sort: sortBy
  });

  // Use only real API data; show empty/error states when needed
  const products = productsResponse?.data?.data || [];

  const pagination = productsResponse?.data?.meta;

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSkuSearchChange = (sku: string) => {
    setSkuSearch(sku);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSkuSearch('');
    setSelectedCategory('All');
    setSortBy('name');
    setCurrentPage(1);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearchQuery, debouncedSkuSearch, sortBy]);

  const categories = ['All', 'Skincare', 'Makeup', 'Fragrance', 'Body Care', 'Hair Care'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Discover Beauty</h1>
            <p className="text-base sm:text-lg lg:text-xl opacity-90 max-w-xl lg:max-w-2xl mx-auto px-4">
              Explore our premium collection of skincare, makeup, and wellness products
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar with filters */}
          <aside className="w-full lg:w-80 space-y-4 lg:space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">Categories</h3>
              <ul className="space-y-2">
                {categories.map((category) => {
                  const categorySlug = category.toLowerCase().replace(' ', '-');
                  const categoryIcons = {
                    'skincare': '🧴',
                    'makeup': '💄',
                    'fragrance': '🌸',
                    'body-care': '🧴',
                    'hair-care': '💇‍♀️'
                  };
                  
                  return (
                    <li key={category}>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleCategoryChange(category)}
                          className={`flex-1 text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 ${
                            selectedCategory === category 
                              ? 'bg-[#4CAF50] text-white shadow-md' 
                              : 'text-gray-700 hover:bg-gray-50 hover:text-[#4CAF50]'
                          }`}
                        >
                          <span className="text-base">{categoryIcons[categorySlug as keyof typeof categoryIcons] || '📦'}</span>
                          {category}
                        </button>
                        <Link 
                          href={`/shop/category/${categorySlug}`}
                          className="p-2 text-gray-400 hover:text-[#4CAF50] transition-colors rounded-lg hover:bg-gray-50"
                          title={`Browse ${category}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
              
              {/* Category Overview Cards */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Browse by Category</h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {categories.slice(0, 4).map((category) => {
                    const categorySlug = category.toLowerCase().replace(' ', '-');
                    const categoryIcons = {
                      'skincare': '🧴',
                      'makeup': '💄',
                      'fragrance': '🌸',
                      'body-care': '🧴',
                      'hair-care': '💇‍♀️'
                    };
                    
                    return (
                      <Link 
                        key={category}
                        href={`/shop/category/${categorySlug}`}
                        className="group p-2 sm:p-3 bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-lg hover:border-[#4CAF50]/30 hover:shadow-md transition-all duration-200"
                      >
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">
                            {categoryIcons[categorySlug as keyof typeof categoryIcons] || '📦'}
                          </div>
                          <div className="text-xs font-medium text-gray-700 group-hover:text-[#4CAF50] transition-colors">
                            {category}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">Sort By</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    id="sort-name" 
                    name="sort" 
                    value="name"
                    checked={sortBy === 'name'}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="text-[#4CAF50] focus:ring-[#4CAF50]" 
                  />
                  <label htmlFor="sort-name" className="text-gray-700 cursor-pointer">Name (A-Z)</label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    id="sort-price-asc" 
                    name="sort" 
                    value="price_asc"
                    checked={sortBy === 'price_asc'}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="text-[#4CAF50] focus:ring-[#4CAF50]" 
                  />
                  <label htmlFor="sort-price-asc" className="text-gray-700 cursor-pointer">Price (Low to High)</label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    id="sort-price-desc" 
                    name="sort" 
                    value="price_desc"
                    checked={sortBy === 'price_desc'}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="text-[#4CAF50] focus:ring-[#4CAF50]" 
                  />
                  <label htmlFor="sort-price-desc" className="text-gray-700 cursor-pointer">Price (High to Low)</label>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    id="sort-featured" 
                    name="sort" 
                    value="featured"
                    checked={sortBy === 'featured'}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="text-[#4CAF50] focus:ring-[#4CAF50]" 
                  />
                  <label htmlFor="sort-featured" className="text-gray-700 cursor-pointer">Featured First</label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">Quick Actions</h3>
              <select 
                value={sortBy} 
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
              >
                <option value="name">Sort by Name</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="featured">Featured Products</option>
              </select>
            </div>
          </aside>
          
          {/* Product grid */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="space-y-3 sm:space-y-4">
                {/* Main Search Bar */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search for skincare, makeup, fragrance..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                    />
                    {searchQuery !== debouncedSearchQuery && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#4CAF50]"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Advanced Search Toggle */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="flex items-center gap-2 text-[#4CAF50] hover:text-[#45a049] transition-colors"
                  >
                    <svg className={`h-4 w-4 transition-transform ${showAdvancedSearch ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="text-sm font-medium">Advanced Search</span>
                  </button>
                  
                  {(searchQuery || skuSearch || selectedCategory !== 'All') && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
                
                {/* Advanced Search Options */}
                {showAdvancedSearch && (
                  <div className="border-t border-gray-100 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {/* SKU Search */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search by SKU
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Enter product SKU..."
                            value={skuSearch}
                            onChange={(e) => handleSkuSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
                          />
                          {skuSearch !== debouncedSkuSearch && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4CAF50]"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Search Tips */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search Tips
                        </label>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>• Use the main search for product names and descriptions</p>
                          <p>• Use SKU search for specific product codes</p>
                          <p>• Combine with category filters for better results</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">All Products</h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Discover our premium beauty collection</p>
              </div>
              <div className="bg-[#4CAF50] text-white px-3 sm:px-4 py-2 rounded-full self-start sm:self-auto">
                <span className="font-medium text-sm sm:text-base">{products.length} products</span>
              </div>
            </div>
          
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <div className="p-4 sm:p-6">
                      <div className="h-4 bg-gray-200 rounded-full mb-3 w-16"></div>
                      <div className="h-5 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 sm:py-12 lg:py-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load products</h3>
                  <p className="text-gray-600 mb-4">There was an error loading the products. Please try again.</p>
                  <button 
                    onClick={() => refetch()}
                    className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white px-6 py-3 rounded-lg font-medium hover:from-[#45a049] hover:to-[#6d4bb8] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 sm:py-12 lg:py-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery || skuSearch || selectedCategory !== 'All' 
                      ? "Try adjusting your search criteria or filters." 
                      : "No products are currently available."
                    }
                  </p>
                  {(searchQuery || skuSearch || selectedCategory !== 'All') && (
                    <button 
                      onClick={clearAllFilters}
                      className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white px-6 py-3 rounded-lg font-medium hover:from-[#45a049] hover:to-[#6d4bb8] transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {products.map((product) => (
                  <div key={product.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#4CAF50]/20 transition-all duration-300 transform hover:-translate-y-1">
                    <Link href={`/shop/${product.id}`} className="block">
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.featured && (
                          <span className="absolute top-3 left-3 bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white px-3 py-1 text-xs font-medium rounded-full shadow-lg">
                            Featured
                          </span>
                        )}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={(e) => e.preventDefault()}
                            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4 sm:p-6">
                      <div className="mb-2 sm:mb-3">
                        <span className="text-xs font-medium text-[#7E57C2] bg-[#7E57C2]/10 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                      <Link href={`/shop/${product.id}`}>
                        <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 group-hover:text-[#4CAF50] transition-colors cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xl sm:text-2xl font-bold text-[#4CAF50]">${product.price}</span>
                          <span className="text-xs text-gray-500">Free shipping</span>
                        </div>
                        <AddToCartButton 
                          product={product}
                          className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] hover:from-[#45a049] hover:to-[#6d4bb8] text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && !error && products.length > 0 && pagination && (
              <div className="flex justify-center mt-8 sm:mt-12">
                <nav className="flex items-center gap-1 sm:gap-2">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-gray-200 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4CAF50] hover:text-white hover:border-[#4CAF50] transition-all duration-200"
                  >
                    <span className="sr-only">Previous</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 sm:h-4 sm:w-4">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  
                  {[...Array(Math.min(5, pagination.last_page))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`inline-flex h-8 min-w-[2rem] sm:h-10 sm:min-w-[2.5rem] items-center justify-center rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                          currentPage === page 
                            ? 'bg-[#4CAF50] text-white shadow-md' 
                            : 'border border-gray-200 hover:bg-[#4CAF50] hover:text-white hover:border-[#4CAF50]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= pagination.last_page}
                    className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-gray-200 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4CAF50] hover:text-white hover:border-[#4CAF50] transition-all duration-200"
                  >
                    <span className="sr-only">Next</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 sm:h-4 sm:w-4">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div></div>}>
      <ShopContent />
    </Suspense>
  );
}
