import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, logoutUser } from '../services/authService';
import { addToCart } from '../services/cartService';

export const AuthContext = createContext();

// Module-level flag to prevent double initialization across StrictMode remounts
let isInitialized = false;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Prevent double execution in StrictMode (which intentionally double-mounts in dev)
        if (isInitialized) {
            return;
        }
        isInitialized = true;

        // Check if user is logged in on mount
        if (isAuthenticated()) {
            const currentUser = getCurrentUser();
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (userData) => {
        setUser(userData);

        // Merge guest cart with user cart
        try {
            const guestCart = JSON.parse(localStorage.getItem('guestCart'));
            if (guestCart && guestCart.items && guestCart.items.length > 0) {
                // We need to merge items sequentially to ensure order and avoid race conditions
                // In a production app, we should have a bulk add endpoint
                // iterating here for simplicity as per existing API

                // Note: The CartContext will also re-fetch the cart when user changes
                // So we just need to push the data here.

                for (const item of guestCart.items) {
                    await addToCart(item.product._id, item.quantity, item.packInfo);
                }

                // Clear guest cart after successful merge
                localStorage.removeItem('guestCart');
            }
        } catch (error) {
            console.error('Error merging cart:', error);
            // Non-blocking error - login should still succeed
        }
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
        // Reset initialization flag so user can be loaded again on next mount
        isInitialized = false;
    };

    const updateUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    const value = {
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};


