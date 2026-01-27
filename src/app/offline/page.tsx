'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center">
        <div className="text-5xl mb-3">📶</div>
        <h1 className="text-xl font-semibold text-gray-900">You’re offline</h1>
        <p className="text-sm text-gray-600 mt-2">
          Please check your internet connection and try again.
        </p>
      </div>
    </div>
  );
}

