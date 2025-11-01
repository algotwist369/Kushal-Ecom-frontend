import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../../services/adminService';
import BackButton from '../../../components/common/BackButton';
import { getSocket } from '../../../utils/socket';

const AdminOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchOrders();
        
        // Initialize socket connection
        const socket = getSocket();
        
        // Listen for real-time order status updates
        socket.on('order_status_updated', (data) => {
            console.log('📦 Order status updated:', data);
            toast.success(`Order #${data.orderId.slice(-8).toUpperCase()} status updated to ${data.status}`, {
                duration: 3000,
            });
            fetchOrders(); // Refresh orders list
        });
        
        // Listen for order deletion
        socket.on('order_deleted', (data) => {
            console.log('🗑️ Order deleted:', data);
            toast.success(`Order deleted successfully`, {
                duration: 3000,
            });
            fetchOrders(); // Refresh orders list
        });
        
        // Cleanup on unmount
        return () => {
            socket.off('order_status_updated');
            socket.off('order_deleted');
        };
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const result = await getAllOrders();
        if (result.success) {
            setOrders(result.data);
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (window.confirm(`Update order status to: ${newStatus}?`)) {
            const updatePromise = updateOrderStatus(orderId, newStatus);
            
            toast.promise(
                updatePromise,
                {
                    loading: 'Updating order status...',
                    success: `Order marked as ${newStatus}!`,
                    error: 'Failed to update order status',
                }
            );

            const result = await updatePromise;
            if (result.success) {
                fetchOrders();
            }
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            const deletePromise = deleteOrder(orderId);
            
            toast.promise(
                deletePromise,
                {
                    loading: 'Deleting order...',
                    success: 'Order deleted successfully!',
                    error: 'Failed to delete order',
                }
            );

            const result = await deletePromise;
            if (result.success) {
                fetchOrders();
            }
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        if (window.confirm(`Change order status to: ${newStatus}?`)) {
            const updatePromise = updateOrderStatus(orderId, newStatus);
            
            toast.promise(
                updatePromise,
                {
                    loading: 'Updating order status...',
                    success: `Order status changed to ${newStatus}!`,
                    error: 'Failed to update order status',
                }
            );

            const result = await updatePromise;
            if (result.success) {
                fetchOrders();
            }
        }
    };

    const getFilteredAndSortedOrders = () => {
        let filtered = orders.filter(order => {
            const matchesSearch = 
                order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.shippingAddress?.phone?.includes(searchTerm);
            
            const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
            const matchesPayment = filterPayment === 'all' || order.paymentStatus === filterPayment;
            
            return matchesSearch && matchesStatus && matchesPayment;
        });

        // Sort orders
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'amount-high':
                    return b.finalAmount - a.finalAmount;
                case 'amount-low':
                    return a.finalAmount - b.finalAmount;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const filteredOrders = getFilteredAndSortedOrders();

    const getStatusColor = (status) => {
        const colors = {
            processing: 'bg-gray-100 text-gray-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getNextStatus = (current) => {
        const flow = {
            processing: 'shipped',
            shipped: 'delivered',
            delivered: null,
            cancelled: null
        };
        return flow[current];
    };

    const calculateStats = () => {
        return {
            total: orders.length,
            processing: orders.filter(o => o.orderStatus === 'processing').length,
            shipped: orders.filter(o => o.orderStatus === 'shipped').length,
            delivered: orders.filter(o => o.orderStatus === 'delivered').length,
            cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
            totalRevenue: orders.reduce((sum, o) => o.paymentStatus === 'paid' ? sum + o.finalAmount : sum, 0),
            pendingPayments: orders.filter(o => o.paymentStatus === 'pending').length
        };
    };

    const stats = calculateStats();

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
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#5c2d16]">Order Management</h1>
                    <p className="text-gray-600 mt-2">Manage all customer orders</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4 text-center">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-[#5c2d16]">{stats.total}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg shadow-md p-4 text-center">
                        <p className="text-sm text-gray-600">Processing</p>
                        <p className="text-2xl font-bold text-gray-600">{stats.processing}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg shadow-md p-4 text-center">
                        <p className="text-sm text-gray-600">Shipped</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg shadow-md p-4 text-center">
                        <p className="text-sm text-gray-600">Delivered</p>
                        <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg shadow-md p-4 text-center">
                        <p className="text-sm text-gray-600">Cancelled</p>
                        <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg shadow-md p-4 text-center">
                        <p className="text-sm text-gray-600">Pending Pay</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg shadow-md p-4 text-center">
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-xl font-bold text-emerald-600">₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Orders
                            </label>
                            <input
                                type="text"
                                placeholder="Search by ID, customer, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Order Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="all">All Statuses</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Status
                            </label>
                            <select
                                value={filterPayment}
                                onChange={(e) => setFilterPayment(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="all">All Payments</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="amount-high">Amount: High to Low</option>
                                <option value="amount-low">Amount: Low to High</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-[#5c2d16]">
                                                Order #{order._id.slice(-8).toUpperCase()}
                                            </h3>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPaymentColor(order.paymentStatus)}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Customer:</span> {order.user?.name || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Email:</span> {order.user?.email || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Phone:</span> {order.shippingAddress?.phone || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Payment:</span> {order.paymentMethod.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {(() => {
                                            const shippingCost = order.shippingCost !== undefined ? order.shippingCost : 49;
                                            const subtotal = order.totalAmount - shippingCost;
                                            
                                            return (
                                                <div className="space-y-1">
                                                    <p className="text-sm text-gray-600">
                                                        Subtotal: <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Shipping: <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                                                            {shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE'}
                                                        </span>
                                                    </p>
                                                    {order.discount > 0 && (
                                                        <p className="text-sm text-green-600">
                                                            Discount: -₹{order.discount?.toFixed(2)}
                                                        </p>
                                                    )}
                                                    <p className="text-xl font-bold text-green-600">
                                                        ₹{order.finalAmount?.toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {order.items?.length || 0} item(s)
                                                    </p>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="border-t border-gray-200 pt-4 mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Items:</h4>
                                    <div className="space-y-2">
                                        {order.items?.map((item, index) => (
                                            <div key={index} className="text-sm bg-gray-50 p-3 rounded">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-gray-700 font-medium">
                                                        {item.product?.name || 'Product'} <span className="text-gray-500">x {item.quantity}</span>
                                                    </span>
                                                    <span className="text-[#5c2d16] font-medium">
                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                                
                                                {/* Pack Details */}
                                                {item.packDetails?.isPack && (
                                                    <p className="text-xs text-gray-600 font-medium">
                                                        📦 {item.packDetails.label}
                                                        {item.packDetails.savingsPercent > 0 && ` - Save ${item.packDetails.savingsPercent}%`}
                                                    </p>
                                                )}

                                                {/* Free Products */}
                                                {item.freeProducts && item.freeProducts.length > 0 && (
                                                    <div className="space-y-0.5">
                                                        {item.freeProducts.map((fp, fpIdx) => (
                                                            <p key={fpIdx} className="text-xs text-green-600 font-medium">
                                                                🎁 FREE: {fp.name} × {fp.quantity}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Bundle Details */}
                                                {item.bundleDetails?.isBundle && (
                                                    <p className="text-xs text-orange-600 font-medium">
                                                        🔗 Bundle with {item.bundleDetails.bundledProductName}
                                                    </p>
                                                )}

                                                {/* Offer Text */}
                                                {item.offerText && (
                                                    <p className="text-xs text-pink-600 font-medium">
                                                        ⭐ {item.offerText}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {order.shippingAddress && (
                                    <div className="border-t border-gray-200 pt-4 mb-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address:</h4>
                                        <p className="text-sm text-gray-600">
                                            {order.shippingAddress.fullName && <><strong>{order.shippingAddress.fullName}</strong><br /></>}
                                            {order.shippingAddress.addressLine}, {order.shippingAddress.city}
                                            {order.shippingAddress.landmark && ` (${order.shippingAddress.landmark})`}
                                            <br />
                                            {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                                    {/* Status Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium text-gray-700">Change Status:</label>
                                        <select
                                            value={order.orderStatus}
                                            onChange={(e) => {
                                                if (e.target.value !== order.orderStatus) {
                                                    handleStatusChange(order._id, e.target.value);
                                                }
                                            }}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    
                                    {/* Quick Action Buttons */}
                                    {getNextStatus(order.orderStatus) && (
                                        <button
                                            onClick={() => handleUpdateStatus(order._id, getNextStatus(order.orderStatus))}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm"
                                        >
                                            ➜ {getNextStatus(order.orderStatus)}
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm"
                                    >
                                        View Details
                                    </button>
                                    
                                    <button
                                        onClick={() => handleDeleteOrder(order._id)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500 text-lg">No orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;

