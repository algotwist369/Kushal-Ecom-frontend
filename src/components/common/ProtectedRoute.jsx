import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user?.role !== 'admin') {
        // Not admin, redirect to home
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;

