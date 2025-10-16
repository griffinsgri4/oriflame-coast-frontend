'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  image: string;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
  user: string;
}

const InventoryPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'movements' | 'alerts'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockUpdate, setShowStockUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Optimals Hydra Radiance Day Cream',
        sku: 'OPT-001',
        category: 'Skincare',
        price: 2500,
        stock: 45,
        lowStockThreshold: 10,
        status: 'in_stock',
        lastUpdated: '2024-01-15T10:30:00Z',
        image: '/api/placeholder/100/100'
      },
      {
        id: '2',
        name: 'The ONE Colour Unlimited Lipstick',
        sku: 'ONE-002',
        category: 'Makeup',
        price: 1800,
        stock: 8,
        lowStockThreshold: 15,
        status: 'low_stock',
        lastUpdated: '2024-01-14T15:45:00Z',
        image: '/api/placeholder/100/100'
      },
      {
        id: '3',
        name: 'Love Nature Shampoo',
        sku: 'LN-003',
        category: 'Hair Care',
        price: 1200,
        stock: 0,
        lowStockThreshold: 5,
        status: 'out_of_stock',
        lastUpdated: '2024-01-13T09:15:00Z',
        image: '/api/placeholder/100/100'
      },
      {
        id: '4',
        name: 'Giordani Gold Perfume',
        sku: 'GG-004',
        category: 'Fragrance',
        price: 4500,
        stock: 25,
        lowStockThreshold: 8,
        status: 'in_stock',
        lastUpdated: '2024-01-15T14:20:00Z',
        image: '/api/placeholder/100/100'
      },
      {
        id: '5',
        name: 'NovAge Serum',
        sku: 'NA-005',
        category: 'Skincare',
        price: 3200,
        stock: 12,
        lowStockThreshold: 20,
        status: 'low_stock',
        lastUpdated: '2024-01-14T11:30:00Z',
        image: '/api/placeholder/100/100'
      }
    ];

    const mockMovements: StockMovement[] = [
      {
        id: '1',
        productId: '1',
        productName: 'Optimals Hydra Radiance Day Cream',
        type: 'in',
        quantity: 50,
        reason: 'New stock delivery',
        date: '2024-01-15T10:30:00Z',
        user: 'Admin'
      },
      {
        id: '2',
        productId: '2',
        productName: 'The ONE Colour Unlimited Lipstick',
        type: 'out',
        quantity: 7,
        reason: 'Customer orders',
        date: '2024-01-14T15:45:00Z',
        user: 'System'
      },
      {
        id: '3',
        productId: '3',
        productName: 'Love Nature Shampoo',
        type: 'out',
        quantity: 5,
        reason: 'Customer orders',
        date: '2024-01-13T09:15:00Z',
        user: 'System'
      }
    ];

    setProducts(mockProducts);
    setStockMovements(mockMovements);
    setLoading(false);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const lowStockProducts = products.filter(p => p.status === 'low_stock');
  const outOfStockProducts = products.filter(p => p.status === 'out_of_stock');
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-800 bg-green-100';
      case 'low_stock': return 'text-yellow-800 bg-yellow-100';
      case 'out_of_stock': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return status;
    }
  };

  const handleStockUpdate = (productId: string, newStock: number, reason: string) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const updatedProduct = {
          ...product,
          stock: newStock,
          status: newStock === 0 ? 'out_of_stock' as const :
                   newStock <= product.lowStockThreshold ? 'low_stock' as const :
                   'in_stock' as const,
          lastUpdated: new Date().toISOString()
        };
        return updatedProduct;
      }
      return product;
    }));

    // Add stock movement record
    const movement: StockMovement = {
      id: Date.now().toString(),
      productId,
      productName: products.find(p => p.id === productId)?.name || '',
      type: 'adjustment',
      quantity: newStock,
      reason,
      date: new Date().toISOString(),
      user: 'Admin'
    };
    setStockMovements(prev => [movement, ...prev]);
    setShowStockUpdate(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage your product inventory</p>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'products', label: 'Products', icon: '📦' },
                { id: 'movements', label: 'Stock Movements', icon: '📋' },
                { id: 'alerts', label: 'Alerts', icon: '⚠️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">📦</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-semibold text-gray-900">KSh {totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Low Stock</p>
                    <p className="text-2xl font-semibold text-gray-900">{lowStockProducts.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">🚫</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                    <p className="text-2xl font-semibold text-gray-900">{outOfStockProducts.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Stock Movements */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Stock Movements</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stockMovements.slice(0, 5).map((movement) => (
                      <tr key={movement.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {movement.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                            movement.type === 'in' ? 'text-green-800 bg-green-100' :
                            movement.type === 'out' ? 'text-red-800 bg-red-100' :
                            'text-blue-800 bg-blue-100'
                          )}>
                            {movement.type === 'in' ? 'Stock In' : movement.type === 'out' ? 'Stock Out' : 'Adjustment'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movement.type === 'out' ? '-' : '+'}{movement.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {movement.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(movement.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Add Product
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt={product.name} />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">KSh {product.price.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(typeof product.stock === 'number' ? product.stock : product.stock?.quantity) ?? 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn("inline-flex px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(product.status))}>
                            {getStatusLabel(product.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setShowStockUpdate(product.id)}
                            className="text-primary hover:text-primary/90 mr-4"
                          >
                            Update Stock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Stock Movements Tab */}
        {activeTab === 'movements' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Stock Movements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockMovements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {movement.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                          movement.type === 'in' ? 'text-green-800 bg-green-100' :
                          movement.type === 'out' ? 'text-red-800 bg-red-100' :
                          'text-blue-800 bg-blue-100'
                        )}>
                          {movement.type === 'in' ? 'Stock In' : movement.type === 'out' ? 'Stock Out' : 'Adjustment'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {movement.type === 'out' ? '-' : '+'}{movement.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(movement.date).toLocaleDateString()} {new Date(movement.date).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Low Stock Alerts ({lowStockProducts.length})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <img className="h-12 w-12 rounded-md object-cover" src={product.image} alt={product.name} />
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-500">
                              Current stock: {(typeof product.stock === 'number' ? product.stock : product.stock?.quantity) ?? 0} | Threshold: {product.lowStockThreshold}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowStockUpdate(product.id)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                        >
                          Restock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Out of Stock Alerts */}
            {outOfStockProducts.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <span className="mr-2">🚫</span>
                    Out of Stock Alerts ({outOfStockProducts.length})
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {outOfStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                          <img className="h-12 w-12 rounded-md object-cover" src={product.image} alt={product.name} />
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-500">Product is completely out of stock</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowStockUpdate(product.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Urgent Restock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
              <div className="bg-white shadow rounded-lg p-12 text-center">
                <div className="text-green-500 text-6xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
                <p className="text-gray-500">No stock alerts at the moment. All products are well stocked.</p>
              </div>
            )}
          </div>
        )}

        {/* Stock Update Modal */}
        {showStockUpdate && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Stock</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newStock = parseInt(formData.get('stock') as string);
                  const reason = formData.get('reason') as string;
                  handleStockUpdate(showStockUpdate, newStock, reason);
                }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason
                    </label>
                    <input
                      type="text"
                      name="reason"
                      required
                      placeholder="e.g., New delivery, Stock adjustment"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowStockUpdate(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      Update Stock
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(InventoryPage);