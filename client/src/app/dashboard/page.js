/**
 * Title: Dashboard Overview
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import Dashboard from "@/components/shared/layouts/Dashboard";
import { useGetDashboardStatsQuery, useExportDataMutation } from "@/services/user/userApi";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const Page = () => {
  const user = useSelector((state) => state?.auth?.user);

  return (
    <Dashboard>
      <section className="w-full space-y-6">
        {user?.role === "admin" ? (
          <>
            <div className="w-full flex flex-row justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard Overview</h1>
            </div>
            <AnalyticsDashboard />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-lg max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">
                Hello {user?.name}! 👋
              </h1>
              <h2 className="text-2xl font-semibold mb-4">
                Welcome to China Gate
              </h2>
              <p className="text-lg text-blue-100">
                Your gateway to amazing products and seamless shopping experience.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border max-w-md">
            
              <p className="text-gray-600">
                Explore our marketplace and discover incredible deals!
              </p>
            </div>
          </div>
        )}
      </section>
    </Dashboard>
  );
};

function AnalyticsDashboard() {
  const { data: statsData, isLoading, error } = useGetDashboardStatsQuery();
  const [exportData] = useExportDataMutation();
  const [exportingType, setExportingType] = useState(null);

  const stats = statsData?.data;

  const handleExport = async (type) => {
    try {
      setExportingType(type);
      toast.loading(`Exporting ${type}...`, { id: "export" });
      
      const response = await exportData(type).unwrap();
      
      // Create and download file
      const blob = new Blob([JSON.stringify(response, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${type} exported successfully!`, { id: "export" });
    } catch (error) {
      toast.error(`Failed to export ${type}`, { id: "export" });
    } finally {
      setExportingType(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">Error loading dashboard</div>
      </div>
    );
  }

  // Prepare chart data
  const userRoleData = {
    labels: ['Admins', 'Buyers'],
    datasets: [
      {
        data: [stats?.userStats?.admins || 0, stats?.userStats?.buyers || 0],
        backgroundColor: ['#ef4444', '#3b82f6'],
        borderColor: ['#dc2626', '#2563eb'],
        borderWidth: 2,
      },
    ],
  };

  const userStatusData = {
    labels: ['Active Users', 'Inactive Users'],
    datasets: [
      {
        data: [stats?.userStats?.active || 0, stats?.userStats?.inactive || 0],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderColor: ['#059669', '#d97706'],
        borderWidth: 2,
      },
    ],
  };

  // Prepare monthly data for line chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyUserLabels = stats?.charts?.monthlyUsers?.map(item => 
    `${monthNames[item._id.month - 1]} ${item._id.year}`
  ) || [];
  const monthlyUserCounts = stats?.charts?.monthlyUsers?.map(item => item.count) || [];

  const monthlyOrderLabels = stats?.charts?.monthlyOrders?.map(item => 
    `${monthNames[item._id.month - 1]} ${item._id.year}`
  ) || [];
  const monthlyOrderCounts = stats?.charts?.monthlyOrders?.map(item => item.count) || [];

  const lineChartData = {
    labels: monthlyUserLabels,
    datasets: [
      {
        label: 'New Users',
        data: monthlyUserCounts,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const orderChartData = {
    labels: monthlyOrderLabels,
    datasets: [
      {
        label: 'Orders',
        data: monthlyOrderCounts,
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalUsers || 0}</p>
            </div>
            <div className="text-blue-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalProducts || 0}</p>
            </div>
            <div className="text-green-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM10 18V8l5.5 4v6h-11V8L10 18z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalOrders || 0}</p>
            </div>
            <div className="text-yellow-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${stats?.overview?.totalRevenue || 0}</p>
            </div>
            <div className="text-purple-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalBrands || 0}</p>
          <p className="text-sm text-gray-600">Brands</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalCategories || 0}</p>
          <p className="text-sm text-gray-600">Categories</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalStores || 0}</p>
          <p className="text-sm text-gray-600">Stores</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalReviews || 0}</p>
          <p className="text-sm text-gray-600">Reviews</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">User Roles Distribution</h3>
          <div className="h-64">
            <Pie data={userRoleData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* User Status Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">User Status Distribution</h3>
          <div className="h-64">
            <Pie data={userStatusData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Monthly Users Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Monthly User Registrations</h3>
          <div className="h-64">
            <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Monthly Orders Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Monthly Orders</h3>
          <div className="h-64">
            <Bar data={orderChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Export Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {['brands', 'categories', 'products', 'stores', 'users', 'orders', 'reviews'].map((type) => (
            <button
              key={type}
              onClick={() => handleExport(type)}
              disabled={exportingType === type}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
            >
              {exportingType === type ? 'Exporting...' : `Export ${type.charAt(0).toUpperCase() + type.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {stats?.recent?.users?.map((user, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <div className="space-y-3">
            {stats?.recent?.topProducts?.map((product, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{product.title}</p>
                  <p className="text-sm text-gray-600">{product.brand?.title} • {product.category?.title}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {product.buyers?.length || 0} buyers
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;