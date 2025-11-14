import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getUsers } from "../../services/userService";
import { getSEO } from "../../services/seoService";
import { getUser } from "../../../authStorage";
import type { DecodeToken } from "../../../types/auth";

interface StatData {
  count: number;
  error: string | null;
}

// Helper function to safely count array items
const countItems = (data: unknown): number => {
  if (Array.isArray(data)) {
    return data.length;
  }
  if (data && typeof data === 'object') {
    // Handle object with count property
    if ('count' in data && typeof data.count === 'number') {
      return data.count;
    }
    // Handle object with length property
    if ('length' in data && typeof data.length === 'number') {
      return data.length;
    }
  }
  return 0;
};

// Helper function to safely fetch and count data
const fetchAndCount = async <T,>(
  fetchFn: () => Promise<T>,
  defaultValue: number = 0
): Promise<StatData> => {
  try {
    const data = await fetchFn();
    const count = countItems(data);
    return { count, error: null };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      count: defaultValue,
      error: error instanceof Error ? error.message : 'Failed to fetch data',
    };
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState<{
    products: StatData;
    categories: StatData;
    users: StatData;
    seo: StatData;
  }>({
    products: { count: 0, error: null },
    categories: { count: 0, error: null },
    users: { count: 0, error: null },
    seo: { count: 0, error: null },
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<DecodeToken | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel, but handle errors individually
        const [productsData, categoriesData, usersData, seosData, user] = await Promise.allSettled([
          fetchAndCount(() => getProducts()),
          fetchAndCount(() => getCategories()),
          fetchAndCount(() => getUsers()),
          fetchAndCount(() => getSEO()),
          Promise.resolve(getUser()),
        ]);

        setStats({
          products: productsData.status === 'fulfilled' ? productsData.value : { count: 0, error: 'Failed to load' },
          categories: categoriesData.status === 'fulfilled' ? categoriesData.value : { count: 0, error: 'Failed to load' },
          users: usersData.status === 'fulfilled' ? usersData.value : { count: 0, error: 'Failed to load' },
          seo: seosData.status === 'fulfilled' ? seosData.value : { count: 0, error: 'Failed to load' },
        });

        if (user.status === 'fulfilled') {
          setCurrentUser(user.value);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Products",
      value: stats.products.count,
      error: stats.products.error,
      icon: "📦",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      onClick: () => navigate("/admin/product"),
    },
    {
      title: "Categories",
      value: stats.categories.count,
      error: stats.categories.error,
      icon: "📁",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      onClick: () => navigate("/admin/category"),
    },
    {
      title: "Users",
      value: stats.users.count,
      error: stats.users.error,
      icon: "👥",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      onClick: () => navigate("/admin/user"),
    },
    {
      title: "SEO Entries",
      value: stats.seo.count,
      error: stats.seo.error,
      icon: "🔍",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      onClick: () => navigate("/admin/seo"),
    },
  ];

  return (
    <div className="p-3 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-sm md:text-base">
          Welcome back{currentUser?.username ? `, ${currentUser.username}` : ''}! Here's an overview of your admin panel.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            onClick={card.onClick}
            className={`${card.color} ${card.hoverColor} rounded-lg shadow-lg p-4 md:p-6 text-white cursor-pointer transition-all duration-200 transform hover:scale-105 ${
              card.error ? 'opacity-90' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white/80 text-xs md:text-sm font-medium uppercase tracking-wide">
                  {card.title}
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2">{card.value}</p>
                {card.error && (
                  <p className="text-xs text-white/70 mt-1 italic">
                    {card.error}
                  </p>
                )}
              </div>
              <div className="text-4xl md:text-5xl opacity-80">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <button
            onClick={() => navigate("/admin/product/create")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium text-sm md:text-base text-left"
          >
            ➕ Add Product
          </button>
          <button
            onClick={() => navigate("/admin/category/create")}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium text-sm md:text-base text-left"
          >
            ➕ Add Category
          </button>
          <button
            onClick={() => navigate("/admin/user/create")}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium text-sm md:text-base text-left"
          >
            ➕ Add User
          </button>
          <button
            onClick={() => navigate("/admin/seo/create")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium text-sm md:text-base text-left"
          >
            ➕ Add SEO Entry
          </button>
        </div>
      </div>

      {/* User Info Card */}
      {currentUser && (
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Your Account</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold flex-shrink-0">
              {currentUser.username?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base md:text-lg font-semibold text-gray-900">{currentUser.username || 'User'}</p>
              <p className="text-sm md:text-base text-gray-600 break-all">{currentUser.email}</p>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  currentUser.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentUser.role || 'user'}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  currentUser.isVerify 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentUser.isVerify ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/profile")}
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-sm md:text-base"
            >
              View Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
