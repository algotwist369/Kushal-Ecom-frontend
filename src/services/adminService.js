import api from '../api/axiosConfig';

// ============= USERS MANAGEMENT =============
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

// Get user by ID
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

// Update user
export const updateUser = async (userId, userData) => {
    try {
        const response = await api.put(`/users/${userId}`, userData);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update user'
        };
    }
};

// ============= PRODUCTS MANAGEMENT =============
export const getAllProducts = async (params = {}) => {
    try {
        const response = await api.get('/products/admin/all', { params });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch products'
        };
    }
};

export const getProductById = async (productId) => {
    try {
        const response = await api.get(`/products/${productId}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch product'
        };
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await api.post('/products', productData);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create product'
        };
    }
};

export const updateProduct = async (productId, productData) => {
    try {
        const response = await api.put(`/products/${productId}`, productData);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update product'
        };
    }
};

export const deleteProduct = async (productId) => {
    try {
        const response = await api.delete(`/products/${productId}`);
        return {
            success: true,
            message: response.data.message || 'Product deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete product'
        };
    }
};

export const getProductsByFilter = async (filterData = {}) => {
    try {
        const response = await api.post('/products/filter', filterData);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to filter products'
        };
    }
};

// ============= ORDERS MANAGEMENT =============
export const getAllOrders = async () => {
    try {
        const response = await api.get('/orders');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch orders'
        };
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await api.put(`/orders/${orderId}/status`, { status });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update order status'
        };
    }
};

export const deleteOrder = async (orderId) => {
    try {
        const response = await api.delete(`/orders/${orderId}`);
        return {
            success: true,
            message: response.data.message || 'Order deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete order'
        };
    }
};

// ============= CATEGORIES MANAGEMENT =============
export const getAllCategories = async (params = {}) => {
    try {
        const response = await api.get('/categories/admin/all', { params });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch categories'
        };
    }
};

export const getCategoryById = async (categoryId) => {
    try {
        const response = await api.get(`/categories/${categoryId}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch category'
        };
    }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await api.post('/categories', categoryData);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create category'
        };
    }
};

export const updateCategory = async (categoryId, categoryData) => {
    try {
        const response = await api.put(`/categories/${categoryId}`, categoryData);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update category'
        };
    }
};

export const deleteCategory = async (categoryId) => {
    try {
        const response = await api.delete(`/categories/${categoryId}`);
        return {
            success: true,
            message: response.data.message || 'Category deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete category'
        };
    }
};

// ============= ANALYTICS =============
export const getAnalytics = async () => {
    try {
        const response = await api.get('/analytics/dashboard');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch analytics'
        };
    }
};

// ============= COUPONS MANAGEMENT =============
export const getAllCoupons = async () => {
    try {
        // Add cache-busting parameter to ensure fresh data
        const response = await api.get(`/coupons?t=${Date.now()}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch coupons'
        };
    }
};

export const createCoupon = async (couponData) => {
    try {
        const response = await api.post('/coupons', couponData);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create coupon'
        };
    }
};

export const getCouponById = async (couponId) => {
    try {
        const response = await api.get(`/coupons/${couponId}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch coupon'
        };
    }
};

export const updateCoupon = async (couponId, couponData) => {
    try {
        const response = await api.put(`/coupons/${couponId}`, couponData);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update coupon'
        };
    }
};

export const deleteCoupon = async (couponId) => {
    try {
        const response = await api.delete(`/coupons/${couponId}`);
        return {
            success: true,
            message: response.data.message || 'Coupon deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete coupon'
        };
    }
};

