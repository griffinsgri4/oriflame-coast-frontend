'use client';

import Link from 'next/link';
import { User, ShoppingBag, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <div className="relative isolate">
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/dashboard/dashboard-lilian.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/85 via-white/70 to-white/90 dark:from-black/65 dark:via-black/55 dark:to-black/70" />

      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 rounded-xl border bg-card/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60 p-4 md:p-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-medium">{user?.name || 'Account'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email || ''}</p>
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
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <Settings className="h-4 w-4" />
                Account Settings
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </aside>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
