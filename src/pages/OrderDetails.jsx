import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsArrowLeft, BsCheck, BsTag, BsChevronLeft } from 'react-icons/bs';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    // Socket.IO for real-time order updates
    useEffect(() => {
        if (!order) return;

        const socket = io(import.meta.env.VITE_API_URL?.replace('/v1/api', '') || 'http://localhost:5000');

        socket.on('order_status_updated', (data) => {
            if (data.orderId === orderId) {
                console.log('📦 Order status updated:', data.status);
                setOrder(prev => ({ ...prev, orderStatus: data.status }));
                toast.success(`Order status updated to: ${data.status}`);
            }
        });

        return () => socket.disconnect();
    }, [orderId, order]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/orders/my-orders`);
            const orders = response.data || [];
            const foundOrder = orders.find(o => o._id === orderId);
            
            if (foundOrder) {
                setOrder(foundOrder);
            } else {
                toast.error('Order not found');
                navigate('/orders');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const openCancelModal = () => {
        if (order.orderStatus === 'delivered') {
            toast.error('Cannot cancel delivered orders');
            return;
        }
        
        if (order.orderStatus === 'cancelled') {
            toast.error('Order is already cancelled');
            return;
        }

        setCancellationReason('');
        setCancelModalOpen(true);
    };

    const handleCancelOrder = async () => {
        if (!cancellationReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        try {
            const response = await api.put(`/orders/${orderId}/cancel`, {
                reason: cancellationReason.trim()
            });
            toast.success('Order cancelled successfully');
            setCancelModalOpen(false);
            setCancellationReason('');
            fetchOrderDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            toast.loading('Generating invoice...');
            const response = await api.get(`/invoices/download/${orderId}`, {
                responseType: 'blob' // Important for file download
            });
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${orderId.slice(-8).toUpperCase()}.pdf`);
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

    // Order Status Progress
    const getOrderProgress = () => {
        const statuses = ['pending', 'processing', 'shipped', 'delivered'];
        const currentIndex = statuses.indexOf(order.orderStatus);
        
        if (order.orderStatus === 'cancelled') {
            return { steps: [], cancelled: true };
        }

        return {
            steps: statuses.map((status, index) => ({
                label: status.charAt(0).toUpperCase() + status.slice(1),
                completed: index <= currentIndex,
                active: index === currentIndex
            })),
            cancelled: false
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-32"></div>
                        <div className="bg-white border border-gray-200 rounded-lg p-8 h-64"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const progress = getOrderProgress();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#5c2d16] mb-6 transition group"
                >
                    <BsChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Orders</span>
                </button>

                {/* Order Header */}
                <div className="mb-8 pb-6 border-b">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#5c2d16] mb-1">
                                Order #{order._id.slice(-8).toUpperCase()}
                            </h1>
                            <p className="text-gray-600">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
                                <button
                                    onClick={openCancelModal}
                                    className="px-4 py-2 border border-[#5c2d16] text-[#5c2d16] rounded hover:bg-[#5c2d16] hover:text-white transition text-sm font-medium"
                                >
                                    Cancel Order
                                </button>
                            )}
                            <button
                                onClick={handleDownloadInvoice}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium inline-flex items-center gap-2"
                            >
                                <span>📄</span> Download Invoice
                            </button>
                        </div>
                    </div>

                    {/* Status Tracking Bar */}
                    {!progress.cancelled ? (
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-2">
                                {progress.steps.map((step, index) => (
                                    <React.Fragment key={step.label}>
                                        {/* Step Circle */}
                                        <div className="flex flex-col items-center flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                                                step.completed 
                                                    ? 'bg-[#5c2d16] border-[#5c2d16]' 
                                                    : 'bg-white border-gray-300'
                                            }`}>
                                                {step.completed && (
                                                    <BsCheck className="text-2xl text-white" />
                                                )}
                                            </div>
                                            <p className={`mt-2 text-xs font-medium ${
                                                step.active ? 'text-[#5c2d16]' : step.completed ? 'text-gray-700' : 'text-gray-400'
                                            }`}>
                                                {step.label}
                                            </p>
                                        </div>
                                        
                                        {/* Connecting Line */}
                                        {index < progress.steps.length - 1 && (
                                            <div className={`h-0.5 flex-1 -mt-6 ${
                                                progress.steps[index + 1].completed ? 'bg-[#5c2d16]' : 'bg-gray-300'
                                            }`}></div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 p-4 border rounded bg-gray-50">
                            <p className="text-center text-[#5c2d16] font-medium">Order Cancelled</p>
                            {order.cancellationReason && (
                                <p className="text-center text-sm text-gray-600 mt-1">Reason: {order.cancellationReason}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Delivery Address */}
                <div className="mb-6 pb-6 border-b">
                    <h2 className="text-lg font-semibold text-[#5c2d16] mb-4">Delivery Address</h2>
                    <div className="text-sm text-gray-700 space-y-1 bg-gray-50 p-4 rounded">
                        <p className="font-medium text-[#5c2d16]">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.addressLine}</p>
                        {order.shippingAddress.landmark && <p>Near: {order.shippingAddress.landmark}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        <p className="pt-2 text-gray-600">Phone: {order.shippingAddress.phone}</p>
                    </div>
                </div>

                {/* Order Items */}
                <div className="mb-6 pb-6 border-b">
                    <h2 className="text-lg font-semibold text-[#5c2d16] mb-4">Items ({order.items?.length})</h2>
                    <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 border rounded">
                                <img
                                    src={item.product?.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23f5f5f5" width="60" height="60"/%3E%3C/svg%3E'}
                                    alt={item.product?.name || 'Product'}
                                    className="w-20 h-20 rounded border object-cover cursor-pointer"
                                    onClick={() => navigate(`/products/${item.product?.slug || item.product?._id}`)}
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23f5f5f5" width="60" height="60"/%3E%3C/svg%3E';
                                    }}
                                />
                                <div className="flex-1">
                                    <h3 
                                        className="font-semibold text-[#5c2d16] mb-1 hover:underline cursor-pointer"
                                        onClick={() => navigate(`/products/${item.product?.slug || item.product?._id}`)}
                                    >
                                        {item.product?.name || 'Product'}
                                    </h3>
                                    
                                    {/* Pack Info */}
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
                                    
                                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    <p className="text-sm text-gray-600">₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-[#5c2d16]">₹{item.price * item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Applied Coupon */}
                {order.coupon && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[#5c2d16] mb-4">Applied Coupon</h2>
                        <div className="border-2 border-green-600 rounded-lg p-4 bg-green-50">
                            <div className="flex items-center gap-3">
                                <BsTag className="text-green-600 text-xl flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-lg font-bold text-[#5c2d16] font-mono">{order.coupon.code}</p>
                                    <p className="text-sm text-green-700 font-medium mt-1">
                                        Saved ₹{order.coupon.discountAmount?.toFixed(2) || 0}
                                    </p>
                                </div>
                                <BsCheck className="text-green-600 text-3xl flex-shrink-0" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Price Summary */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#5c2d16] mb-4">Payment Summary</h2>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="space-y-3 text-sm mb-4">
                            {/* Calculate shipping with proper fallback */}
                            {(() => {
                                const shippingCost = order.shippingCost !== undefined ? order.shippingCost : 49;
                                const subtotal = order.totalAmount - shippingCost;
                                
                                return (
                                    <>
                                        <div className="flex justify-between text-gray-700">
                                            <span>Subtotal</span>
                                            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="flex justify-between text-gray-700">
                                            <span>Shipping</span>
                                            <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                                                {shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE'}
                                            </span>
                                        </div>
                                        
                                        {shippingCost === 0 && (
                                            <div className="bg-green-50 border border-green-200 rounded px-3 py-2">
                                                <p className="text-xs text-green-700 font-medium">✓ Free shipping applied</p>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                            
                            {order.coupon && order.coupon.discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Coupon Discount ({order.coupon.code})</span>
                                    <span className="font-medium">-₹{order.coupon.discountAmount?.toFixed(2)}</span>
                                </div>
                            )}
                            
                            {order.discount && order.discount > 0 && !order.coupon && (
                                <div className="flex justify-between text-green-600">
                                    <span>Product Discount</span>
                                    <span className="font-medium">-₹{order.discount?.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 mb-4">
                            <div className="flex justify-between text-[#5c2d16]">
                                <span className="text-lg font-bold">Total Amount</span>
                                <span className="text-2xl font-bold">₹{order.finalAmount?.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Payment Method</span>
                                <span className="text-sm text-[#5c2d16] font-semibold capitalize">
                                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Payment Status</span>
                                <span className={`text-sm font-semibold capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

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

export default OrderDetails;
