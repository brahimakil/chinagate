"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BottomNav = () => {
  const pathname = usePathname();

  // Helper to check if route is active
  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] z-[9999]"
      style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999
      }}
    >
      <div className="grid grid-cols-4 h-16">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center gap-1 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 ${
            isActive('/') ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </Link>
        
        <Link 
          href="/categories" 
          className={`flex flex-col items-center justify-center gap-1 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 ${
            isActive('/categories') ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-xs font-medium">Categories</span>
        </Link>
        
        <Link 
          href="/brands" 
          className={`flex flex-col items-center justify-center gap-1 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 ${
            isActive('/brands') ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-xs font-medium">Brands</span>
        </Link>
        
        <Link 
          href="/collections/all" 
          className={`flex flex-col items-center justify-center gap-1 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 ${
            isActive('/collections') ? 'text-blue-600' : 'text-gray-700'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-xs font-medium">Shop</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;