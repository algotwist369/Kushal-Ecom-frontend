import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, logoutUser } from '../services/authService';

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

    const login = (userData) => {
        setUser(userData);
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

