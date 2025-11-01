import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateOrderStatus, deleteOrder } from '../../../services/adminService';
import api from '../../../api/axiosConfig';
import BackButton from '../../../components/common/BackButton';
import { getSocket } from '../../../utils/socket';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrderDetails();
        
        // Initialize socket connection
        const socket = getSocket();
        
        // Listen for real-time order status updates
        socket.on('order_status_updated', (data) => {
            if (data.orderId === id) {
                console.log('📦 Order status updated:', data);
                toast.success(`Order status updated to ${data.status}`, {
                    duration: 3000,
                });
                fetchOrderDetails(); // Refresh order details
            }
        });
        
        // Listen for order deletion
        socket.on('order_deleted', (data) => {
            if (data.orderId === id) {
                console.log('🗑️ Order deleted:', data);
                toast.success('Order was deleted', {
                    duration: 3000,
                });
                navigate('/admin/orders');
            }
        });
        
        // Cleanup on unmount
        return () => {
            socket.off('order_status_updated');
            socket.off('order_deleted');
        };
    }, [id, navigate]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data);
        } catch (error) {
            console.error('Error fetching order:', error);
            setError('Failed to load order details');
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (newStatus) => {
        if (window.confirm(`Update order status to: ${newStatus}?`)) {
            const updatePromise = updateOrderStatus(id, newStatus);
            
            toast.promise(
                updatePromise,
                {
                    loading: 'Updating order...',
                    success: `Order marked as ${newStatus}!`,
                    error: 'Failed to update order',
                }
            );

            const result = await updatePromise;
            if (result.success) {
                fetchOrderDetails();
            }
        }
    };

    const handleDeleteOrder = async () => {
        if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            const deletePromise = deleteOrder(id);
            
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
                navigate('/admin/orders');
            }
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (window.confirm(`Change order status to: ${newStatus}?`)) {
            const updatePromise = updateOrderStatus(id, newStatus);
            
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
                fetchOrderDetails();
            }
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            toast.loading('Generating invoice...');
            const response = await api.get(`/invoices/download/${id}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${id.slice(-8).toUpperCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.dismiss();
            toast.success('Invoice downloaded successfully!');
        } catch (error) {
            toast.dismiss();
            console.error('Error downloading invoice:', error);
            toast.error('Failed to download invoice. Please try again.');
        }
    };

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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <BackButton to="/admin/orders" label="Back to Orders" />
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4">
                        {error || 'Order not found'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <BackButton to="/admin/orders" label="Back to Orders" />
                
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-[#5c2d16]">
                                Order #{order._id.slice(-8).toUpperCase()}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(order.orderStatus)} mb-2`}>
                                {order.orderStatus.toUpperCase()}
                            </span>
                            <br />
                            <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full ${getPaymentColor(order.paymentStatus)}`}>
                                Payment: {order.paymentStatus.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Order Actions */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-[#5c2d16] mb-4">Order Management</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Status Dropdown */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Change Status:</label>
                            <select
                                value={order.orderStatus}
                                onChange={(e) => {
                                    if (e.target.value !== order.orderStatus) {
                                        handleStatusChange(e.target.value);
                                    }
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                                onClick={() => handleUpdateStatus(getNextStatus(order.orderStatus))}
                                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                            >
                                ➜ Mark as {getNextStatus(order.orderStatus)}
                            </button>
                        )}
                        
                        <button
                            onClick={handleDeleteOrder}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                        >
                            Delete Order
                        </button>

                        <button
                            onClick={handleDownloadInvoice}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                            📄 Download Invoice
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-[#5c2d16] mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-[#5c2d16]">
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
                                                <div className="mt-1 space-y-1">
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
                                                    {item.bundleDetails.savingsAmount > 0 && ` - Save ₹${item.bundleDetails.savingsAmount}`}
                                                </p>
                                            )}

                                            {/* Offer Text */}
                                            {item.offerText && (
                                                <p className="text-xs text-pink-600 font-medium mb-1">
                                                    ⭐ {item.offerText}
                                                </p>
                                            )}
                                            
                                            <p className="text-sm text-gray-600">
                                                Quantity: {item.quantity}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Price: ₹{item.price?.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-[#5c2d16]">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 pt-6 border-t space-y-2">
                                {(() => {
                                    const shippingCost = order.shippingCost !== undefined ? order.shippingCost : 49;
                                    const subtotal = order.totalAmount - shippingCost;
                                    
                                    return (
                                        <>
                                            <div className="flex justify-between text-gray-700">
                                                <span>Subtotal:</span>
                                                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-700">
                                                <span>Shipping:</span>
                                                <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                                                    {shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE'}
                                                </span>
                                            </div>
                                            {shippingCost === 0 && (
                                                <p className="text-xs text-green-600">✓ Free shipping</p>
                                            )}
                                        </>
                                    );
                                })()}
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span className="font-medium">-₹{order.discount?.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-bold text-[#5c2d16] pt-2 border-t">
                                    <span>Total:</span>
                                    <span>₹{order.finalAmount?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-[#5c2d16] mb-4">Order Timeline</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-4 h-4 rounded-full mt-1 ${order.orderStatus !== 'cancelled' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <div>
                                        <p className="font-semibold text-[#5c2d16]">Order Placed</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                
                                {order.orderStatus === 'shipped' || order.orderStatus === 'delivered' ? (
                                    <div className="flex items-start gap-4">
                                        <div className="w-4 h-4 rounded-full bg-green-500 mt-1"></div>
                                        <div>
                                            <p className="font-semibold text-[#5c2d16]">Shipped</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.updatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                                
                                {order.orderStatus === 'delivered' ? (
                                    <div className="flex items-start gap-4">
                                        <div className="w-4 h-4 rounded-full bg-green-500 mt-1"></div>
                                        <div>
                                            <p className="font-semibold text-[#5c2d16]">Delivered</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.updatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                                
                                {order.orderStatus === 'cancelled' ? (
                                    <div className="flex items-start gap-4">
                                        <div className="w-4 h-4 rounded-full bg-red-500 mt-1"></div>
                                        <div>
                                            <p className="font-semibold text-red-600">Cancelled</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.updatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Right Side */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-[#5c2d16] mb-4">Customer</h2>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    <span className="font-medium text-gray-700">Name:</span><br />
                                    <span className="text-[#5c2d16]">{order.user?.name || 'N/A'}</span>
                                </p>
                                <p className="text-sm">
                                    <span className="font-medium text-gray-700">Email:</span><br />
                                    <span className="text-[#5c2d16]">{order.user?.email || 'N/A'}</span>
                                </p>
                                {order.user?.phone && (
                                    <p className="text-sm">
                                        <span className="font-medium text-gray-700">Phone:</span><br />
                                        <span className="text-[#5c2d16]">{order.user.phone}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-[#5c2d16] mb-4">Shipping Address</h2>
                            {order.shippingAddress ? (
                                <div className="text-sm text-gray-700 space-y-1">
                                    {order.shippingAddress.fullName && (
                                        <p className="font-semibold text-[#5c2d16]">{order.shippingAddress.fullName}</p>
                                    )}
                                    <p>{order.shippingAddress.addressLine}</p>
                                    {order.shippingAddress.landmark && (
                                        <p>Landmark: {order.shippingAddress.landmark}</p>
                                    )}
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                    <p>{order.shippingAddress.pincode}</p>
                                    {order.shippingAddress.phone && (
                                        <p className="pt-2 font-medium">Phone: {order.shippingAddress.phone}</p>
                                    )}
                                    {order.shippingAddress.email && (
                                        <p className="text-xs">Email: {order.shippingAddress.email}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">No address provided</p>
                            )}
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-[#5c2d16] mb-4">Payment</h2>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium text-gray-700">Method:</span><br />
                                    <span className="text-[#5c2d16] uppercase">{order.paymentMethod}</span>
                                </p>
                                <p>
                                    <span className="font-medium text-gray-700">Status:</span><br />
                                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPaymentColor(order.paymentStatus)}`}>
                                        {order.paymentStatus.toUpperCase()}
                                    </span>
                                </p>
                                {order.razorpayPaymentId && (
                                    <p>
                                        <span className="font-medium text-gray-700">Transaction ID:</span><br />
                                        <span className="text-[#5c2d16] font-mono text-xs">{order.razorpayPaymentId}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;

