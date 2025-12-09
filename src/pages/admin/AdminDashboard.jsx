import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalytics } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import { getSocket } from '../../utils/socket';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);



    useEffect(() => {
        window.scrollTo(0, 0);
        fetchAnalytics();
        fetchNotificationCount();
        
        // Initialize Socket.IO for real-time notification count
        const socket = getSocket();
        
        socket.on('new_notification', (notification) => {
            console.log('🔔 New notification on dashboard:', notification.title);
            
            // Show toast
            toast.success(
                `New ${notification.type.replace('_', ' ')}: ${notification.title}`,
                {
                    duration: 4000,
                    icon: notification.type === 'new_product' ? '📦' : '👤'
                }
            );
            
            // Update notification count
            fetchNotificationCount();
        });
        
        return () => {
            socket.off('new_notification');
        };
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        const result = await getAnalytics();
        if (result.success) {
            setAnalytics(result.data);
        }
        setLoading(false);
    };

    const fetchNotificationCount = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/stats`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setNotificationCount(data.unread || 0);
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    };

    const StatCard = ({ title, value, icon, color, link }) => (
        <Link to={link} className="block">
            <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${color}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-sm font-medium">{title}</p>
                        <p className="text-3xl font-bold mt-2">{value}</p>
                    </div>
                    <div className={`text-4xl ${color.replace('border', 'text')}`}>
                        {icon}
                    </div>
                </div>
            </div>
        </Link>
    );

    const QuickActionCard = ({ title, description, link, icon, color }) => (
        <Link to={link} className="block">
            <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all hover:translate-y-[-2px] border-t-4 ${color}`}>
                <div className="flex items-center mb-4">
                    <div className={`text-3xl mr-4 ${color.replace('border', 'text')}`}>
                        {icon}
                    </div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                </div>
                <p className="text-gray-600">{description}</p>
            </div>
        </Link>
    );

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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#5c2d16]">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Users"
                        value={analytics?.overview?.totalUsers || 0}
                        icon="👥"
                        color="border-gray-500"
                        link="/admin/users"
                    />
                    <StatCard
                        title="Total Products"
                        value={analytics?.overview?.totalProducts || 0}
                        icon="📦"
                        color="border-green-500"
                        link="/admin/products"
                    />
                    <StatCard
                        title="Total Orders"
                        value={analytics?.overview?.totalOrders || 0}
                        icon="🛒"
                        color="border-yellow-500"
                        link="/admin/orders"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={`₹${analytics?.overview?.totalRevenue?.toLocaleString() || 0}`}
                        icon="💰"
                        color="border-purple-500"
                        link="/admin/analytics"
                    />
                </div>

                {/* Recent Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
                        <p className="text-4xl font-bold text-gray-600">
                            {analytics?.overview?.totalCategories || 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h3>
                        <p className="text-4xl font-bold text-green-600">
                            {analytics?.topProducts?.length || 0}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#5c2d16] mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <QuickActionCard
                            title="Manage Users"
                            description="View, edit, and manage user accounts"
                            link="/admin/users"
                            icon="👥"
                            color="border-gray-500"
                        />
                        <QuickActionCard
                            title="Manage Categories"
                            description="Organize product categories"
                            link="/admin/categories"
                            icon="📂"
                            color="border-pink-500"
                        />
                        <QuickActionCard
                            title="Manage Products"
                            description="Add, edit, or remove products"
                            link="/admin/products"
                            icon="📦"
                            color="border-green-500"
                        />
                        <QuickActionCard
                            title="Manage Coupons"
                            description="Create and manage discount coupons"
                            link="/admin/coupons"
                            icon="🎟️"
                            color="border-purple-500"
                        />
                        <QuickActionCard
                            title="Manage PopUps"
                            description="Create promotional popups"
                            link="/admin/popups"
                            icon="🎁"
                            color="border-orange-500"
                        />
                        <QuickActionCard
                            title="Hero Images"
                            description="Manage homepage slider images"
                            link="/admin/hero-images"
                            icon="🖼️"
                            color="border-indigo-500"
                        />
                        <QuickActionCard
                            title="Contact Messages"
                            description="View customer inquiries"
                            link="/admin/contacts"
                            icon="📧"
                            color="border-gray-500"
                        />
                        <QuickActionCard
                            title="Manage Orders"
                            description="Track and update order status"
                            link="/admin/orders"
                            icon="🛒"
                            color="border-yellow-500"
                        />

                        <QuickActionCard
                            title="View Analytics"
                            description="Detailed business insights"
                            link="/admin/analytics"
                            icon="📊"
                            color="border-indigo-500"
                        />
                        <div className="relative">
                            <QuickActionCard
                                title="Notifications"
                                description="Send notifications to users"
                                link="/admin/notifications"
                                icon="🔔"
                                color="border-teal-500"
                            />
                            {notificationCount > 0 && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center shadow-lg animate-pulse">
                                    {notificationCount}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

