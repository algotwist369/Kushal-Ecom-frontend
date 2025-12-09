import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BsCheckCircle, BsCreditCard, BsCash, BsChevronLeft, BsTag, BsTruck, BsShieldCheck } from 'react-icons/bs';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const orderData = location.state?.orderData;
    
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        if (!orderData) {
            navigate('/cart');
        }
    }, [orderData, navigate]);

    if (!orderData || !cart) return null;

    const placeOrder = async () => {
        const paymentMethod = orderData.paymentMethod || 'cod';
        setProcessingPayment(true);
        
        try {
            // Prepare order payload matching backend requirements
            const orderPayload = {
                paymentMethod,
                shippingAddress: {
                    fullName: orderData.shippingAddress.fullName,
                    phone: orderData.shippingAddress.phone,
                    email: orderData.shippingAddress.email,
                    addressLine: orderData.shippingAddress.addressLine,
                    landmark: orderData.shippingAddress.landmark || '',
                    city: orderData.shippingAddress.city,
                    state: orderData.shippingAddress.state,
                    pincode: orderData.shippingAddress.pincode
                }
            };
            
            // Add coupon if applied
            if (orderData.appliedCoupon) {
                orderPayload.coupon = {
                    code: orderData.appliedCoupon.code || orderData.appliedCoupon.coupon?.code,
                    discountAmount: orderData.couponDiscount || orderData.appliedCoupon.discountAmount || 0
                };
            }
            
            // Only log in development
            if (import.meta.env.DEV) {
                console.log('📦 Creating order with payload:', orderPayload);
            }

            // Create order
            const response = await api.post('/orders', orderPayload);
            const order = response.data;
            
            if (import.meta.env.DEV) {
                console.log('✅ Order created successfully:', order._id);
            }

            // If Razorpay, initiate payment
            if (paymentMethod === 'razorpay') {
                await initiateRazorpayPayment(order);
            } else {
                // COD - Success
                toast.success('Order placed successfully!');
                clearCart();
                navigate(`/order-success/${order._id}`);
            }
        } catch (error) {
            console.error('Order error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to place order';
            toast.error(errorMsg);
            navigate('/order-failure', { state: { message: errorMsg } });
        } finally {
            setProcessingPayment(false);
        }
    };

    const initiateRazorpayPayment = async (order) => {
        try {
            const { data } = await api.post('/payments/create-razorpay-order', {
                orderId: order._id
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: "Prolific Healing Herbs",
                description: `Order #${order._id}`,
                order_id: data.orderId,
                handler: async function (response) {
                    try {
                        await api.post('/payments/verify-razorpay-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: order._id
                        });

                        toast.success('Payment successful!');
                        clearCart();
                        navigate(`/order-success/${order._id}`);
                    } catch (error) {
                        toast.error('Payment verification failed');
                        navigate('/order-failure', { 
                            state: { message: 'Payment verification failed' } 
                        });
                    }
                },
                prefill: {
                    name: orderData.shippingAddress.fullName,
                    email: orderData.shippingAddress.email,
                    contact: orderData.shippingAddress.phone
                },
                theme: {
                    color: "#16a34a"
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response) {
                navigate('/order-failure', { 
                    state: { message: response.error.description || 'Payment failed' } 
                });
            });
            razorpay.open();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Payment gateway unavailable';
            toast.error(errorMsg);
            navigate('/order-failure', { 
                state: { message: `${errorMsg}. Your order was created. You can try paying later or use COD.` } 
            });
        }
    };

    const subtotal = orderData.subtotal || 0;
    const shipping = orderData.shipping || 0;
    const productSavings = orderData.productSavings || 0;
    const couponDiscount = orderData.couponDiscount || 0;
    const totalSavings = productSavings + couponDiscount;
    const totalAfterCoupon = Math.max(0, subtotal - couponDiscount);
    const total = totalAfterCoupon + shipping;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/checkout', { 
                        state: { 
                            appliedCoupon: orderData.appliedCoupon,
                            couponDiscount: orderData.couponDiscount 
                        } 
                    })}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#5c2d16] mb-6 transition group"
                    disabled={processingPayment}
                >
                    <BsChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Checkout</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#5c2d16] mb-2">Confirm Your Order</h1>
                    <p className="text-gray-600">Review your order details before placing the order</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* LEFT SIDE - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-[#5c2d16]">Order Items ({cart.items?.length || 0})</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {cart.items?.map((item, idx) => {
                                    const product = item.product;
                                    if (!product) return null;
                                    
                                    return (
                                        <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                                            <img
                                                src={product.images?.[0] || '/placeholder.svg'}
                                                alt={product.name}
                                                className="w-20 h-20 rounded object-cover border"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3C/svg%3E';
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-[#5c2d16] mb-2">{product.name}</h3>
                                                
                                                {/* Pack Info */}
                                                {item.isPack && item.packInfo && (
                                                    <p className="text-xs text-gray-600 font-medium mb-1">
                                                        📦 {item.packInfo.label || `Pack of ${item.packInfo.packSize}`}
                                                        {item.packInfo.savingsPercent > 0 && ` - Save ${item.packInfo.savingsPercent}%`}
                                                    </p>
                                                )}

                                                {/* Free Products */}
                                                {product.freeProducts && product.freeProducts.length > 0 && (
                                                    <div className="space-y-1 mb-2">
                                                        {product.freeProducts
                                                            .filter(fp => item.quantity >= fp.minQuantity)
                                                            .map((fp, fpIdx) => (
                                                                <p key={fpIdx} className="text-xs text-green-600 font-medium">
                                                                    🎁 FREE: {fp.product?.name || 'Free Product'} × {fp.quantity}
                                                                </p>
                                                            ))
                                                        }
                                                    </div>
                                                )}

                                                {/* Bundle Info */}
                                                {product.bundleWith && product.bundleWith.length > 0 && product.bundleWith[0]?.product && (
                                                    <p className="text-xs text-orange-600 font-medium mb-1">
                                                        🔗 Bundle with {product.bundleWith[0].product?.name}
                                                    </p>
                                                )}

                                                {/* Offer Text */}
                                                {product.offerText && (
                                                    <p className="text-xs text-pink-600 font-medium mb-1">
                                                        ⭐ {product.offerText}
                                                    </p>
                                                )}
                                                
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-sm text-gray-600">
                                                        Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                                    </p>
                                                    <p className="font-bold text-[#5c2d16]">
                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-[#5c2d16]">Delivery Address</h2>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                                    <p className="font-semibold text-[#5c2d16] mb-2">{orderData.shippingAddress.fullName}</p>
                                    <p className="text-gray-700">{orderData.shippingAddress.addressLine}</p>
                                    {orderData.shippingAddress.landmark && (
                                        <p className="text-gray-700 text-sm mt-1">Landmark: {orderData.shippingAddress.landmark}</p>
                                    )}
                                    <p className="text-gray-700 mt-1">
                                        {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.pincode}
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Phone:</span> {orderData.shippingAddress.phone}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">Email:</span> {orderData.shippingAddress.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applied Coupon */}
                        {orderData.appliedCoupon && couponDiscount > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-[#5c2d16]">Applied Coupon</h2>
                                </div>
                                <div className="p-6">
                                    <div className="border-2 border-green-600 rounded-lg p-4 bg-green-50">
                                        <div className="flex items-center gap-3">
                                            <BsTag className="text-green-600 text-xl flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-lg font-bold text-[#5c2d16] font-mono">
                                                    {orderData.appliedCoupon.code || orderData.appliedCoupon.coupon?.code}
                                                </p>
                                                <p className="text-sm text-green-700 font-medium mt-1">
                                                    You saved ₹{couponDiscount.toFixed(2)}!
                                                </p>
                                            </div>
                                            <BsCheckCircle className="text-green-600 text-2xl flex-shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE - Summary & Payment */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-lg border border-gray-200 sticky top-4">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-[#5c2d16]">Order Summary</h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal ({cart.items?.length || 0} items)</span>
                                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                                </div>
                                
                                {productSavings > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Product Discount</span>
                                        <span className="font-semibold">-₹{productSavings.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Coupon Discount</span>
                                        <span className="font-semibold">-₹{couponDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping</span>
                                    <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                                        {shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}
                                    </span>
                                </div>
                                
                                {shipping === 0 && (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <BsCheckCircle /> Free shipping on selected items
                                    </p>
                                )}
                                
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <div className="flex justify-between text-[#5c2d16]">
                                        <span className="text-lg font-bold">Total</span>
                                        <span className="text-2xl font-bold">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                {totalSavings > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                        <p className="text-sm text-green-700 font-medium">
                                            Total Savings: ₹{totalSavings.toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-[#5c2d16]">Payment Method</h2>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-50 border-2 border-[#5c2d16] rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-[#5c2d16] rounded-full flex items-center justify-center flex-shrink-0">
                                            {orderData.paymentMethod === 'cod' ? (
                                                <BsCash className="text-xl text-white" />
                                            ) : (
                                                <BsCreditCard className="text-xl text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#5c2d16]">
                                                {orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {orderData.paymentMethod === 'cod' 
                                                    ? 'Pay when you receive your order' 
                                                    : 'Secure payment via Cards, UPI, Net Banking'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Confirm Button */}
                        <button
                            onClick={placeOrder}
                            disabled={processingPayment}
                            className="w-full bg-[#5c2d16] text-white py-4 rounded-lg hover:bg-gray-800 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
                        >
                            {processingPayment ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span> Processing Order...
                                </span>
                            ) : (
                                `Confirm & Place Order - ₹${total.toFixed(2)}`
                            )}
                        </button>
                        
                        <p className="text-xs text-gray-500 text-center">
                            By placing this order, you agree to our Terms & Conditions
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;

