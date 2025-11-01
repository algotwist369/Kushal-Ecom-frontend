import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axiosConfig";
import toast from "react-hot-toast";
import { BsCheckCircle, BsTag, BsXCircle, BsChevronLeft } from "react-icons/bs";
import PopUpModal from "../common/PopUpModal";

const CartCheckout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, fetchCart } = useCart();
    const { user } = useAuth();
    
    const [formData, setFormData] = useState({
        fullName: user?.name || "",
        phone: user?.phone || "",
        email: user?.email || "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
        landmark: ""
    });
    
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [loadingCoupon, setLoadingCoupon] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cod");

    useEffect(() => {
        fetchCart();
        
        // Check if coupon was applied in Cart page
        if (location.state?.appliedCoupon && location.state?.couponDiscount) {
            setAppliedCoupon(location.state.appliedCoupon);
            setCouponDiscount(location.state.couponDiscount);
            setCouponCode(location.state.appliedCoupon.code);
        }
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || prev.fullName,
                phone: user.phone || prev.phone,
                email: user.email || prev.email
            }));
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateSubtotal = () => {
        return cart?.items?.reduce((total, item) => {
            // Use cart item price (already calculated for packs/bundles)
            const price = item.price;
            return total + (price * item.quantity);
        }, 0) || 0;
    };

    const getTotalSavings = () => {
        return cart?.items?.reduce((total, item) => {
            // If it's a pack, calculate savings from pack discount
            if (item.isPack && item.packInfo) {
                const regularPrice = (item.product?.discountPrice || item.product?.price) * item.quantity;
                const packPrice = item.price * item.quantity;
                return total + (regularPrice - packPrice);
            }
            // Regular product savings
            if (item.product?.discountPrice && item.product?.price > item.product?.discountPrice) {
                return total + ((item.product.price - item.product.discountPrice) * item.quantity);
            }
            return total;
        }, 0) || 0;
    };

    const getShippingCost = () => {
        if (!cart?.items || cart.items.length === 0) return 0;
        
        // Check if any product has free shipping
        const hasFreeShipping = cart.items.some(item => item.product?.freeShipping === true);
        if (hasFreeShipping) return 0;
        
        // Check for minimum order for free shipping
        const subtotal = calculateSubtotal();
        const minForFreeShipping = Math.max(...cart.items.map(item => item.product?.minOrderForFreeShipping || 0));
        if (minForFreeShipping > 0 && subtotal >= minForFreeShipping) return 0;
        
        // Check for custom shipping costs
        const customShippingCost = cart.items.reduce((total, item) => {
            return total + (item.product?.shippingCost || 0);
        }, 0);
        
        return customShippingCost > 0 ? customShippingCost : 49; // Default shipping
    };

    const subtotal = calculateSubtotal();
    const productSavings = getTotalSavings();
    const shipping = getShippingCost();
    const totalAfterCoupon = Math.max(0, subtotal - couponDiscount);
    const total = totalAfterCoupon + shipping;
    const totalSavings = productSavings + couponDiscount;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error("Please enter a coupon code");
            return;
        }

        setLoadingCoupon(true);
        try {
            const productIds = cart.items.map(item => item.product._id);
            const categoryIds = [...new Set(cart.items.map(item => item.product.category?._id || item.product.category).filter(Boolean))];

            const response = await api.post('/coupons/validate', {
                couponCode: couponCode.toUpperCase(),
                orderAmount: subtotal,
                productIds,
                categoryIds
            });

            if (response.data.valid) {
                setAppliedCoupon(response.data.coupon);
                setCouponDiscount(response.data.discount);
                toast.success(`Coupon applied! You saved ₹${response.data.discount}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid coupon code");
            setAppliedCoupon(null);
            setCouponDiscount(0);
        } finally {
            setLoadingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponDiscount(0);
        toast.success("Coupon removed");
    };

    const handleProceedToPayment = (e) => {
        e.preventDefault();
        
        console.log('🚀 Proceed to payment clicked');
        console.log('Form data:', formData);
        console.log('Payment method:', paymentMethod);

        // Validation
        if (!formData.fullName.trim()) {
            toast.error("Full name is required");
            return;
        }
        if (!formData.phone.trim() || formData.phone.length < 10) {
            toast.error("Valid phone number is required");
            return;
        }
        if (!formData.email.trim()) {
            toast.error("Email is required");
            return;
        }
        if (!formData.addressLine.trim()) {
            toast.error("Street address is required");
            return;
        }
        if (!formData.city.trim()) {
            toast.error("City is required");
            return;
        }
        if (!formData.state.trim()) {
            toast.error("State is required");
            return;
        }
        if (!formData.pincode.trim() || formData.pincode.length !== 6) {
            toast.error("Valid pincode is required");
            return;
        }

        // Check if cart is empty
        if (!cart?.items || cart.items.length === 0) {
            toast.error("Your cart is empty");
            navigate("/cart");
            return;
        }

        // Check if any item is out of stock
        const outOfStock = cart.items.some(item => item.product?.stock <= 0);
        if (outOfStock) {
            toast.error("Some items in your cart are out of stock");
            return;
        }

        console.log('✅ All validations passed, navigating to confirmation...');

        // Navigate to payment confirmation page
        navigate('/order-confirmation', {
            state: {
                orderData: {
                    shippingAddress: formData,
                    subtotal,
                    shipping,
                    productSavings,
                    appliedCoupon,
                    couponDiscount,
                    total,
                    totalSavings,
                    paymentMethod
                }
            }
        });
    };

    if (!cart?.items || cart.items.length === 0) {
        return (
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="bg-white p-12 rounded-lg shadow-sm">
                        <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6">Add some items to your cart to proceed with checkout</p>
                        <button
                            onClick={() => navigate("/products")}
                            className="bg-[#5c2d16] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PopUpModal />
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Back Button */}
                <button 
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#5c2d16] mb-6 transition group"
                >
                    <BsChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Cart</span>
                </button>

                <h1 className="text-3xl font-bold text-[#5c2d16] mb-8">Checkout</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT SIDE - Forms */}
                    <form onSubmit={handleProceedToPayment} id="checkout-form" className="lg:col-span-2 space-y-6">
                        {/* DELIVERY ADDRESS */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h2 className="text-xl font-bold text-[#5c2d16] mb-6">Delivery Address</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            maxLength="10"
                                            pattern="[0-9]{10}"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                                    <input
                                        type="text"
                                        name="addressLine"
                                        value={formData.addressLine}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                                    <input
                                        type="text"
                                        name="landmark"
                                        value={formData.landmark}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            required
                                            maxLength="6"
                                            pattern="[0-9]{6}"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PAYMENT METHOD */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h2 className="text-xl font-bold text-[#5c2d16] mb-6">Payment Method</h2>
                            <div className="space-y-3">
                                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                                    paymentMethod === "razorpay" ? "border-[#5c2d16] bg-gray-50" : "border-gray-200 hover:border-gray-300"
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="razorpay"
                                        checked={paymentMethod === "razorpay"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-[#5c2d16]" 
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-[#5c2d16]">Online Payment (Razorpay)</p>
                                        <p className="text-sm text-gray-600">Cards, UPI, Net Banking, Wallets</p>
                                    </div>
                                </label>
                                <label className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                                    paymentMethod === "cod" ? "border-[#5c2d16] bg-gray-50" : "border-gray-200 hover:border-gray-300"
                                }`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-[#5c2d16]" 
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-[#5c2d16]">Cash on Delivery</p>
                                        <p className="text-sm text-gray-600">Pay when you receive</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </form>

                    {/* RIGHT SIDE - ORDER SUMMARY */}
                    <div className="lg:sticky lg:top-4 h-fit">
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                            <h2 className="text-xl font-bold text-[#5c2d16] mb-6">Order Summary</h2>

                            {/* CART ITEMS */}
                            <div className="max-h-60 overflow-y-auto mb-4 space-y-3">
                                {cart.items.map((item) => {
                                    const product = item.product;
                                    if (!product) return null;
                                    
                                    // Use cart item price (correct for packs/bundles)
                                    const itemTotal = item.price * item.quantity;

                                    return (
                                        <div
                                            key={item._id || product._id}
                                            className="pb-3 border-b"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.images?.[0] || '/placeholder.svg'}
                                                    alt={product.name}
                                                    className="w-16 h-16 rounded-md object-cover border"
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23f3f4f6" width="60" height="60"/%3E%3C/svg%3E';
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-[#5c2d16] truncate">{product.name}</p>
                                                    
                                                    {/* Pack Info */}
                                                    {item.isPack && item.packInfo && (
                                                        <p className="text-xs text-gray-600 font-medium mt-0.5">
                                                            📦 {item.packInfo.label || `Pack of ${item.packInfo.packSize}`}
                                                            {item.packInfo.savingsPercent > 0 && ` (Save ${item.packInfo.savingsPercent}%)`}
                                                        </p>
                                                    )}

                                                    {/* Free Products */}
                                                    {product.freeProducts && product.freeProducts.length > 0 && (
                                                        <>
                                                            {product.freeProducts
                                                                .filter(fp => item.quantity >= fp.minQuantity)
                                                                .map((fp, fpIdx) => (
                                                                    <p key={fpIdx} className="text-xs text-green-600 font-medium mt-0.5">
                                                                        🎁 FREE: {fp.product?.name || 'Free Product'} × {fp.quantity}
                                                                    </p>
                                                                ))
                                                            }
                                                        </>
                                                    )}

                                                    {/* Bundle Info */}
                                                    {product.bundleWith && product.bundleWith.length > 0 && product.bundleWith[0]?.product && (
                                                        <p className="text-xs text-orange-600 font-medium mt-0.5">
                                                            🔗 Bundle with {product.bundleWith[0].product?.name}
                                                        </p>
                                                    )}

                                                    {/* Offer Text */}
                                                    {product.offerText && (
                                                        <p className="text-xs text-pink-600 font-medium mt-0.5">
                                                            ⭐ {product.offerText}
                                                        </p>
                                                    )}
                                                    
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                                </div>
                                                <p className="font-semibold text-sm text-[#5c2d16]">₹{itemTotal.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* COUPON SECTION */}
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <BsTag className="text-gray-700" />
                                    <h3 className="font-semibold text-[#5c2d16]">Have a coupon?</h3>
                                </div>
                                
                                {!appliedCoupon ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent uppercase"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={loadingCoupon || !couponCode.trim()}
                                            className="w-full bg-[#5c2d16] text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {loadingCoupon ? "Applying..." : "Apply Coupon"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-green-600 rounded-lg p-4 bg-green-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <BsCheckCircle className="text-green-600 text-lg flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[#5c2d16] font-mono truncate">{appliedCoupon.code}</p>
                                                    {appliedCoupon.description && (
                                                        <p className="text-xs text-gray-600 line-clamp-1">{appliedCoupon.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveCoupon}
                                                className="text-red-600 hover:text-red-700 text-sm font-medium flex-shrink-0 ml-2"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <p className="text-sm text-green-700 font-semibold">
                                            You saved ₹{couponDiscount.toFixed(2)}!
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ORDER TOTALS */}
                            <div className="space-y-4 text-sm mb-6">
                                <div className="flex justify-between text-gray-700">
                                    <span>Subtotal ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})</span>
                                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                                </div>
                                
                                {productSavings > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Product Discount</span>
                                        <span className="font-medium">-₹{productSavings.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Coupon Discount</span>
                                        <span className="font-medium">-₹{couponDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between text-gray-700">
                                    <span>Shipping</span>
                                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                                        {shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE'}
                                    </span>
                                </div>
                                
                                {shipping === 0 && subtotal > 0 && (
                                    <div className="text-xs text-green-600">
                                        ✓ Free shipping applied
                                    </div>
                                )}
                                
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <div className="flex justify-between text-[#5c2d16]">
                                        <span className="text-lg font-bold">Total</span>
                                        <span className="text-2xl font-bold">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                {totalSavings > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                        <p className="text-sm text-green-700 font-medium">
                                            You're saving ₹{totalSavings.toFixed(2)} on this order!
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit"
                                form="checkout-form"
                                disabled={cart.items.some(item => item.product?.stock <= 0)}
                                className="w-full bg-[#5c2d16] text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {cart.items.some(item => item.product?.stock <= 0) ? 'Some items out of stock' : 'Place Order'}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/cart")}
                                className="w-full mt-3 text-gray-600 hover:text-[#5c2d16] font-medium text-sm"
                            >
                                ← Back to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default CartCheckout;
