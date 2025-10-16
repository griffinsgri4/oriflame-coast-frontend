'use client';

import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { withAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock order data as fallback
  const mockOrders = [
    { id: 'ORD-1234', customer: 'Jane Smith', date: '2023-10-05', total: 78.97, status: 'delivered' },
    { id: 'ORD-1235', customer: 'John Doe', date: '2023-10-05', total: 124.50, status: 'processing' },
    { id: 'ORD-1236', customer: 'Alice Johnson', date: '2023-10-04', total: 54.25, status: 'shipped' },
    { id: 'ORD-1237', customer: 'Robert Brown', date: '2023-10-04', total: 210.99, status: 'processing' },
    { id: 'ORD-1238', customer: 'Emily Davis', date: '2023-10-03', total: 45.50, status: 'delivered' },
    { id: 'ORD-1239', customer: 'Michael Wilson', date: '2023-10-02', total: 89.99, status: 'delivered' },
    { id: 'ORD-1240', customer: 'Sarah Taylor', date: '2023-10-01', total: 132.75, status: 'cancelled' },
  ];

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        per_page: 10,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedStatus !== 'All') params.status = selectedStatus.toLowerCase();
      
      const response = await api.orders.getAll(params);
      
      if (response.data) {
        // Transform the data to match the expected format
        const transformedOrders = response.data.map((order: any) => ({
          id: order.order_number || order.id,
          customer: order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Unknown Customer',
          date: new Date(order.created_at).toLocaleDateString(),
          total: parseFloat(order.total),
          status: order.status
        }));
        
        setOrders(transformedOrders);
        setTotalPages(response.meta?.last_page || 1);
      } else {
        // Fallback to mock data
        setOrders(mockOrders);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      // Fallback to mock data on error
      setOrders(mockOrders);
      setError('Using sample data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Load orders on component mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, selectedStatus]);

  // Status badge color mapping
   const getStatusColor = (status: string) => {
     switch (status.toLowerCase()) {
       case 'delivered':
         return 'bg-green-100 text-green-800';
       case 'processing':
         return 'bg-blue-100 text-blue-800';
       case 'shipped':
         return 'bg-purple-100 text-purple-800';
       case 'cancelled':
         return 'bg-red-100 text-red-800';
       default:
         return 'bg-gray-100 text-gray-800';
     }
   };

   // Handle search input change
   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     setSearchTerm(e.target.value);
     setCurrentPage(1); // Reset to first page when searching
   };

   // Handle status filter change
   const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     setSelectedStatus(e.target.value);
     setCurrentPage(1); // Reset to first page when filtering
   };

   // Handle pagination
   const handlePageChange = (page: number) => {
     setCurrentPage(page);
   };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] rounded-xl p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Management</h1>
            <p className="text-green-100">Track and manage all customer orders</p>
          </div>
        </div>
      </div>

      {/* Search and filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search orders by ID, customer name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all duration-200"
            />
          </div>
          <select 
            value={selectedStatus}
            onChange={handleStatusChange}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all duration-200"
          >
            <option value="All">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8 mt-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50] mx-auto mb-4"></div>
              <p className="text-gray-500">Loading orders...</p>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-[#4CAF50] hover:text-[#45a049] flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * 10, orders.length)}</span> of{' '}
            <span className="font-medium">{orders.length}</span> orders
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === page
                      ? 'bg-[#4CAF50] text-white border-[#4CAF50]'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default withAuth(AdminOrdersPage, '/login');