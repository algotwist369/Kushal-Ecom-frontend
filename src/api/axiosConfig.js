import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/v1/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - token invalid, blacklisted, or user deleted
            console.warn('🚫 Unauthorized:', error.response?.data?.message);
            
            // Only clear storage and redirect if it's authentication failure (not permission issue)
            const isAuthFailure = error.response?.data?.message?.toLowerCase().includes('token') ||
                                  error.response?.data?.message?.toLowerCase().includes('authentication') ||
                                  error.response?.data?.message?.toLowerCase().includes('logged');
            
            if (isAuthFailure) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Only redirect if not already on login/signup
                if (!window.location.pathname.includes('/login') && 
                    !window.location.pathname.includes('/signup')) {
                    window.location.href = '/login';
                }
            }
        } else if (error.response?.status === 403) {
            // Forbidden - could be admin access or account deactivated
            console.warn('🚫 Forbidden:', error.response?.data?.message);
            
            // Only logout if account is deactivated (not just permission denied)
            const isAccountDeactivated = error.response?.data?.message?.toLowerCase().includes('deactivated') ||
                                         error.response?.data?.message?.toLowerCase().includes('suspended');
            
            if (isAccountDeactivated) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                alert('Your account has been deactivated. Please contact support.');
                window.location.href = '/login';
            }
            // If it's just permission denied (admin access required), let component handle it
        }
        return Promise.reject(error);
    }
);

export default api;

