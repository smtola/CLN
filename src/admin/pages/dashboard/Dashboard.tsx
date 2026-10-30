import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  FolderOpen,
  Package,
  Plus,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getUsers } from "../../services/userService";
import { getSEO } from "../../services/seoService";
import { getQuoteStats, type QuoteStats } from "../../services/quoteService";
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
  if (data && typeof data === "object") {
    if ("count" in data && typeof data.count === "number") {
      return data.count;
    }
    if ("length" in data && typeof data.length === "number") {
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
    console.error("Error fetching data:", error);
    return {
      count: defaultValue,
      error: error instanceof Error ? error.message : "Failed to fetch data",
    };
  }
};

/** Skeleton block — neutral gray, matches whatever it's standing in for */
function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}

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
  const [quoteStats, setQuoteStats] = useState<QuoteStats | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<DecodeToken | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const [productsData, categoriesData, usersData, seosData, quoteData, user] =
          await Promise.allSettled([
            fetchAndCount(() => getProducts()),
            fetchAndCount(() => getCategories()),
            fetchAndCount(() => getUsers()),
            fetchAndCount(() => getSEO()),
            getQuoteStats(),
            Promise.resolve(getUser()),
          ]);

        setStats({
          products:
            productsData.status === "fulfilled"
              ? productsData.value
              : { count: 0, error: "Failed to load" },
          categories:
            categoriesData.status === "fulfilled"
              ? categoriesData.value
              : { count: 0, error: "Failed to load" },
          users:
            usersData.status === "fulfilled"
              ? usersData.value
              : { count: 0, error: "Failed to load" },
          seo:
            seosData.status === "fulfilled"
              ? seosData.value
              : { count: 0, error: "Failed to load" },
        });

        if (quoteData.status === "fulfilled") {
          setQuoteStats(quoteData.value);
        } else {
          setQuoteError("Failed to load quote statistics");
        }

        if (user.status === "fulfilled") {
          setCurrentUser(user.value);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Products",
      value: stats.products.count,
      error: stats.products.error,
      icon: Package,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      onClick: () => navigate("/admin/product"),
    },
    {
      title: "Categories",
      value: stats.categories.count,
      error: stats.categories.error,
      icon: FolderOpen,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      onClick: () => navigate("/admin/category"),
    },
    {
      title: "Users",
      value: stats.users.count,
      error: stats.users.error,
      icon: Users,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      onClick: () => navigate("/admin/user"),
    },
    {
      title: "SEO Entries",
      value: stats.seo.count,
      error: stats.seo.error,
      icon: Search,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      onClick: () => navigate("/admin/seo"),
    },
  ];

  const quickActions = [
    { label: "Add Product", color: "bg-blue-500", hover: "hover:bg-blue-600", to: "/admin/product/create" },
    { label: "Add Category", color: "bg-green-500", hover: "hover:bg-green-600", to: "/admin/category/create" },
    { label: "Add User", color: "bg-purple-500", hover: "hover:bg-purple-600", to: "/admin/user/create" },
    { label: "Add SEO Entry", color: "bg-orange-500", hover: "hover:bg-orange-600", to: "/admin/seo/create" },
  ];

  const quoteChartData = quoteStats
    ? [
        { name: "Requested", value: quoteStats.totalRequests, fill: "#3b82f6" },
        { name: "Successful", value: quoteStats.successfulRequests, fill: "#22c55e" },
      ]
    : [];

  if (loading) {
    return (
      <div className="p-3 md:p-6">
        <div className="mb-6 md:mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-3 h-4 w-72" />
        </div>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-8 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 md:h-32" />
          ))}
        </div>
        <Skeleton className="mb-6 h-64 md:mb-8" />
        <Skeleton className="mb-6 h-40 md:mb-8" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 md:text-base">
          Welcome back{currentUser?.username ? `, ${currentUser.username}` : ""}! Here's
          an overview of your Admin panel.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-8 md:gap-6 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={card.onClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && card.onClick()}
              className={`${card.color} ${card.hoverColor} group cursor-pointer rounded-xl p-4 text-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:p-6 ${
                card.error ? "opacity-90" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/80 md:text-sm">
                    {card.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold md:text-3xl">{card.value}</p>
                  {card.error && (
                    <p className="mt-1 text-xs italic text-white/70">{card.error}</p>
                  )}
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 transition-transform duration-200 group-hover:scale-105 md:h-14 md:w-14">
                  <Icon className="h-5 w-5 md:h-7 md:w-7" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-white/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                View all <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quote Requests Chart */}
{/* Quote Requests Chart */}
<div className="mb-6 rounded-xl bg-white p-4 shadow md:mb-8 md:p-6">
  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
    <div>
      <h2 className="text-lg font-semibold text-gray-800 md:text-xl">
        Quote Requests
      </h2>
      <p className="text-xs text-gray-500 md:text-sm">CLN Cambodia</p>
    </div>
    {quoteStats && (
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 md:text-sm">
        {quoteStats.conversionRate.toFixed(1)}% conversion
      </span>
    )}
  </div>

  {quoteError ? (
    <p className="text-sm italic text-gray-500">{quoteError}</p>
  ) : quoteStats ? (
    <div className="h-64 md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={quoteChartData} barSize={80}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 13 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
          <Tooltip
            formatter={(value) => [value ?? 0, "Requests"]}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {quoteChartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <p className="text-sm italic text-gray-500">No quote data yet.</p>
  )}
</div>

      {/* Quick Actions */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow md:mb-8 md:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className={`${action.color} ${action.hover} flex items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] md:text-base`}
            >
              <Plus className="h-4 w-4 shrink-0" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Info Card */}
      {currentUser && (
        <div className="rounded-xl bg-white p-4 shadow md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800 md:text-xl">
            Your Account
          </h2>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white shadow-md ring-2 ring-white md:h-16 md:w-16 md:text-2xl">
              {currentUser.username?.charAt(0).toUpperCase() ||
                currentUser.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-gray-900 md:text-lg">
                {currentUser.username || "User"}
              </p>
              <p className="break-all text-sm text-gray-600 md:text-base">
                {currentUser.email}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 md:gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    currentUser.role === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {currentUser.role || "user"}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    currentUser.isVerify
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {currentUser.isVerify ? (
                    <BadgeCheck className="h-3.5 w-3.5" />
                  ) : (
                    <ShieldAlert className="h-3.5 w-3.5" />
                  )}
                  {currentUser.isVerify ? "Verified" : "Not Verified"}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/profile")}
              className="w-full shrink-0 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 sm:w-auto md:text-base"
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