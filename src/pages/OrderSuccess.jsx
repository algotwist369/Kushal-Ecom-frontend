import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BsCheckCircleFill, BsBoxSeam, BsChevronLeft } from 'react-icons/bs';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (orderId) {
            fetchOrderDetails();
        } else {
            setLoading(false);
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            // Use my-orders endpoint to avoid admin permission error
            const response = await api.get('/orders/my-orders');
            const orders = response.data || [];
            const order = orders.find(o => o._id === orderId);
            
            if (order) {
                setOrderDetails(order);
            } else {
                console.warn('Order not found in user orders');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5c2d16]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#5c2d16] mb-6 transition group"
                >
                    <BsChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">View All Orders</span>
                </button>

                <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
                    {/* Success Icon */}
                    <div className="mb-6">
                        <div className="mx-auto w-24 h-24 bg-[#5c2d16] rounded-full flex items-center justify-center">
                            <BsCheckCircleFill className="text-5xl text-white" />
                        </div>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-bold text-[#5c2d16] mb-3">
                        Order Placed Successfully!
                    </h1>
                    <p className="text-gray-600 mb-8 text-lg">
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>

                    {/* Order ID */}
                    {orderId && (
                        <div className="border-2 border-[#5c2d16] rounded-lg p-5 mb-8 bg-gray-50">
                            <p className="text-sm font-medium text-gray-600 mb-1">Order ID</p>
                            <p className="text-2xl font-bold text-[#5c2d16] font-mono">
                                #{orderId.slice(-8).toUpperCase()}
                            </p>
                        </div>
                    )}

                    {/* Order Details Summary */}
                    {orderDetails && (
                        <div className="mb-8 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Order Amount */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-3">Order Summary</p>
                                    {(() => {
                                        const shippingCost = orderDetails.shippingCost !== undefined ? orderDetails.shippingCost : 49;
                                        const subtotal = orderDetails.totalAmount - shippingCost;
                                        
                                        return (
                                            <>
                                                <div className="space-y-2 text-sm mb-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Subtotal:</span>
                                                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Shipping:</span>
                                                        <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                                                            {shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE'}
                                                        </span>
                                                    </div>
                                                    {shippingCost === 0 && (
                                                        <p className="text-xs text-green-600">✓ Free shipping applied</p>
                                                    )}
                                                    {orderDetails.discount > 0 && (
                                                        <div className="flex justify-between text-green-600">
                                                            <span>Discount:</span>
                                                            <span className="font-medium">-₹{orderDetails.discount?.toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pt-2 border-t border-gray-200">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-medium text-gray-700">Total:</span>
                                                        <span className="text-2xl font-bold text-[#5c2d16]">₹{orderDetails.finalAmount?.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                    {orderDetails.coupon && (
                                        <p className="text-xs text-green-600 mt-2 font-medium">
                                            ✓ Coupon Applied: {orderDetails.coupon.code}
                                        </p>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                                    <p className="text-lg font-semibold text-[#5c2d16] capitalize">
                                        {orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {orderDetails.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 text-left">
                        <div className="flex items-start gap-4">
                            <BsBoxSeam className="text-3xl text-gray-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-[#5c2d16] mb-2 text-lg">What's Next?</h3>
                                <ul className="text-sm text-gray-700 space-y-2">
                                    <li>✓ You will receive an order confirmation email shortly</li>
                                    <li>✓ Track your order status in "My Orders" section</li>
                                    <li>✓ Expected delivery within 5-7 business days</li>
                                    {orderDetails?.paymentMethod === 'cod' && (
                                        <li>✓ Keep exact change ready for cash on delivery</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {orderId && (
                            <button
                                onClick={() => navigate(`/order-details/${orderId}`)}
                                className="w-full bg-[#5c2d16] text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition font-semibold"
                            >
                                View Order Details
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/orders')}
                            className="w-full bg-white text-[#5c2d16] py-3 px-6 rounded-lg border-2 border-[#5c2d16] hover:bg-gray-50 transition font-semibold"
                        >
                            View All Orders
                        </button>
                        <button
                            onClick={() => navigate('/products')}
                            className="w-full text-gray-600 hover:text-[#5c2d16] py-2 font-medium"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Need help? Contact us at support@ayurvedicstore.com</p>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;

