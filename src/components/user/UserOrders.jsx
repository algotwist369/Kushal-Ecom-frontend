import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BsBoxSeam, BsCheckCircle, BsClock, BsTruck, BsXCircle, BsEye, BsChevronLeft, BsTag } from "react-icons/bs";
import api from "../../api/axiosConfig";
import toast from "react-hot-toast";

const UserOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/my-orders');
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const openCancelModal = (orderId, orderStatus) => {
        if (orderStatus === 'delivered') {
            toast.error('Cannot cancel delivered orders');
            return;
        }
        
        if (orderStatus === 'cancelled') {
            toast.error('Order is already cancelled');
            return;
        }

        setSelectedOrderId(orderId);
        setCancellationReason('');
        setCancelModalOpen(true);
    };

    const handleCancelOrder = async () => {
        if (!cancellationReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        console.log('Cancelling order:', selectedOrderId, 'Reason:', cancellationReason);

        try {
            const response = await api.put(`/orders/${selectedOrderId}/cancel`, {
                reason: cancellationReason.trim()
            });
            console.log('Cancellation response:', response.data);
            toast.success('Order cancelled successfully');
            setCancelModalOpen(false);
            setSelectedOrderId(null);
            setCancellationReason('');
            fetchOrders();
        } catch (error) {
            console.error('Cancellation error:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const filteredOrders = filter === 'all' 
        ? orders 
        : orders.filter(order => order.orderStatus === filter);

    // Pagination calculations
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-[#5c2d16] mb-8">My Orders</h1>
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 h-48"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#5c2d16] mb-6 transition group"
                >
                    <BsChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Home</span>
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#5c2d16] mb-2">My Orders</h1>
                    <p className="text-gray-600">Track and manage your purchases</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    {[
                        { value: 'all', label: `All (${orders.length})` },
                        { value: 'pending', label: `Pending (${orders.filter(o => o.orderStatus === 'pending').length})` },
                        { value: 'processing', label: `Processing (${orders.filter(o => o.orderStatus === 'processing').length})` },
                        { value: 'shipped', label: `Shipped (${orders.filter(o => o.orderStatus === 'shipped').length})` },
                        { value: 'delivered', label: `Delivered (${orders.filter(o => o.orderStatus === 'delivered').length})` },
                        { value: 'cancelled', label: `Cancelled (${orders.filter(o => o.orderStatus === 'cancelled').length})` }
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                                filter === tab.value 
                                    ? 'border-[#5c2d16] text-[#5c2d16]' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-16 text-center">
                        <BsBoxSeam className="mx-auto text-6xl text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-[#5c2d16] mb-2">No Orders Found</h2>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all' 
                                ? "You haven't placed any orders yet" 
                                : `No ${filter} orders`}
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-[#5c2d16] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {currentOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                                >
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                                        <span className="font-bold text-[#5c2d16] font-mono">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </span>
                                        <span className="hidden sm:inline text-gray-300">|</span>
                                        <span className="text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                                month: 'long', 
                                                day: 'numeric', 
                                                year: 'numeric' 
                                            })}
                                        </span>
                                        <span className="hidden sm:inline text-gray-300">|</span>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            order.orderStatus === 'shipped' ? 'bg-gray-100 text-gray-700' :
                                            order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {order.orderStatus.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-left md:text-right">
                                        {(() => {
                                            const shippingCost = order.shippingCost !== undefined ? order.shippingCost : 49;
                                            const subtotal = order.totalAmount - shippingCost;
                                            
                                            return (
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500">Subtotal: ₹{subtotal.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Shipping: <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                                                            {shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE'}
                                                        </span>
                                                    </p>
                                                    {order.discount > 0 && (
                                                        <p className="text-xs text-green-600 font-medium">Discount: -₹{order.discount?.toFixed(2)}</p>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        <p className="text-sm text-gray-600 mb-1 mt-2">Order Total</p>
                                        <p className="text-2xl font-bold text-[#5c2d16]">₹{order.finalAmount?.toFixed(2)}</p>
                                        {order.coupon && (
                                            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1 md:justify-end">
                                                <BsTag className="text-xs" />
                                                {order.coupon.code}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                                                <img
                                                    src={item.product?.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23f5f5f5" width="60" height="60"/%3E%3C/svg%3E'}
                                                    alt={item.product?.name || 'Product'}
                                                    className="w-20 h-20 rounded-lg border border-gray-200 object-cover cursor-pointer hover:shadow-md transition"
                                                    onClick={() => item.product?.slug && navigate(`/products/${item.product.slug}`)}
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23f5f5f5" width="60" height="60"/%3E%3C/svg%3E';
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 
                                                        className="font-semibold text-[#5c2d16] mb-1 hover:text-gray-600 cursor-pointer truncate"
                                                        onClick={() => item.product?.slug && navigate(`/products/${item.product.slug}`)}
                                                    >
                                                        {item.product?.name || 'Product'}
                                                    </h3>
                                                    
                                                    {/* Pack Details */}
                                                    {item.packDetails?.isPack && (
                                                        <p className="text-xs text-gray-600 font-medium mb-1">
                                                            📦 {item.packDetails.label || `Pack of ${item.packDetails.packSize}`}
                                                            {item.packDetails.savingsPercent > 0 && ` - Save ${item.packDetails.savingsPercent}%`}
                                                        </p>
                                                    )}

                                                    {/* Free Products */}
                                                    {item.freeProducts && item.freeProducts.length > 0 && (
                                                        <div className="space-y-0.5 mb-1">
                                                            {item.freeProducts.map((fp, fpIdx) => (
                                                                <p key={fpIdx} className="text-xs text-green-600 font-medium">
                                                                    🎁 FREE: {fp.name} × {fp.quantity}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Bundle Details */}
                                                    {item.bundleDetails?.isBundle && (
                                                        <p className="text-xs text-orange-600 font-medium mb-1">
                                                            🔗 Bundle with {item.bundleDetails.bundledProductName}
                                                        </p>
                                                    )}

                                                    {/* Offer Text */}
                                                    {item.offerText && (
                                                        <p className="text-xs text-pink-600 font-medium mb-1">
                                                            ⭐ {item.offerText}
                                                        </p>
                                                    )}
                                                    
                                                    <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price?.toFixed(2)}</p>
                                                </div>
                                                <p className="font-bold text-[#5c2d16]">₹{(item.price * item.quantity)?.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Footer */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="text-sm">
                                        <p className="text-gray-700">
                                            <span className="font-medium">{order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Payment Pending'}</span>
                                            <span className="text-gray-400 mx-2">•</span>
                                            <span className="text-gray-600">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                                        </p>
                                        {order.coupon && (
                                            <p className="text-green-600 font-medium mt-1 flex items-center gap-1">
                                                <BsTag />
                                                Coupon: {order.coupon.code}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={() => navigate(`/order-details/${order._id}`)}
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                                        >
                                            <BsEye />
                                            View Details
                                        </button>
                                        {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                                            <button
                                                onClick={() => openCancelModal(order._id, order.orderStatus)}
                                                className="px-4 py-2 border border-[#5c2d16] text-[#5c2d16] rounded-lg hover:bg-[#5c2d16] hover:text-white transition text-sm font-medium"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                        {order.orderStatus === 'delivered' && (
                                            <button
                                                onClick={() => navigate(`/products/${order.items[0]?.product?.slug || order.items[0]?.product?._id}`)}
                                                className="px-4 py-2 bg-[#5c2d16] text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                                            >
                                                Buy Again
                                            </button>
                                        )}
                                    </div>
                                </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t pt-6 gap-4">
                            <p className="text-sm text-gray-600">
                                Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                            </p>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                
                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        // Show first, last, current, and adjacent pages
                                        if (
                                            pageNumber === 1 ||
                                            pageNumber === totalPages ||
                                            Math.abs(pageNumber - currentPage) <= 1
                                        ) {
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => setCurrentPage(pageNumber)}
                                                    className={`w-10 h-10 rounded text-sm font-medium ${
                                                        currentPage === pageNumber
                                                            ? 'bg-[#5c2d16] text-white'
                                                            : 'border hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        } else if (
                                            pageNumber === currentPage - 2 ||
                                            pageNumber === currentPage + 2
                                        ) {
                                            return <span key={pageNumber} className="px-2">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Cancellation Modal */}
                {cancelModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setCancelModalOpen(false)}>
                        <div className="bg-white rounded-lg max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-2xl font-bold text-[#5c2d16] mb-4">Cancel Order</h2>
                            <p className="text-gray-600 mb-6">Please select a reason for cancellation:</p>
                            
                            <div className="space-y-3 mb-8">
                                {[
                                    'Found a better price elsewhere',
                                    'Ordered by mistake',
                                    'Need to change delivery address',
                                    'Delivery time is too long',
                                    'Changed my mind',
                                    'Other'
                                ].map((reason) => (
                                    <label 
                                        key={reason} 
                                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                                            cancellationReason === reason 
                                                ? 'border-[#5c2d16] bg-gray-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="cancellationReason"
                                            value={reason}
                                            checked={cancellationReason === reason}
                                            onChange={(e) => setCancellationReason(e.target.value)}
                                            className="mt-0.5 w-4 h-4 text-[#5c2d16]"
                                        />
                                        <span className="text-sm text-gray-700 font-medium">{reason}</span>
                                    </label>
                                ))}
                            </div>

                            {cancellationReason === 'Other' && (
                                <div className="mb-6">
                                    <textarea
                                        placeholder="Please specify your reason..."
                                        onChange={(e) => setCancellationReason(e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent"
                                        autoFocus
                                    />
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setCancelModalOpen(false);
                                        setSelectedOrderId(null);
                                        setCancellationReason('');
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Keep Order
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={!cancellationReason.trim()}
                                    className="flex-1 px-6 py-3 bg-[#5c2d16] text-white rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Confirm Cancellation
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserOrders;
