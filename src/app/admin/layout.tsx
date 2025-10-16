import Link from 'next/link';
import { Package, ShoppingBag, Users, BarChart, Settings, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#4CAF50] to-[#45a049] shadow-xl p-6 hidden md:block">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <Package className="h-5 w-5 text-[#4CAF50]" />
          </div>
          <h1 className="text-xl font-bold text-white">Oriflame Admin</h1>
        </div>
        
        <nav className="space-y-2">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium bg-white/20 text-white shadow-md backdrop-blur-sm border border-white/10"
          >
            <Package className="h-4 w-4" />
            Products
          </Link>
          <Link 
            href="/admin/orders" 
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <ShoppingBag className="h-4 w-4" />
            Orders
          </Link>
          <Link 
            href="/admin/customers" 
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <Users className="h-4 w-4" />
            Customers
          </Link>
          <Link 
            href="/admin/analytics" 
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <BarChart className="h-4 w-4" />
            Analytics
          </Link>
          <Link 
            href="/admin/settings" 
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
        
        <div className="absolute bottom-6 w-52">
          <Link 
            href="/" 
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200 border border-red-200/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-[#4CAF50] to-[#45a049] shadow-lg z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center mr-2">
              <Package className="h-4 w-4 text-[#4CAF50]" />
            </div>
            <h1 className="text-lg font-bold text-white">Oriflame Admin</h1>
          </div>
          <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 md:pt-6 mt-16 md:mt-0 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}