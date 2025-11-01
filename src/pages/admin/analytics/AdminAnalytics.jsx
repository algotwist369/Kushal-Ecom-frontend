import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../api/axiosConfig';
import BackButton from '../../../components/common/BackButton';
import { LuRefreshCcw } from "react-icons/lu";

const AdminAnalytics = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [productAnalytics, setProductAnalytics] = useState(null);
    const [salesAnalytics, setSalesAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30d');

    useEffect(() => {
        fetchAllAnalytics();
    }, [period]);

    const fetchAllAnalytics = async () => {
        setLoading(true);
        try {
            const [dashboardRes, productRes, salesRes] = await Promise.all([
                api.get('/analytics/dashboard'),
                api.get('/analytics/products'),
                api.get(`/analytics/sales?period=${period}`)
            ]);

            setDashboardData(dashboardRes.data);
            setProductAnalytics(productRes.data);
            setSalesAnalytics(salesRes.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to fetch analytics data');
        }
        setLoading(false);
    };

    const calculateOrderStats = () => {
        if (!dashboardData?.overview) return {};
        
        const total = dashboardData.overview.totalOrders || 0;
        const revenue = dashboardData.overview.totalRevenue || 0;
        const averageOrderValue = total > 0 ? revenue / total : 0;
        
        return {
            ...dashboardData.overview,
            averageOrderValue,
            conversionRate: 0 // Can be calculated if you track visitors
        };
    };

    const stats = calculateOrderStats();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton to="/admin" label="Back to Dashboard" />
                
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-[#5c2d16]">Analytics Dashboard</h1>
                        <p className="text-gray-600 mt-2">Comprehensive business insights</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                            <option value="1y">Last Year</option>
                        </select>
                        <button
                            onClick={fetchAllAnalytics}
                            disabled={loading}
                            className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                            <LuRefreshCcw className="text-2xl" />
                        </button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Revenue</h3>
                        <p className="text-3xl font-bold text-green-600">
                            ₹{stats?.totalRevenue?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">From paid orders</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Orders</h3>
                        <p className="text-3xl font-bold text-gray-600">
                            {stats?.totalOrders || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">All time</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Avg Order Value</h3>
                        <p className="text-3xl font-bold text-purple-600">
                            ₹{stats?.averageOrderValue?.toFixed(2) || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Per order</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Products</h3>
                        <p className="text-3xl font-bold text-orange-600">
                            {stats?.totalProducts || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">In catalog</p>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-bold text-[#5c2d16] mb-6">Order Status Distribution</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {salesAnalytics?.orderStatusData?.map((statusData, index) => (
                            <div key={index} className={`text-center p-4 rounded-lg ${
                                statusData._id === 'processing' ? 'bg-gray-50' :
                                statusData._id === 'shipped' ? 'bg-purple-50' :
                                statusData._id === 'delivered' ? 'bg-green-50' :
                                'bg-red-50'
                            }`}>
                                <p className="text-sm text-gray-600 mb-2 capitalize">{statusData._id}</p>
                                <p className={`text-2xl font-bold ${
                                    statusData._id === 'processing' ? 'text-gray-600' :
                                    statusData._id === 'shipped' ? 'text-purple-600' :
                                    statusData._id === 'delivered' ? 'text-green-600' :
                                    'text-red-600'
                                }`}>
                                    {statusData.count}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Method Stats */}
                {salesAnalytics?.paymentMethodData && salesAnalytics.paymentMethodData.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-2xl font-bold text-[#5c2d16] mb-6">Payment Methods</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {salesAnalytics.paymentMethodData.map((payment, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-lg font-semibold text-[#5c2d16] uppercase">
                                                {payment._id}
                                            </p>
                                            <p className="text-sm text-gray-600">{payment.count} orders</p>
                                        </div>
                                        <p className="text-xl font-bold text-green-600">
                                            ₹{payment.totalAmount?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Product & User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-[#5c2d16] mb-4">Product Statistics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Products</span>
                                <span className="text-xl font-bold text-[#5c2d16]">
                                    {productAnalytics?.productStats?.totalProducts || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Active Products</span>
                                <span className="text-xl font-bold text-green-600">
                                    {productAnalytics?.productStats?.activeProducts || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Average Price</span>
                                <span className="text-xl font-bold text-gray-600">
                                    ₹{productAnalytics?.productStats?.averagePrice?.toFixed(2) || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Stock</span>
                                <span className="text-xl font-bold text-purple-600">
                                    {productAnalytics?.productStats?.totalStock || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-[#5c2d16] mb-4">User Statistics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Users</span>
                                <span className="text-xl font-bold text-[#5c2d16]">
                                    {stats?.totalUsers || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Categories</span>
                                <span className="text-xl font-bold text-gray-600">
                                    {stats?.totalCategories || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">User Growth</span>
                                <span className="text-xl font-bold text-green-600">
                                    +{dashboardData?.userGrowth?.length || 0} months
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Sales Periods</span>
                                <span className="text-xl font-bold text-purple-600">
                                    {dashboardData?.salesData?.length || 0} months
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alert */}
                {productAnalytics?.lowStockProducts && productAnalytics.lowStockProducts.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-orange-500">
                        <h3 className="text-xl font-bold text-[#5c2d16] mb-4">⚠️ Low Stock Alert</h3>
                        <div className="space-y-3">
                            {productAnalytics.lowStockProducts.map((product) => (
                                <div key={product._id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-[#5c2d16]">{product.name}</p>
                                        <p className="text-sm text-gray-600">Price: ₹{product.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-orange-600">
                                            {product.stock} left
                                        </p>
                                        <p className="text-xs text-gray-500">Restock soon</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Selling & Top Rated Products */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Top Selling */}
                    {salesAnalytics?.topSellingProducts && salesAnalytics.topSellingProducts.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-[#5c2d16] mb-4">🔥 Top Selling Products</h3>
                            <div className="space-y-3">
                                {salesAnalytics.topSellingProducts.map((product, index) => (
                                    <div key={product._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                                            <div>
                                                <p className="font-semibold text-[#5c2d16]">{product.productName}</p>
                                                <p className="text-sm text-gray-600">Sold: {product.totalQuantity} units</p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-bold text-green-600">
                                            ₹{product.totalRevenue?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Top Rated */}
                    {productAnalytics?.topRatedProducts && productAnalytics.topRatedProducts.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-bold text-[#5c2d16] mb-4">⭐ Top Rated Products</h3>
                            <div className="space-y-3">
                                {productAnalytics.topRatedProducts.map((product, index) => (
                                    <div key={product._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                                            <div>
                                                <p className="font-semibold text-[#5c2d16]">{product.name}</p>
                                                <p className="text-sm text-gray-600">{product.numReviews} reviews</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-yellow-600">
                                                {product.averageRating?.toFixed(1)} ⭐
                                            </p>
                                            <p className="text-sm text-gray-600">₹{product.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Category Distribution */}
                {productAnalytics?.categoryStats && productAnalytics.categoryStats.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h3 className="text-xl font-bold text-[#5c2d16] mb-4">Products by Category</h3>
                        <div className="space-y-3">
                            {productAnalytics.categoryStats.map((cat, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-[#5c2d16]">{cat.categoryName}</p>
                                        <p className="text-sm text-gray-600">Avg Price: ₹{cat.averagePrice?.toFixed(2)}</p>
                                    </div>
                                    <p className="text-lg font-bold text-gray-600">
                                        {cat.productCount} products
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Orders */}
                {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h3 className="text-xl font-bold text-[#5c2d16] mb-4">Recent Orders</h3>
                        <div className="space-y-3">
                            {dashboardData.recentOrders.map((order) => (
                                <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="font-semibold text-[#5c2d16]">
                                            Order #{order._id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {order.user?.name} • {order.items?.length || 0} item(s)
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">
                                            ₹{order.finalAmount?.toLocaleString() || 0}
                                        </p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                            order.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                            order.orderStatus === 'processing' ? 'bg-gray-100 text-gray-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sales Trend */}
                {salesAnalytics?.salesData && salesAnalytics.salesData.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-[#5c2d16] mb-4">Sales Trend ({period})</h3>
                        <div className="space-y-3">
                            {salesAnalytics.salesData.slice(-10).map((data, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-[#5c2d16]">
                                            {data._id.year}-{String(data._id.month).padStart(2, '0')}-{String(data._id.day).padStart(2, '0')}
                                        </p>
                                        <p className="text-sm text-gray-600">{data.orderCount} orders</p>
                                    </div>
                                    <p className="text-lg font-bold text-green-600">
                                        ₹{data.totalSales?.toLocaleString() || 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnalytics;

