'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { Product } from '@/lib/types';
import AddToCartButton from '@/components/cart/AddToCartButton';

// Category configuration with subcategories
const categoryConfig = {
  skincare: {
    name: 'Skincare',
    description: 'Nourish and protect your skin with our premium skincare collection',
    subcategories: ['Face Care', 'Eye Care', 'Body Care', 'Sun Care', 'Anti-Aging'],
    icon: '🧴'
  },
  makeup: {
    name: 'Makeup',
    description: 'Express your beauty with our vibrant makeup collection',
    subcategories: ['Face', 'Eyes', 'Lips', 'Nails', 'Tools & Brushes'],
    icon: '💄'
  },
  fragrance: {
    name: 'Fragrance',
    description: 'Discover captivating scents for every occasion',
    subcategories: ['Women', 'Men', 'Unisex', 'Body Mist', 'Gift Sets'],
    icon: '🌸'
  },
  'body-care': {
    name: 'Body Care',
    description: 'Pamper your body with luxurious care products',
    subcategories: ['Body Lotion', 'Body Wash', 'Hand Care', 'Foot Care', 'Exfoliants'],
    icon: '🧴'
  },
  'hair-care': {
    name: 'Hair Care',
    description: 'Achieve beautiful, healthy hair with our professional range',
    subcategories: ['Shampoo', 'Conditioner', 'Styling', 'Treatments', 'Hair Tools'],
    icon: '💇‍♀️'
  }
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.slug as string;
  
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);

  const category = categoryConfig[categorySlug as keyof typeof categoryConfig];

  // Redirect if category doesn't exist
  useEffect(() => {
    if (!category) {
      router.push('/shop');
    }
  }, [category, router]);

  // Mock products for the category
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Hydrating Face Cream',
      sku: 'HFC-001',
      description: 'A luxurious moisturizing cream that deeply hydrates and nourishes your skin.',
      price: 29.99,
      image: '/api/placeholder/300/300',
      category: 'Skincare',
      attributes: { skin_type: 'all', volume: '50ml', spf: false, subcategory: 'Face Care' },
      stock: 50,
      featured: true,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Vitamin C Serum',
      sku: 'VCS-002',
      description: 'Brightening serum with vitamin C to even skin tone and reduce dark spots.',
      price: 39.99,
      image: '/api/placeholder/300/300',
      category: 'Skincare',
      attributes: { skin_type: 'all', volume: '30ml', vitamin_c: '20%', subcategory: 'Face Care' },
      stock: 30,
      featured: false,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Anti-Aging Eye Cream',
      sku: 'AEC-003',
      description: 'Reduce fine lines and dark circles with this powerful eye cream.',
      price: 45.99,
      image: '/api/placeholder/300/300',
      category: 'Skincare',
      attributes: { skin_type: 'mature', volume: '15ml', anti_aging: true, subcategory: 'Eye Care' },
      stock: 25,
      featured: true,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Nourishing Body Lotion',
      sku: 'NBL-004',
      description: 'Rich body lotion with natural ingredients for soft, smooth skin.',
      price: 24.99,
      image: '/api/placeholder/300/300',
      category: 'Body Care',
      attributes: { skin_type: 'dry', volume: '200ml', natural: true, subcategory: 'Body Lotion' },
      stock: 60,
      featured: false,
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  // Filter products based on category and subcategory
  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = product.category.toLowerCase().replace(' ', '-') === categorySlug;
    const matchesSubcategory = selectedSubcategory === 'All' || 
      product.attributes?.subcategory === selectedSubcategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesCategory && matchesSubcategory && matchesSearch && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'featured':
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-[#4CAF50] transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/shop" className="text-gray-500 hover:text-[#4CAF50] transition-colors">
              Shop
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">{category.icon}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {category.description}
            </p>
            <div className="mt-6">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                {sortedProducts.length} products available
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-80 space-y-6">
            {/* Subcategories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Subcategories</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setSelectedSubcategory('All')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                      selectedSubcategory === 'All' 
                        ? 'bg-[#4CAF50] text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#4CAF50]'
                    }`}
                  >
                    All {category.name}
                  </button>
                </li>
                {category.subcategories.map((subcategory) => (
                  <li key={subcategory}>
                    <button 
                      onClick={() => setSelectedSubcategory(subcategory)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                        selectedSubcategory === subcategory 
                          ? 'bg-[#4CAF50] text-white shadow-md' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-[#4CAF50]'
                      }`}
                    >
                      {subcategory}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Price Range</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Min</label>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50]"
                      min="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">Max</label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50]"
                      min="0"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Showing products from ${priceRange[0]} to ${priceRange[1]}
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Sort By</h3>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="featured">Featured First</option>
              </select>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder={`Search in ${category.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] transition-colors text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSubcategory === 'All' ? category.name : selectedSubcategory}
                </h2>
                <p className="text-gray-600 mt-1">
                  {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search criteria.
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedSubcategory('All');
                      setSearchQuery('');
                      setPriceRange([0, 100]);
                    }}
                    className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] text-white px-6 py-3 rounded-lg font-medium hover:from-[#45a049] hover:to-[#6d4bb8] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedProducts.map((product) => (
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
                    <div className="p-6">
                      <div className="mb-3">
                        <span className="text-xs font-medium text-[#7E57C2] bg-[#7E57C2]/10 px-2 py-1 rounded-full">
                          {product.attributes?.subcategory || product.category}
                        </span>
                      </div>
                      <Link href={`/shop/${product.id}`}>
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-[#4CAF50] transition-colors cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-[#4CAF50]">${product.price}</span>
                          <span className="text-xs text-gray-500">Free shipping</span>
                        </div>
                        <AddToCartButton 
                          product={product}
                          variant="compact"
                          className="bg-gradient-to-r from-[#4CAF50] to-[#7E57C2] hover:from-[#45a049] hover:to-[#6d4bb8] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}