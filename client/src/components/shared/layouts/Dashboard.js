/**
 * Title: Write a program using JavaScript on Dashboard
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import React, { useState } from "react";
import Sidebar from "../Sidebar";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import Down from "@/components/icons/Down";
import Link from "next/link";
import Logout from "@/components/icons/Logout";
import NoSSR from "../NoSSR";

const Dashboard = ({ children }) => {
  const user = useSelector((state) => state?.auth?.user);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const pathname = usePathname();

  let routes = [];

  if (user?.role === "buyer") {
    routes = [
      {
        name: "My Profile",
        paths: [
          {
            name: "View Profile",
            path: "/dashboard/buyer/my-profile",
          },
          {
            name: "View Purchases",
            path: "/dashboard/buyer/my-purchases",
          },
        ],
      },
      {
        name: "My Cart",
        paths: [
          {
            name: "View Cart",
            path: "/dashboard/buyer/my-cart",
          },
          {
            name: "View Wishlist",
            path: "/dashboard/buyer/my-wishlist",
          },
        ],
      },
      {
        name: "My Reviews",
        paths: [
          {
            name: "View Reviews",
            path: "/dashboard/buyer/my-reviews",
          },
        ],
      },
    ];
  }

  if (user?.role === "admin") {
    routes = [
      {
        name: "Brand Management",
        icon: "🏷️",
        paths: [
          {
            name: "➕ Add Brand",
            path: "/dashboard/admin/add-brand",
          },
          {
            name: "📋 Manage Brands",
            path: "/dashboard/admin/list-brands",
          },
        ],
      },
      {
        name: "catg Management",
        icon: "📁", 
        paths: [
          {
            name: "➕ Add Category",
            path: "/dashboard/admin/add-category",
          },
          {
            name: "📋 Manage Categories",
            path: "/dashboard/admin/list-categories",
          },
        ],
      },
      // {
      //   name: "Store Management",
      //   icon: "🏪",
      //   paths: [
      //     {
      //       name: "➕ Add Store", 
      //       path: "/dashboard/admin/add-store",
      //     },
      //     {
      //       name: "📋 Manage Stores",
      //       path: "/dashboard/admin/list-stores",
      //     },
      //   ],
      // },
      {
        name: "Product Management",
        icon: "📦",
        paths: [
          {
            name: "➕ Add Product",
            path: "/dashboard/admin/add-product", 
          },
          {
            name: "📋 Manage Products",
            path: "/dashboard/admin/list-products",
          },
        ],
      },
      {
        name: "User Management",
        icon: "👥",
        paths: [
          {
            name: "➕ Add User",
            path: "/dashboard/admin/add-user",
          },
          {
            name: "👤 Manage Users",
            path: "/dashboard/admin/list-users",
          },
        ],
      },
      {
        name: "Orders & Analytics",
        icon: "📊",
        paths: [
          {
            name: "🛒 View Orders", 
            path: "/dashboard/admin/list-purchases",
          },
          {
            name: "⭐ View Reviews",
            path: "/dashboard/admin/list-reviews",
          },
        ],
      },
      {
        name: "System Settings",
        icon: "⚙️",
        paths: [
          {
            name: "🎨 Manage Sections",
            path: "/dashboard/admin/manage-sections",
          },
          {
            name: "🏠 Home Page Settings",
            path: "/dashboard/admin/settings",
          },
        ],
      },
    ];
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex">
      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        ${sidebarCollapsed ? 'w-16' : 'w-64'} 
        ${showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-all duration-300 ease-in-out
        bg-white border-r border-gray-200 shadow-sm
        lg:min-h-screen
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CD</span>
              </div>
              <span className="font-semibold text-gray-900">China Deals LB</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1) || 'Administrator'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Dashboard Link */}
          <Link
            href="/dashboard"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              pathname === "/dashboard"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl">📊</span>
            {!sidebarCollapsed && (
              <span className="font-medium">Dashboard</span>
            )}
          </Link>

          {routes.map((route, index) => (
            <SidebarSection 
              key={index} 
              route={route} 
              collapsed={sidebarCollapsed}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => {
              localStorage.removeItem("accessToken");
              // Redirect to store instead of just reloading
              window.location.href = "/";
            }}
            className={`
              flex items-center space-x-3 w-full p-2 rounded-lg 
              text-red-600 hover:bg-red-50 transition-colors
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
          >
            <Logout className="w-4 h-4" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Welcome back, {user?.name?.split(" ")[0] || "Admin"}! 👋
              </h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Take me to store button */}
            <button
              onClick={() => window.open("/", "_blank")}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium rounded-lg border-0 text-white"
              style={{ color: 'white' }} // Force white text
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-white">Take me to store</span>
            </button>
            
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>System Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Sidebar Section Component
function SidebarSection({ route, collapsed, pathname }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveChild = route.paths?.some(path => pathname === path.path);

  if (collapsed) {
    return (
      <div className="relative group">
        <div className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
          <span className="text-lg">{route.icon || '📁'}</span>
        </div>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {route.name}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          flex items-center justify-between w-full p-2 rounded-lg transition-colors
          ${hasActiveChild ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
        `}
      >
        <div className="flex items-center space-x-3">
          <span className="text-sm">{route.icon || '📁'}</span>
          <span className="text-sm font-medium">{route.name}</span>
        </div>
        <Down className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="ml-4 space-y-1 border-l border-gray-200 pl-4">
          {route.paths?.map((path, index) => (
            <Link
              key={index}
              href={path.path}
              className={`
                block p-2 rounded-lg text-sm transition-colors
                ${pathname === path.path 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              {path.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
