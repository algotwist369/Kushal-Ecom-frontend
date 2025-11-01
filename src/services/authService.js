import api from '../api/axiosConfig';

// Register new user
export const registerUser = async (userData) => {
    try {
        const payload = {
            name: userData.fullname || userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone
        };

        // Include address if provided
        if (userData.address && userData.address.length > 0) {
            payload.address = userData.address;
        }

        const response = await api.post('/users/register', payload);
        
        // Save token and user info
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Registration failed. Please try again.'
        };
    }
};

// Login user
export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/users/login', {
            email: credentials.email,
            password: credentials.password
        });

        // Save token and user info
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Login failed. Please check your credentials.'
        };
    }
};

// Logout user
export const logoutUser = async () => {
    try {
        // Call logout API to blacklist token
        const token = localStorage.getItem('token');
        if (token) {
            await api.post('/users/logout');
            console.log('✅ Token blacklisted on server');
        }
    } catch (error) {
        console.error('Error during logout API call:', error);
    } finally {
        // Clear local storage regardless of API call result
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
};

// Get user profile
export const getUserProfile = async () => {
    try {
        const response = await api.get('/users/profile');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch profile'
        };
    }
};

// Update user profile (supports name, phone, address, password)
export const updateUserProfile = async (userData) => {
    try {
        const payload = {};
        
        if (userData.name) payload.name = userData.name;
        if (userData.phone) payload.phone = userData.phone;
        if (userData.address) payload.address = userData.address;
        if (userData.password) payload.password = userData.password;

        const response = await api.put('/users/profile', payload);
        
        // Update stored user info and token (backend returns new token)
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update profile'
        };
    }
};

// Change password (requires current password verification)
export const changePassword = async (currentPassword, newPassword) => {
    try {
        const response = await api.put('/users/change-password', {
            currentPassword,
            newPassword
        });
        
        // Update token (backend returns new token after password change)
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        
        return {
            success: true,
            message: response.data.message || 'Password changed successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to change password'
        };
    }
};

// Get all users (Admin only)
export const getAllUsers = async () => {
    try {
        const response = await api.get('/users');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch users'
        };
    }
};

// Get user by ID (Admin only)
export const getUserById = async (userId) => {
    try {
        const response = await api.get(`/users/${userId}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch user'
        };
    }
};

// Delete user (Admin only)
export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        return {
            success: true,
            message: response.data.message || 'User deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete user'
        };
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

// Get current user from localStorage
export const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        return null;
    }
};

