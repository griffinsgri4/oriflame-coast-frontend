'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash, Users, Mail, Phone, MapPin } from 'lucide-react';
import { withAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Role options for filter
  const roles = ['All', 'customer', 'admin'];

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        per_page: 10,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedRole !== 'All') params.role = selectedRole;
      
      const response = await api.users.getAll(params);
      
      if (response.data) {
        setCustomers(response.data);
        setTotalPages(response.meta?.last_page || 1);
      }
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load customers on component mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm, selectedRole]);

  // Handle customer deletion
  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await api.users.delete(parseInt(customerId));
      fetchCustomers(); // Refresh the list
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      setError('Failed to delete customer. Please try again.');
    }
  };

  // Handle view details
  const handleViewDetails = async (customer: User) => {
    try {
      const response = await api.users.getById(parseInt(customer.id));
      setSelectedCustomer(response.data);
      setShowDetailsModal(true);
    } catch (err: any) {
      console.error('Error fetching customer details:', err);
      setError('Failed to load customer details.');
    }
  };

  // Get role badge color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] rounded-xl p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
            <p className="text-green-100">Manage customer accounts and information</p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
            <div className="text-sm text-green-100">Total Customers</div>
            <div className="text-2xl font-bold">{customers.length}</div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all duration-200"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent transition-all duration-200"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'All' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Joined</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer, index) => (
                <tr key={customer.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#4CAF50] to-[#45a049] rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{customer.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(customer.role)}`}>
                      {customer.role.charAt(0).toUpperCase() + customer.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="p-2 rounded-lg hover:bg-[#4CAF50]/10 text-gray-600 hover:text-[#4CAF50] transition-all duration-200"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Details</span>
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all duration-200"
                        disabled={customer.role === 'admin'}
                      >
                        <Trash className="h-4 w-4" />
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages}
          </p>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4CAF50] hover:text-white hover:border-[#4CAF50] transition-all duration-200"
            >
              <span className="sr-only">Previous</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg bg-gradient-to-r from-[#4CAF50] to-[#45a049] text-sm font-semibold text-white shadow-md">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4CAF50] hover:text-white hover:border-[#4CAF50] transition-all duration-200"
            >
              <span className="sr-only">Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Customer Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#4CAF50] to-[#45a049] rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedCustomer.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedCustomer.role)}`}>
                    {selectedCustomer.role.charAt(0).toUpperCase() + selectedCustomer.role.slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{selectedCustomer.email}</div>
                  </div>
                </div>

                {selectedCustomer.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">{selectedCustomer.phone}</div>
                    </div>
                  </div>
                )}

                {selectedCustomer.address && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Address</div>
                      <div className="font-medium">{selectedCustomer.address}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Member Since</div>
                    <div className="font-medium">{new Date(selectedCustomer.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCustomer(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(AdminCustomersPage, '/login');