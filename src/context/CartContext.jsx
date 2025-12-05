import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart as addToCartAPI, updateCartQuantity, removeFromCart as removeFromCartAPI } from '../services/cartService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState({ items: [], totalPrice: 0 });
    const [loading, setLoading] = useState(false);

    // Initial load - check local storage or fetch from API
    useEffect(() => {
        fetchCart();
    }, [user]);

    const calculateLocalCartTotal = (items) => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const fetchCart = async () => {
        setLoading(true);
        try {
            if (!user) {
                // Guest user: Load from local storage
                const localCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [], totalPrice: 0 };
                setCart(localCart);
            } else {
                // Logged in user: Fetch from API
                const data = await getCart();
                setCart({
                    items: data?.items || [],
                    totalPrice: data?.totalPrice || 0
                });
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.response?.status === 401) {
                setCart({ items: [], totalPrice: 0 });
            } else {
                toast.error('Failed to load cart');
            }
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1, packInfo = null) => {
        try {
            if (!user) {
                // Guest Logic
                const currentCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [], totalPrice: 0 };

                // Note: We need product details for the UI. 
                // In a real app, we might need to fetch this if not passed fully, 
                // but usually the calling component has the data.
                // WE WILL RELY on the component passing strict minimal data or fetching it.
                // However, the current signature only takes `productId`. 
                // FIX: We need extended info. 
                // Since modifying the signature everywhere is risky, we'll try to fetch it OR
                // assume the caller will handle the 'Guest' limitation if data is missing.
                // BETTER APPROACH: For now, we'll assume we can't show full details without fetching. 
                // BUT, let's try to fetch the single product details if we don't have them? 
                // Actually, simplest is to let the user know they need to login OR 
                // implement a 'getLocalProduct' helper. 
                // Let's implement a hybrid: If guest, we might need to fetch product info to store it locally.

                // Wait, simply storing ID is not enough for the UI to render.
                // We will fetch the product details from API public endpoint.

                // ...Actually, looking at the plan, we are mimicking the backend Logic locally.
                // Let's doing a quick fetch of the product to get price/image/name.

                // NOTE: We need a service to get product details by ID. 
                // Assuming `api.get('/products/' + productId)` works effectively.
                // Let's import api here if not available, or use a helper.
                // Since this file imports `addToCartAPI` from services, let's use `api` from config.

                // IMPLICIT DEPENDENCY: We need to import `api` or `getProductById`. 
                // Let's assume we can import `api`.

                // REVISION: To avoid complex imports/circular deps, let's try to update the `cart.jsx` logic 
                // or just fetch it here.

                // Let's just use the API to get product info for the local cart.
                const { data: product } = await import('../api/axiosConfig').then(m => m.default.get(`/products/${productId}`));

                let itemPrice = product.discountPrice || product.price;
                let isPack = false;
                let packData = null;

                if (packInfo && packInfo.packSize) {
                    const baseProductPrice = product.discountPrice || product.price;
                    const basePackPrice = baseProductPrice * packInfo.packSize;
                    const finalPackPrice = packInfo.savingsPercent > 0
                        ? basePackPrice * (1 - packInfo.savingsPercent / 100)
                        : packInfo.packPrice || basePackPrice;

                    itemPrice = finalPackPrice / packInfo.packSize;
                    isPack = true;
                    packData = {
                        ...packInfo,
                        packPrice: Math.round(finalPackPrice)
                    };
                }

                const existingItemIndex = currentCart.items.findIndex(item =>
                    item.product._id === productId &&
                    item.isPack === isPack &&
                    (!isPack || item.packInfo?.packSize === packInfo?.packSize)
                );

                if (existingItemIndex > -1) {
                    currentCart.items[existingItemIndex].quantity = quantity;
                    currentCart.items[existingItemIndex].price = itemPrice;
                } else {
                    currentCart.items.push({
                        product: product, // Store full product object for UI
                        quantity,
                        price: itemPrice,
                        isPack,
                        packInfo: packData,
                        _id: Date.now().toString() // Temp ID
                    });
                }

                currentCart.totalPrice = calculateLocalCartTotal(currentCart.items);
                localStorage.setItem('guestCart', JSON.stringify(currentCart));
                setCart(currentCart);

                if (packInfo) {
                    toast.success(`Added ${packInfo.label || `Pack of ${packInfo.packSize}`} to cart!`);
                } else {
                    toast.success('Added to cart!');
                }
                return currentCart;

            } else {
                // Auth Logic
                const data = await addToCartAPI(productId, quantity, packInfo);
                setCart(data);
                if (packInfo) {
                    toast.success(`Added ${packInfo.label || `Pack of ${packInfo.packSize}`} to cart!`);
                } else {
                    // toast.success('Added to cart successfully!');
                }
                return data;
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add to cart';
            toast.error(message);
            throw error;
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            if (!user) {
                // Guest Logic
                const currentCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [], totalPrice: 0 };
                const itemIndex = currentCart.items.findIndex(item => item.product._id === productId);

                if (itemIndex > -1) {
                    currentCart.items[itemIndex].quantity = quantity;
                    currentCart.totalPrice = calculateLocalCartTotal(currentCart.items);
                    localStorage.setItem('guestCart', JSON.stringify(currentCart));
                    setCart(currentCart);
                    return currentCart;
                }
            } else {
                // Auth Logic
                const data = await updateCartQuantity(productId, quantity);
                setCart(data);
                return data;
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update quantity';
            toast.error(message);
            throw error;
        }
    };

    const removeFromCart = async (productId) => {
        try {
            if (!user) {
                // Guest Logic
                const currentCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [], totalPrice: 0 };
                currentCart.items = currentCart.items.filter(item => item.product._id !== productId);
                currentCart.totalPrice = calculateLocalCartTotal(currentCart.items);
                localStorage.setItem('guestCart', JSON.stringify(currentCart));
                setCart(currentCart);
                toast.success('Item removed from cart');
                return currentCart;
            } else {
                // Auth Logic
                const data = await removeFromCartAPI(productId);
                setCart(data);
                toast.success('Item removed from cart');
                return data;
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to remove item';
            toast.error(message);
            throw error;
        }
    };

    const clearCart = () => {
        setCart({ items: [], totalPrice: 0 });
        if (!user) {
            localStorage.removeItem('guestCart');
        }
    };

    const getCartCount = () => {
        return cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    };

    const value = {
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
        clearCart,
        getCartCount
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;

