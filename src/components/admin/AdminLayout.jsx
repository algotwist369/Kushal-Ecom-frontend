import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // If user is admin and trying to access non-admin pages, redirect to admin dashboard
        if (user && user.role === 'admin' && !location.pathname.startsWith('/admin') && 
            location.pathname !== '/login' && location.pathname !== '/signup') {
            navigate('/admin', { replace: true });
        }
    }, [user, location.pathname, navigate]);

    return <>{children}</>;
};

export default AdminLayout;

