'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User, Search, LogOut, Settings, Package, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import CartIcon from '@/components/cart/CartIcon';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Add missing router and search state
  const router = useRouter();
  const [desktopSearch, setDesktopSearch] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const submitSearch = (query: string) => {
    const q = query.trim();
    if (!q) return;
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  };

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const [logoUrl, setLogoUrl] = useState<string | null>('/oriflame-logo.png');

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await api.settings.getAll();
        const url = res?.data?.general?.site_logo_url;
        if (url) setLogoUrl(url);
      } catch (e) {
        // silently ignore; keep default
      }
    };
    fetchLogo();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-8 max-w-[1280px]">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-6 lg:gap-10">
              <Link href="/" aria-label="Oriflame Sweden" className="flex items-center space-x-2 flex-shrink-0">
                <Image
                  src={logoUrl || '/oriflame-logo.png'}
                  alt="Oriflame"
                  width={180}
                  height={40}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain"
                />
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex gap-7 xl:gap-9">
                <Link href="/shop" className="text-sm tracking-wide font-medium text-gray-700 hover:text-[#4CAF50] transition-colors">
                  Shop
                </Link>
                <Link href="/shop/categories" className="text-sm tracking-wide font-medium text-gray-700 hover:text-[#4CAF50] transition-colors">
                  Categories
                </Link>
                <Link href="/about" className="text-sm tracking-wide font-medium text-gray-700 hover:text-[#4CAF50] transition-colors">
                  About
                </Link>
                <Link href="/contact" className="text-sm tracking-wide font-medium text-gray-700 hover:text-[#4CAF50] transition-colors">
                  Contact
                </Link>
              </nav>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Search */}
              <div className="relative hidden lg:flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search products..."
                  aria-label="Search products"
                  value={desktopSearch}
                  onChange={(e) => setDesktopSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitSearch(desktopSearch);
                  }}
                  className="w-64 xl:w-[380px] rounded-full border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-gray-50 placeholder:text-gray-400"
                />
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Search className="h-5 w-5 text-gray-600" />
              </button>

              {/* Cart Icon */}
              <CartIcon />
              
              {/* Desktop User Authentication */}
              {isAuthenticated ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#4CAF50] rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">{user?.name}</span>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#4CAF50] hover:text-white transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#4CAF50] hover:text-white transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="h-4 w-4" />
                          My Orders
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#4CAF50] hover:text-white transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <hr className="my-1 border-gray-200" />
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-700 hover:text-[#4CAF50] transition-colors px-3 py-2"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-[#4CAF50] text-white px-4 lg:px-6 py-2 rounded-full text-sm font-medium hover:bg-[#45a049] transition-colors shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isMobileSearchOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search products..."
                  aria-label="Search products"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitSearch(mobileSearch);
                  }}
                  className="w-full rounded-full border border-gray-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-gray-50"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu} />
          <div className="fixed top-16 left-0 right-0 bottom-0 bg-white overflow-y-auto">
            <div className="px-4 py-6 space-y-6">
              {/* Mobile Navigation Links */}
              <nav className="space-y-4">
                <Link
                  href="/shop"
                  className="block text-lg font-semibold text-gray-700 hover:text-[#4CAF50] transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Shop
                </Link>
                <Link
                  href="/shop/categories"
                  className="block text-lg font-semibold text-gray-700 hover:text-[#4CAF50] transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Categories
                </Link>
                <Link
                  href="/about"
                  className="block text-lg font-semibold text-gray-700 hover:text-[#4CAF50] transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block text-lg font-semibold text-gray-700 hover:text-[#4CAF50] transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Contact
                </Link>
              </nav>

              {/* Mobile User Authentication */}
              <div className="border-t border-gray-200 pt-6">
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-4">
                      <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-medium text-gray-700">{user?.name}</span>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 text-lg text-gray-700 hover:text-[#4CAF50] transition-colors py-2"
                      onClick={closeMobileMenu}
                    >
                      <Settings className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 text-lg text-gray-700 hover:text-[#4CAF50] transition-colors py-2"
                      onClick={closeMobileMenu}
                    >
                      <Package className="h-5 w-5" />
                      My Orders
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 text-lg text-gray-700 hover:text-[#4CAF50] transition-colors py-2"
                      onClick={closeMobileMenu}
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="flex items-center gap-3 text-lg text-red-600 hover:text-red-700 transition-colors py-2"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link
                      href="/login"
                      className="block w-full text-center bg-white border-2 border-[#4CAF50] text-[#4CAF50] px-6 py-3 rounded-full text-lg font-semibold hover:bg-[#4CAF50] hover:text-white transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full text-center bg-[#4CAF50] text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-[#45a049] transition-colors shadow-md"
                      onClick={closeMobileMenu}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}