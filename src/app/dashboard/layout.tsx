import Link from 'next/link';
import { User, ShoppingBag, Heart, Settings, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-medium">Jane Smith</h2>
              <p className="text-sm text-muted-foreground">jane.smith@example.com</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-primary text-primary-foreground"
            >
              <ShoppingBag className="h-4 w-4" />
              My Orders
            </Link>
            <Link 
              href="/dashboard/wishlist" 
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <Heart className="h-4 w-4" />
              Wishlist
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              Account Settings
            </Link>
            <Link 
              href="/" 
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}