import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
    sendBulkNotification,
    getAllNotifications,
    getNotificationStats,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../../../services/notificationService';
import { getAllUsers } from '../../../services/adminService';
import BackButton from '../../../components/common/BackButton';
import { LuSend, LuUsers, LuMail, LuBell, LuRefreshCcw, LuTrash2, LuCheck, LuCheckCheck, LuPackage, LuUserPlus } from 'react-icons/lu';
import { getSocket } from '../../../utils/socket';

const AdminNotifications = () => {
    const [activeTab, setActiveTab] = useState('send'); // 'send' or 'inbox'
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notificationStats, setNotificationStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, new_user, new_product, unread
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        userType: 'all'
    });

    useEffect(() => {
        fetchUsers();
        fetchNotifications();
        fetchStats();
        
        // Initialize Socket.IO connection
        const socket = getSocket();
        
        // Listen for new notifications
        socket.on('new_notification', (notification) => {
            console.log('🔔 New notification received:', notification);
            
            // Show toast notification
            toast.success(
                `New ${notification.type.replace('_', ' ')}: ${notification.title}`,
                {
                    duration: 5000,
                    icon: notification.type === 'new_product' ? '📦' : '👤'
                }
            );
            
            // Refresh notifications and stats
            fetchNotifications();
            fetchStats();
        });
        
        return () => {
            // Clean up socket listener
            socket.off('new_notification');
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'inbox') {
            fetchNotifications();
        }
    }, [activeTab, filter]);

    const fetchUsers = async () => {
        const result = await getAllUsers();
        if (result.success) {
            setUsers(result.data || []);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        const params = {};
        if (filter === 'unread') params.isRead = false;
        else if (filter !== 'all') params.type = filter;

        const result = await getAllNotifications(params);
        if (result.success) {
            setNotifications(result.data.notifications || []);
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        const result = await getNotificationStats();
        if (result.success) {
            setNotificationStats(result.data);
        }
    };

    const handleMarkAsRead = async (id) => {
        const result = await markAsRead(id);
        if (result.success) {
            toast.success('Marked as read');
            fetchNotifications();
            fetchStats();
        } else {
            toast.error(result.message);
        }
    };

    const handleMarkAllAsRead = async () => {
        const result = await markAllAsRead();
        if (result.success) {
            toast.success(result.message);
            fetchNotifications();
            fetchStats();
        } else {
            toast.error(result.message);
        }
    };

    const handleDeleteNotification = async (id) => {
        const deletePromise = deleteNotification(id);
        
        toast.promise(
            deletePromise,
            {
                loading: 'Deleting notification...',
                success: 'Notification deleted!',
                error: 'Failed to delete notification',
            }
        );

        const result = await deletePromise;
        if (result.success) {
            fetchNotifications();
            fetchStats();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getRecipientCount = () => {
        if (formData.userType === 'all') {
            return users.filter(u => u.isActive).length;
        }
        return users.filter(u => u.role === formData.userType && u.isActive).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.subject.trim() || !formData.message.trim()) {
            toast.error('Subject and message are required');
            return;
        }

        const recipientCount = getRecipientCount();
        
        if (!window.confirm(`Send notification to ${recipientCount} user(s)?`)) {
            return;
        }

        setLoading(true);

        try {
            const sendPromise = sendBulkNotification(formData);
            
            toast.promise(
                sendPromise,
                {
                    loading: `Sending to ${recipientCount} users...`,
                    success: (result) => {
                        const sent = result.data?.totalSent || 0;
                        const failed = result.data?.totalFailed || 0;
                        return `Sent: ${sent} | Failed: ${failed}`;
                    },
                    error: 'Failed to send notifications',
                }
            );

            const result = await sendPromise;
            
            if (result.success) {
                setFormData({
                    subject: '',
                    message: '',
                    userType: 'all'
                });
            }
        } catch (err) {
            console.error('Error sending notification:', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        regularUsers: users.filter(u => u.role === 'user' && u.isActive).length,
        admins: users.filter(u => u.role === 'admin' && u.isActive).length
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_user': return <LuUserPlus className="text-gray-600" />;
            case 'new_product': return <LuPackage className="text-green-600" />;
            default: return <LuBell className="text-gray-600" />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'new_user': return 'bg-gray-100 text-gray-800';
            case 'new_product': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton to="/admin" label="Back to Dashboard" />
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#5c2d16]">Notifications</h1>
                    <p className="text-gray-600 mt-2">Send notifications and view activity</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('send')}
                            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                                activeTab === 'send'
                                    ? 'border-b-2 border-green-600 text-green-600'
                                    : 'text-gray-600 hover:text-[#5c2d16]'
                            }`}
                        >
                            <LuSend className="inline-block mr-2 text-xl" />
                            Send Notification
                        </button>
                        <button
                            onClick={() => setActiveTab('inbox')}
                            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors relative ${
                                activeTab === 'inbox'
                                    ? 'border-b-2 border-green-600 text-green-600'
                                    : 'text-gray-600 hover:text-[#5c2d16]'
                            }`}
                        >
                            <LuBell className="inline-block mr-2 text-xl" />
                            Notification Inbox
                            {notificationStats?.unread > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {notificationStats.unread}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Send Notification Tab */}
                {activeTab === 'send' && (
                    <>
                        {/* User Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white rounded-lg shadow-md p-4 text-center">
                                <LuUsers className="text-3xl text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-[#5c2d16]">{stats.totalUsers}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
                                <LuUsers className="text-3xl text-green-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg shadow-md p-4 text-center">
                                <LuUsers className="text-3xl text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Regular Users</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.regularUsers}</p>
                            </div>
                            <div className="bg-purple-50 rounded-lg shadow-md p-4 text-center">
                                <LuUsers className="text-3xl text-purple-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Admins</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                            </div>
                        </div>

                        {/* Notification Form */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <LuMail className="text-3xl text-green-600" />
                                <h2 className="text-2xl font-bold text-[#5c2d16]">Compose Notification</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Send To <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="userType"
                                        value={formData.userType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="all">All Active Users ({stats.activeUsers})</option>
                                        <option value="user">Regular Users Only ({stats.regularUsers})</option>
                                        <option value="admin">Admins Only ({stats.admins})</option>
                                    </select>
                                    <p className="text-sm text-gray-500 mt-2">
                                        This notification will be sent to <strong>{getRecipientCount()}</strong> user(s)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="e.g., New Products Available!"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Enter your message here..."
                                        rows="8"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                        disabled={loading}
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        Tip: Keep your message clear and concise
                                    </p>
                                </div>

                                {(formData.subject || formData.message) && (
                                    <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                                        <h3 className="text-lg font-semibold text-[#5c2d16] mb-3">Email Preview</h3>
                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                            <h4 className="text-xl font-bold text-[#5c2d16] mb-4">
                                                {formData.subject || '[Subject]'}
                                            </h4>
                                            <div className="text-gray-700 whitespace-pre-wrap">
                                                {formData.message || '[Message content will appear here]'}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                                                <p>Best regards,</p>
                                                <p>Prolific Healing Herbs Team</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <LuSend />
                                        {loading ? 'Sending...' : `Send to ${getRecipientCount()} User(s)`}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ subject: '', message: '', userType: 'all' })}
                                        disabled={loading}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:cursor-not-allowed"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}

                {/* Notification Inbox Tab */}
                {activeTab === 'inbox' && (
                    <>
                        {/* Stats */}
                        {notificationStats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-lg shadow-md p-4 text-center">
                                    <LuBell className="text-3xl text-gray-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-[#5c2d16]">{notificationStats.total}</p>
                                </div>
                                <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
                                    <LuBell className="text-3xl text-red-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Unread</p>
                                    <p className="text-2xl font-bold text-red-600">{notificationStats.unread}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg shadow-md p-4 text-center">
                                    <LuUserPlus className="text-3xl text-gray-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">New Users</p>
                                    <p className="text-2xl font-bold text-gray-600">{notificationStats.byType?.new_user || 0}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
                                    <LuPackage className="text-3xl text-green-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">New Products</p>
                                    <p className="text-2xl font-bold text-green-600">{notificationStats.byType?.new_product || 0}</p>
                                </div>
                            </div>
                        )}

                        {/* Filter & Actions */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700">Filter:</label>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="all">All</option>
                                    <option value="unread">Unread</option>
                                    <option value="new_user">New Users</option>
                                    <option value="new_product">New Products</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        fetchNotifications();
                                        fetchStats();
                                        toast.success('Notifications refreshed!');
                                    }}
                                    className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                                    disabled={loading}
                                    title="Refresh notifications"
                                >
                                    <LuRefreshCcw className={`text-xl ${loading ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <LuCheckCheck />
                                    Mark All Read
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`bg-white rounded-lg shadow-md p-6 ${
                                            !notification.isRead ? 'border-l-4 border-green-600' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="text-3xl mt-1">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold text-[#5c2d16]">
                                                            {notification.title}
                                                        </h3>
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                                                            {notification.type.replace('_', ' ')}
                                                        </span>
                                                        {!notification.isRead && (
                                                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                                                New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-700 mb-2">{notification.message}</p>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </div>
                                                    {notification.metadata && (
                                                        <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm">
                                                            {notification.type === 'new_user' && notification.relatedUser && (
                                                                <p>
                                                                    <strong>User:</strong> {notification.relatedUser.name} ({notification.relatedUser.email})
                                                                </p>
                                                            )}
                                                            {notification.type === 'new_product' && notification.relatedProduct && (
                                                                <>
                                                                    <p><strong>Product:</strong> {notification.relatedProduct.name}</p>
                                                                    <p><strong>Price:</strong> ₹{notification.relatedProduct.price}</p>
                                                                    <p><strong>Emails Sent:</strong> {notification.metadata.emailsSent}</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                        className="text-green-600 hover:text-green-800 p-2"
                                                        title="Mark as read"
                                                    >
                                                        <LuCheck className="text-xl" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteNotification(notification._id)}
                                                    className="text-red-600 hover:text-red-800 p-2"
                                                    title="Delete"
                                                >
                                                    <LuTrash2 className="text-xl" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                    <LuBell className="text-6xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No notifications found</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;
