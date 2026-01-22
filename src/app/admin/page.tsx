'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash, AlertTriangle, Package } from 'lucide-react';
import { withAdmin } from '@/contexts/AuthContext';
import { api, handleApiError, isApiError } from '@/lib/api';
import { Product } from '@/lib/types';
import { PageLoading } from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
    image: ''
  });

  // Categories for filter dropdown
  const categories = ['All', 'Skincare', 'Makeup', 'Fragrance', 'Body Care', 'Hair Care'];

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        per_page: 10,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      
      const response = await api.products.getAll(params);
      
      if (response.data) {
        setProducts(response.data.data || []);
        setTotalPages(response.data.meta?.last_page || 1);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory]);

  // Handle form submission for adding/editing products
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // For updates vs creates, map quantity to stock appropriately
      if (editingProduct) {
        const updateData = {
          name: formData.name,
          sku: formData.sku,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          image: formData.image || '/api/placeholder/300/300',
        };
        await api.products.update(Number(editingProduct.id), updateData);

        const stockId = typeof editingProduct.stock === 'object' && editingProduct.stock ? (editingProduct.stock as any).id : null;
        if (stockId) {
          await api.stock.update(Number(stockId), Number(formData.quantity));
        }
      } else {
        const createData = {
          name: formData.name,
          sku: formData.sku,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          quantity: Number(formData.quantity),
          image: formData.image || '/api/placeholder/300/300',
        };
        await api.products.create(createData);
      }

      // Reset form and close modal
      setFormData({
        name: '',
        sku: '',
        description: '',
        price: '',
        category: '',
        quantity: '',
        image: ''
      });
      setShowAddModal(false);
      setEditingProduct(null);
      
      // Refresh products list
      fetchProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      if (isApiError(err)) {
        setError(handleApiError(err));
      } else {
        setError('Failed to save product. Please try again.');
      }
    }
  };

  // Handle product deletion
  const handleDelete = async (productId: number | string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.products.delete(Number(productId));
      fetchProducts(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
    }
  };

  // Handle edit button click
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      quantity: ((typeof product.stock === 'number' ? product.stock : (product.stock as any)?.quantity) ?? 0).toString(),
      image: product.image || ''
    });
    setShowAddModal(true);
  };

  // Get low stock count
  const lowStockCount = products.filter(p => (((typeof p.stock === 'number' ? p.stock : p.stock?.quantity) ?? 0) < 20)).length;
  
  if (loading && products.length === 0) {
    return <PageLoading text="Loading products..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] rounded-xl p-4 sm:p-6 lg:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Product Management</h1>
            <p className="text-green-100 text-sm sm:text-base">Manage your product catalog and inventory</p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                sku: '',
                description: '',
                price: '',
                category: '',
                quantity: '',
                image: ''
              });
              setShowAddModal(true);
            }}
            className="bg-white text-[#4CAF50] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <ErrorDisplay
          message={error}
          variant="error"
          showRetry
          onRetry={fetchProducts}
          showDismiss
          onDismiss={() => setError(null)}
        />
      )}

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-900">Low Stock Alert</h3>
              <p className="text-amber-700">
                {lowStockCount} product{lowStockCount !== 1 ? 's' : ''} running low on stock
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all duration-200"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all duration-200"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-900 text-xs sm:text-sm">Product</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-900 text-xs sm:text-sm hidden sm:table-cell">Category</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-gray-900 text-xs sm:text-sm">Price</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 text-xs sm:text-sm">Stock</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-900 text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product, index) => (
                <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img
                        src={product.image || '/api/placeholder/50/50'}
                        alt={product.name}
                        className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">{product.name}</div>
                        <div className="text-xs text-gray-500 truncate">{product.sku || `SKU-${product.id}`}</div>
                        <div className="sm:hidden mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#7E57C2]/10 text-[#7E57C2]">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#7E57C2]/10 text-[#7E57C2]">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <span className="font-semibold text-[#4CAF50] text-xs sm:text-sm">${Number(product.price).toFixed(2)}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                    {(() => {
                      const qty = ((typeof product.stock === 'number' ? product.stock : product.stock?.quantity) ?? 0);
                      return (
                        <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                          qty < 20 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          <span className="hidden sm:inline">{qty} units</span>
                          <span className="sm:hidden">{qty}</span>
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex justify-center gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-[#4CAF50]/10 text-gray-600 hover:text-[#4CAF50] transition-all duration-200"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all duration-200"
                      >
                        <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            Showing page {currentPage} of {totalPages}
          </p>
          <nav className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4CAF50] hover:text-white hover:border-[#4CAF50] transition-all duration-200"
            >
              <span className="sr-only">Previous</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 sm:h-4 sm:w-4">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#4CAF50] to-[#45a049] text-xs sm:text-sm font-semibold text-white shadow-md">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4CAF50] hover:text-white hover:border-[#4CAF50] transition-all duration-200"
            >
              <span className="sr-only">Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 sm:h-4 sm:w-4">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors text-sm font-medium"
                >
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdmin(AdminProductsPage, '/login');
