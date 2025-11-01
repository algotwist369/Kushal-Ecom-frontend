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

    // Fetch cart when user logs in
    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart({ items: [], totalPrice: 0 });
        }
    }, [user]);

    const fetchCart = async () => {
        if (!user) {
            setCart({ items: [], totalPrice: 0 });
            return;
        }
        
        try {
            setLoading(true);
            const data = await getCart();
            // Ensure data structure is correct
            setCart({
                items: data?.items || [],
                totalPrice: data?.totalPrice || 0
            });
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.response?.status === 401) {
                // User not authenticated, clear cart
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
            const data = await addToCartAPI(productId, quantity, packInfo);
            setCart(data);
            if (packInfo) {
                toast.success(`Added ${packInfo.label || `Pack of ${packInfo.packSize}`} to cart!`);
            } else {
                toast.success('Added to cart successfully!');
            }
            return data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add to cart';
            toast.error(message);
            throw error;
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            const data = await updateCartQuantity(productId, quantity);
            setCart(data);
            return data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update quantity';
            toast.error(message);
            throw error;
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const data = await removeFromCartAPI(productId);
            setCart(data);
            toast.success('Item removed from cart');
            return data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to remove item';
            toast.error(message);
            throw error;
        }
    };

    const clearCart = () => {
        setCart({ items: [], totalPrice: 0 });
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

