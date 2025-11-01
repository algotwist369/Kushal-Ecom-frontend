import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BsX } from 'react-icons/bs';
import api from '../../api/axiosConfig';

const PopUpModal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [popup, setPopup] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [canClose, setCanClose] = useState(true);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Check if we should show popup based on current page
        const currentPath = location.pathname;
        const isHomePage = currentPath === '/';
        const isProductsListPage = currentPath === '/products';
        const isProductDetailsPage = currentPath.startsWith('/products/') && currentPath !== '/products';
        const isCartPage = currentPath === '/cart';
        const isCheckoutPage = currentPath === '/checkout' || currentPath === '/order-confirmation';
        const isAboutPage = currentPath === '/about';
        const isContactPage = currentPath === '/contact';

        fetchActivePopup(isHomePage, isProductsListPage, isProductDetailsPage, isCartPage, isCheckoutPage, isAboutPage, isContactPage);
    }, [location.pathname]);

    const shouldShowPopup = (popup, isHomePage, isProductsListPage, isProductDetailsPage, isCartPage, isCheckoutPage, isAboutPage, isContactPage) => {
        const { displayFrequency, showOnPages } = popup;

        // Check page filter
        const showOnAll = showOnPages?.includes('all');
        const showOnHome = showOnPages?.includes('home') && isHomePage;
        const showOnProductsList = showOnPages?.includes('products') && isProductsListPage;
        const showOnProductDetails = showOnPages?.includes('product_details') && isProductDetailsPage;
        const showOnCart = showOnPages?.includes('cart') && isCartPage;
        const showOnCheckout = showOnPages?.includes('checkout') && isCheckoutPage;
        const showOnAbout = showOnPages?.includes('about') && isAboutPage;
        const showOnContact = showOnPages?.includes('contact') && isContactPage;

        if (!showOnAll && !showOnHome && !showOnProductsList && !showOnProductDetails && !showOnCart && !showOnCheckout && !showOnAbout && !showOnContact) {
            return false;
        }

        // Check display frequency
        const now = Date.now();
        const storageKey = `popup_${popup._id}_shown`;

        switch (displayFrequency) {
            case 'once_per_session':
                const sessionShown = sessionStorage.getItem(storageKey);
                return !sessionShown;
            
            case 'once_per_day':
                const dayShown = localStorage.getItem(storageKey);
                if (dayShown && now - parseInt(dayShown) < 24 * 60 * 60 * 1000) {
                    return false;
                }
                return true;
            
            case 'once_per_week':
                const weekShown = localStorage.getItem(storageKey);
                if (weekShown && now - parseInt(weekShown) < 7 * 24 * 60 * 60 * 1000) {
                    return false;
                }
                return true;
            
            case 'always':
                return true;
            
            default:
                return true;
        }
    };

    const markPopupAsShown = (popup) => {
        const storageKey = `popup_${popup._id}_shown`;
        const now = Date.now();

        switch (popup.displayFrequency) {
            case 'once_per_session':
                sessionStorage.setItem(storageKey, 'true');
                break;
            
            case 'once_per_day':
            case 'once_per_week':
                localStorage.setItem(storageKey, now.toString());
                break;
            
            case 'always':
                // Don't store anything
                break;
        }
    };

    const fetchActivePopup = async (isHomePage, isProductsListPage, isProductDetailsPage, isCartPage, isCheckoutPage, isAboutPage, isContactPage) => {
        try {
            const response = await api.get('/popups/active');
            if (response.data.success && response.data.data) {
                const fetchedPopup = response.data.data;
                
                // Check if we should show this popup
                if (shouldShowPopup(fetchedPopup, isHomePage, isProductsListPage, isProductDetailsPage, isCartPage, isCheckoutPage, isAboutPage, isContactPage)) {
                    setPopup(fetchedPopup);
                    
                    // Show popup after configured delay
                    const delay = (fetchedPopup.delaySeconds || 2) * 1000;
                    setTimeout(() => {
                        setIsOpen(true);
                        markPopupAsShown(fetchedPopup);

                        // Handle closeableAfter
                        if (fetchedPopup.closeableAfter > 0) {
                            setCanClose(false);
                            setCountdown(fetchedPopup.closeableAfter);
                            
                            const countdownInterval = setInterval(() => {
                                setCountdown(prev => {
                                    if (prev <= 1) {
                                        clearInterval(countdownInterval);
                                        setCanClose(true);
                                        return 0;
                                    }
                                    return prev - 1;
                                });
                            }, 1000);
                        }

                        // Handle autoCloseAfter
                        if (fetchedPopup.autoCloseAfter > 0) {
                            setTimeout(() => {
                                handleClose();
                            }, fetchedPopup.autoCloseAfter * 1000);
                        }
                    }, delay);
                }
            }
        } catch (error) {
            console.error('Error fetching popup:', error);
        }
    };

    const handleClose = () => {
        if (!canClose) return;
        setIsOpen(false);
    };

    const handlePopupClick = async () => {
        if (popup?.product?.slug || popup?.product?._id) {
            // Track click
            try {
                await api.post(`/popups/${popup._id}/click`);
            } catch (error) {
                console.error('Error tracking click:', error);
            }
            
            handleClose();
            navigate(`/products/${popup.product.slug || popup.product._id}`);
        }
    };

    if (!popup || !isOpen) {
        return null;
    }

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
                onClick={handleClose}
            >
                {/* Modal */}
                <div 
                    className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-slideUp"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        disabled={!canClose}
                        className={`absolute top-4 right-4 z-10 bg-white rounded-full p-2 transition shadow-md ${
                            canClose 
                                ? 'hover:bg-gray-100 cursor-pointer' 
                                : 'opacity-50 cursor-not-allowed'
                        }`}
                        aria-label="Close popup"
                        title={!canClose ? `Can close in ${countdown}s` : 'Close'}
                    >
                        {!canClose && countdown > 0 ? (
                            <span className="text-sm font-bold text-gray-900 px-1">{countdown}</span>
                        ) : (
                            <BsX className="text-2xl text-gray-900" />
                        )}
                    </button>

                    {/* Popup Content */}
                    <div 
                        className="cursor-pointer"
                        onClick={handlePopupClick}
                    >
                        {/* Image */}
                        <div className="relative h-64 sm:h-80 bg-gray-200">
                            <img
                                src={popup.image}
                                alt={popup.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                                {popup.title}
                            </h2>
                            <p className="text-gray-600 text-sm sm:text-base mb-6">
                                {popup.description}
                            </p>

                            {/* Product Info */}
                            {popup.product && (
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                                    {popup.product.images?.[0] && (
                                        <img
                                            src={popup.product.images[0]}
                                            alt={popup.product.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {popup.product.name}
                                        </h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-gray-900">
                                                ₹{popup.product.discountPrice || popup.product.price}
                                            </span>
                                            {popup.product.discountPrice && popup.product.discountPrice < popup.product.price && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₹{popup.product.price}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CTA Button */}
                            <button
                                onClick={handlePopupClick}
                                className="w-full text-white py-3 rounded-lg transition font-semibold text-lg"
                                style={{ 
                                    backgroundColor: popup.buttonColor || '#111827',
                                    filter: 'brightness(1)'
                                }}
                                onMouseEnter={(e) => e.target.style.filter = 'brightness(0.9)'}
                                onMouseLeave={(e) => e.target.style.filter = 'brightness(1)'}
                            >
                                {popup.buttonText || 'Shop Now'} →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
            `}} />
        </>
    );
};

export default PopUpModal;

