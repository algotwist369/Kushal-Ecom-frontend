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
export const getAllProducts = async (params = {}, signal = null) => {
    try {
        const config = { params };
        if (signal) {
            config.signal = signal;
        }
        const response = await api.get('/products/admin/all', config);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        // Don't treat AbortError as a real error
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
            return {
                success: false,
                message: 'Request was cancelled',
                aborted: true
            };
        }
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch products'
        };
    }
};

export const getProductById = async (productId, signal) => {
    try {
        console.log('📡 API call: GET /products/' + productId);
        const response = await api.get(`/products/${productId}`, { signal });
        console.log('📡 API response received:', {
            status: response.status,
            hasData: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : []
        });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        // Don't treat AbortError as a real error
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
            console.log('⚠️ API call was aborted');
            return {
                success: false,
                message: 'Request was cancelled',
                aborted: true
            };
        }
        console.error('❌ API call failed:', {
            productId,
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.response?.data?.message || error.message,
            data: error.response?.data
        });
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to fetch product',
            status: error.response?.status,
            error: error
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
            message: error.response?.data?.message || 'Failed to create product',
            errors: error.response?.data?.errors // Include validation errors if available
        };
    }
};

export const updateProduct = async (productId, productData) => {
    try {
        // Ensure productData is a valid object
        if (!productData || typeof productData !== 'object') {
            return {
                success: false,
                message: 'Product data must be an object'
            };
        }

        // Validate productId
        if (!productId || typeof productId !== 'string') {
            return {
                success: false,
                message: 'Valid product ID is required'
            };
        }

        // Ensure Content-Type is set correctly
        const response = await api.put(`/products/${productId}`, productData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        // Handle network errors
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            return {
                success: false,
                message: 'Network error. Please check your connection and try again.'
            };
        }

        // Handle abort errors silently
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
            return {
                success: false,
                message: 'Request was cancelled',
                aborted: true
            };
        }

        // Extract detailed error information
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update product';
        const errorStatus = error.response?.status;
        const validationErrors = error.response?.data?.errors;

        return {
            success: false,
            message: errorMessage,
            status: errorStatus,
            errors: validationErrors
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
            message: error.response?.data?.message || error.message || 'Failed to delete product',
            status: error.response?.status
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

