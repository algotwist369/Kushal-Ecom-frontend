import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsTrash, BsPlus, BsDash, BsTag, BsChevronLeft, BsX } from 'react-icons/bs';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import PopUpModal from '../common/PopUpModal';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'default' }) => {
    if (!isOpen) return null;

    const bgColor = type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#5c2d16] hover:bg-gray-800';
    const borderColor = type === 'danger' ? 'border-red-200' : 'border-gray-200';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border-2 border-gray-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-[#5c2d16]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <BsX className="text-2xl" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 mb-6">{message}</p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-6 py-2 rounded-lg text-white transition font-medium ${bgColor}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Cart = () => {
    const navigate = useNavigate();
    const { cart, loading, updateQuantity, removeFromCart, fetchCart } = useCart();

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Confirmation modal state
    const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
    const [showRemoveCouponConfirm, setShowRemoveCouponConfirm] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchCart();
    }, []);

    const handleQuantityChange = async (productId, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity < 1) {
            toast.error('Quantity cannot be less than 1');
            return;
        }

        // Find the product to check stock
        const cartItem = cart.items.find(item => item.product._id === productId);
        if (change > 0 && cartItem && cartItem.product.stock < newQuantity) {
            toast.error(`Only ${cartItem.product.stock} items available in stock`);
            return;
        }

        try {
            await updateQuantity(productId, newQuantity);
            toast.success('Quantity updated');
        } catch (error) {
            // Error already handled in context
        }
    };

    const handleRemove = async (productId, isPack = false, packSize = undefined) => {
        try {
            await removeFromCart(productId, isPack, packSize);
            setItemToRemove(null);
        } catch (error) {
            // Error already handled in context
        }
    };

    const handleRemoveClick = (productId, productName, isPack = false, packSize = undefined) => {
        setItemToRemove({ id: productId, name: productName, isPack, packSize });
    };

    const confirmRemove = () => {
        if (itemToRemove) {
            handleRemove(itemToRemove.id, itemToRemove.isPack, itemToRemove.packSize);
        }
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();

        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        // Check if cart has items
        if (!cart?.items || cart.items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setApplyingCoupon(true);

        try {
            const subtotal = getSubtotal();

            // Ensure subtotal is valid
            if (!subtotal || subtotal <= 0) {
                toast.error('Invalid cart total');
                setApplyingCoupon(false);
                return;
            }

            // Extract product IDs - handle both populated and non-populated products
            const productIds = cart.items
                .map(item => {
                    const product = item.product;
                    if (!product) return null;
                    return product._id || product;
                })
                .filter(Boolean);

            // Extract category IDs - handle both populated and non-populated categories
            const categoryIds = [...new Set(
                cart.items
                    .map(item => {
                        const category = item.product?.category;
                        if (!category) return null;
                        return category._id || category;
                    })
                    .filter(Boolean)
            )];

            const response = await api.post('/coupons/validate', {
                couponCode: couponCode.trim().toUpperCase(),
                orderAmount: subtotal,
                productIds: productIds.length > 0 ? productIds : [],
                categoryIds: categoryIds.length > 0 ? categoryIds : []
            });

            if (response.data.valid) {
                setAppliedCoupon(response.data.coupon);
                setCouponDiscount(response.data.discount);
                toast.success(`Coupon applied! You saved ₹${response.data.discount}`);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Invalid coupon code';
            toast.error(errorMessage);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponCode('');
        setShowRemoveCouponConfirm(false);
        toast.success('Coupon removed');
    };

    const { user } = useAuth(); // Add this hook at the top

    const handleProceedToCheckout = () => {
        if (!user) {
            toast('Please login to continue checkout', {
                icon: '🔒',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
            });
            navigate('/signup', { state: { from: '/cart' } });
            return;
        }
        setShowCheckoutConfirm(true);
    };


    const confirmCheckout = () => {
        setShowCheckoutConfirm(false);
        navigate('/checkout', {
            state: {
                appliedCoupon: appliedCoupon,
                couponDiscount: couponDiscount
            }
        });
    };

    const getSubtotal = () => {
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

    const getTotalItems = () => {
        return cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    };

    const getShippingCost = () => {
        if (!cart?.items || cart.items.length === 0) return 0;

        // Check if any product has free shipping
        const hasFreeShipping = cart.items.some(item => item.product?.freeShipping === true);
        if (hasFreeShipping) return 0;

        // Check for minimum order for free shipping
        const subtotal = getSubtotal();
        const minForFreeShipping = Math.max(...cart.items.map(item => item.product?.minOrderForFreeShipping || 0));
        if (minForFreeShipping > 0 && subtotal >= minForFreeShipping) return 0;

        // Check for custom shipping costs
        const customShippingCost = cart.items.reduce((total, item) => {
            return total + (item.product?.shippingCost || 0);
        }, 0);

        return customShippingCost > 0 ? customShippingCost : 49; // Default shipping
    };

    const subtotal = getSubtotal();
    const shippingCost = getShippingCost();
    const totalAfterCoupon = Math.max(0, subtotal - couponDiscount);
    const total = totalAfterCoupon + shippingCost;
    const totalSavings = getTotalSavings() + couponDiscount;
    const totalItems = getTotalItems();

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-[#5c2d16] mb-8">Shopping Cart</h1>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-4 animate-pulse">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div>
                            <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
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
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#5c2d16] mb-6 transition group"
                    >
                        <BsChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </button>

                    <h1 className="text-3xl font-bold text-[#5c2d16] mb-8">Shopping Cart</h1>

                    {!cart?.items || cart.items.length === 0 ? (
                        <div className="bg-white rounded-lg p-12 text-center">
                            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <p className="text-xl text-[#5c2d16] font-medium mb-2">Your cart is empty</p>
                            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet</p>
                            <Link
                                to="/products"
                                className="inline-block bg-[#5c2d16] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="md:col-span-2 space-y-4">
                                {cart.items.map((item) => {
                                    const product = item.product;
                                    if (!product) return null;

                                    const displayPrice = product.discountPrice || product.price;
                                    const itemTotal = displayPrice * item.quantity;

                                    return (
                                        <div
                                            key={item._id || product._id}
                                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                                        >
                                            <div className="flex items-center space-x-4 flex-1">
                                                <img
                                                    src={product.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'}
                                                    alt={product.name}
                                                    className="w-20 h-20 rounded-lg object-cover cursor-pointer border border-gray-200"
                                                    onClick={() => navigate(`/products/${product.slug || product._id}`)}
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <h2
                                                        className="text-lg font-semibold text-gray-800 hover:text-green-600 cursor-pointer mb-1"
                                                        onClick={() => navigate(`/products/${product.slug || product._id}`)}
                                                    >
                                                        {product.name}
                                                    </h2>

                                                    {/* Pack Options Info */}
                                                    {item.isPack && item.packInfo && (
                                                        <div className="mb-2">
                                                            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-2 py-1 rounded text-xs">
                                                                <span className="text-gray-700 font-medium">
                                                                    📦 {item.packInfo.label || `Pack of ${item.packInfo.packSize}`}
                                                                </span>
                                                                {item.packInfo.savingsPercent > 0 && (
                                                                    <span className="text-gray-600 font-semibold">
                                                                        Save {item.packInfo.savingsPercent}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Free Products Info */}
                                                    {product.freeProducts && product.freeProducts.length > 0 && (
                                                        <div className="mb-2 space-y-1">
                                                            {product.freeProducts
                                                                .filter(fp => item.quantity >= fp.minQuantity)
                                                                .map((fp, fpIdx) => (
                                                                    <div key={fpIdx} className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-2 py-1 rounded text-xs">
                                                                        <span className="text-green-700 font-medium">
                                                                            🎁 FREE: {fp.product?.name || 'Free Product'} × {fp.quantity}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    )}

                                                    {/* Bundle Info */}
                                                    {product.bundleWith && product.bundleWith.length > 0 && product.bundleWith[0]?.product && (
                                                        <div className="mb-2">
                                                            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 px-2 py-1 rounded text-xs">
                                                                <span className="text-orange-700 font-medium">
                                                                    🔗 Bundle with {product.bundleWith[0].product?.name}
                                                                    {product.bundleWith[0].savingsAmount > 0 && ` - Save ₹${product.bundleWith[0].savingsAmount}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Offer Text */}
                                                    {product.offerText && (
                                                        <div className="mb-2">
                                                            <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 px-2 py-1 rounded text-xs">
                                                                <span className="text-pink-700 font-medium">
                                                                    ⭐ {product.offerText}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 mb-2">
                                                        {item.isPack ? (
                                                            <>
                                                                <p className="text-green-600 font-semibold">₹{item.packInfo.packPrice} for pack</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="text-green-600 font-semibold">₹{displayPrice} each</p>
                                                                {product.discountPrice && product.discountPrice < product.price && (
                                                                    <p className="text-gray-400 line-through text-sm">₹{product.price}</p>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {item.isPack ? (
                                                            <>Pack of {item.packInfo.packSize}: <span className="font-semibold">₹{itemTotal}</span></>
                                                        ) : (
                                                            <>Subtotal ({item.quantity} × ₹{displayPrice}): <span className="font-semibold">₹{itemTotal}</span></>
                                                        )}
                                                    </p>

                                                    {/* Show savings for discounted items or packs */}
                                                    {item.isPack && item.packInfo.savingsPercent > 0 ? (
                                                        <p className="text-sm text-green-600 mt-1">
                                                            You save {item.packInfo.savingsPercent}% on this pack!
                                                        </p>
                                                    ) : product.discountPrice && product.discountPrice < product.price && (
                                                        <p className="text-sm text-green-600 mt-1">
                                                            You save ₹{(product.price - product.discountPrice) * item.quantity}
                                                        </p>
                                                    )}

                                                    {product.stock <= 0 && (
                                                        <p className="text-red-600 text-sm mt-1 font-medium">Out of Stock</p>
                                                    )}
                                                    {product.stock > 0 && product.stock <= 5 && (
                                                        <p className="text-orange-600 text-sm mt-1 font-medium">Only {product.stock} left in stock</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {/* Quantity Controls - Disabled for packs */}
                                                {item.isPack ? (
                                                    <div className="text-sm text-gray-500 italic px-3 py-2 bg-gray-50 rounded">
                                                        Pack quantity: {item.quantity}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center border rounded-lg">
                                                        <button
                                                            onClick={() => handleQuantityChange(product._id, item.quantity, -1)}
                                                            disabled={item.quantity <= 1}
                                                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                        >
                                                            <BsDash />
                                                        </button>
                                                        <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(product._id, item.quantity, 1)}
                                                            disabled={product.stock <= item.quantity}
                                                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                        >
                                                            <BsPlus />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => handleRemoveClick(product._id, product.name, item.isPack, item.packInfo?.packSize)}
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                                                    title="Remove from cart"
                                                >
                                                    <BsTrash className="text-xl" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Order Summary */}
                            <div className="space-y-6">
                                {/* Coupon Section */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BsTag className="text-gray-700 text-lg" />
                                        <h3 className="text-lg font-semibold text-[#5c2d16]">Have a coupon?</h3>
                                    </div>

                                    {!appliedCoupon ? (
                                        <form onSubmit={handleApplyCoupon} className="space-y-3">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter coupon code"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent uppercase"
                                            />
                                            <button
                                                type="submit"
                                                disabled={applyingCoupon || !couponCode.trim()}
                                                className="w-full bg-[#5c2d16] text-white py-3 rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {applyingCoupon ? 'Applying...' : 'Apply Coupon'}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="border-2 border-green-600 rounded-lg p-4 bg-green-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="font-bold text-[#5c2d16] text-lg font-mono">{appliedCoupon.code}</p>
                                                    <p className="text-sm text-gray-600">{appliedCoupon.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => setShowRemoveCouponConfirm(true)}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <p className="text-green-700 font-semibold text-sm">
                                                You saved ₹{couponDiscount}!
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Order Summary */}
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h3 className="text-xl font-bold text-[#5c2d16] mb-6">Order Summary</h3>

                                    <div className="space-y-4">
                                        <div className="flex justify-between text-gray-700">
                                            <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                                            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                                        </div>

                                        {getTotalSavings() > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Product Discount</span>
                                                <span className="font-medium">-₹{getTotalSavings().toFixed(2)}</span>
                                            </div>
                                        )}

                                        {couponDiscount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Coupon Discount ({appliedCoupon?.code})</span>
                                                <span className="font-medium">-₹{couponDiscount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-gray-700">
                                            <span>Shipping</span>
                                            <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                                                {shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE'}
                                            </span>
                                        </div>

                                        {shippingCost === 0 && subtotal > 0 && (
                                            <div className="text-xs text-green-600">
                                                {cart.items.some(item => item.product?.freeShipping)
                                                    ? '✓ Free shipping on selected items'
                                                    : '✓ Eligible for free shipping'}
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
                                        onClick={handleProceedToCheckout}
                                        disabled={cart.items.some(item => item.product?.stock <= 0)}
                                        className="w-full mt-6 bg-[#5c2d16] text-white py-3 rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {cart.items.some(item => item.product?.stock <= 0) ? 'Some items out of stock' : 'Proceed to Checkout'}
                                    </button>

                                    <Link
                                        to="/products"
                                        className="block text-center mt-4 text-gray-600 hover:text-[#5c2d16] font-medium"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showCheckoutConfirm}
                onClose={() => setShowCheckoutConfirm(false)}
                onConfirm={confirmCheckout}
                title="Proceed to Checkout?"
                message={`Are you sure you want to proceed to checkout with ${totalItems} ${totalItems === 1 ? 'item' : 'items'}? Your total is ₹${total.toFixed(2)}.`}
                confirmText="Yes, Proceed"
                cancelText="Cancel"
            />

            <ConfirmationModal
                isOpen={showRemoveCouponConfirm}
                onClose={() => setShowRemoveCouponConfirm(false)}
                onConfirm={handleRemoveCoupon}
                title="Remove Coupon?"
                message={`Are you sure you want to remove coupon "${appliedCoupon?.code}"? You will lose the discount of ₹${couponDiscount.toFixed(2)}.`}
                confirmText="Yes, Remove"
                cancelText="Keep Coupon"
                type="danger"
            />

            <ConfirmationModal
                isOpen={itemToRemove !== null}
                onClose={() => setItemToRemove(null)}
                onConfirm={confirmRemove}
                title="Remove Item from Cart?"
                message={`Are you sure you want to remove "${itemToRemove?.name}" from your cart?`}
                confirmText="Yes, Remove"
                cancelText="Cancel"
                type="danger"
            />
        </>
    );
};

export default Cart;
