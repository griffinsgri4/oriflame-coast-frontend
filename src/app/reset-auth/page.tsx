'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { removeAuthToken, removeStoredUser } from '@/lib/authStorage';

export default function ResetAuthPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        // Attempt server-side logout to clear Sanctum session cookies
        await api.auth.logout().catch(() => {});
      } catch (_) {
        // Non-blocking; continue client-side clear
      } finally {
        try {
          // Clear client-side credentials and any persisted session state
          removeAuthToken();
          removeStoredUser();
          localStorage.removeItem('cart');
          localStorage.removeItem('intended_path');
        } catch (_) {}

        // Redirect to login fresh
        setTimeout(() => router.replace('/login'), 400);
      }
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4CAF50] mx-auto mb-4" />
        <h1 className="text-lg font-semibold">Resetting authentication…</h1>
        <p className="text-sm text-gray-600 mt-2">Clearing credentials and redirecting to login.</p>
      </div>
    </div>
  );
}
