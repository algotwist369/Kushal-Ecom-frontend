import api from '../api/axiosConfig';

// ============= PUBLIC PRODUCT APIs =============

/**
 * Get all products with optional query parameters
 * @param {Object} params - Query parameters (page, limit, category, minPrice, maxPrice, sortBy)
 * @returns {Promise<Object>} Response with products array, total, page, pages
 */
export const getProducts = async (params = {}) => {
    try {
        const response = await api.get('/products', { params });
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

/**
 * Get a single product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Response with product details
 */
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
            message: error.response?.data?.message || 'Failed to fetch product details'
        };
    }
};

/**
 * Get products with advanced filtering (POST method)
 * @param {Object} filterData - Filter options (page, limit, categories, minPrice, maxPrice, priceBuckets, rating, attributes, search, sortBy)
 * @returns {Promise<Object>} Response with filtered products, chunks, total, pages
 */
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

// ============= PRODUCT REVIEWS APIs =============

/**
 * Add or update a product review
 * @param {string} productId - Product ID
 * @param {Object} reviewData - Review data (rating, comment)
 * @returns {Promise<Object>} Response with success message
 */
export const addOrUpdateReview = async (productId, reviewData) => {
    try {
        const response = await api.post(`/products/${productId}/review`, reviewData);
        return {
            success: true,
            message: response.data.message || 'Review submitted successfully',
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to submit review'
        };
    }
};

/**
 * Delete a product review
 * @param {string} productId - Product ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} Response with success message
 */
export const deleteReview = async (productId, reviewId) => {
    try {
        const response = await api.delete(`/products/${productId}/review/${reviewId}`);
        return {
            success: true,
            message: response.data.message || 'Review deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete review'
        };
    }
};

// ============= HELPER FUNCTIONS =============

/**
 * Get products by category
 * @param {string} categoryId - Category ID
 * @param {Object} additionalParams - Additional query parameters
 * @returns {Promise<Object>} Response with products in that category
 */
export const getProductsByCategory = async (categoryId, additionalParams = {}) => {
    try {
        const response = await api.get('/products', {
            params: {
                category: categoryId,
                ...additionalParams
            }
        });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch products by category'
        };
    }
};

/**
 * Search products by text
 * @param {string} searchTerm - Search term
 * @param {Object} additionalFilters - Additional filter options
 * @returns {Promise<Object>} Response with search results
 */
export const searchProducts = async (searchTerm, additionalFilters = {}) => {
    try {
        const response = await api.post('/products/filter', {
            search: searchTerm,
            ...additionalFilters
        });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to search products'
        };
    }
};

/**
 * Get products with price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @param {Object} additionalParams - Additional query parameters
 * @returns {Promise<Object>} Response with products in price range
 */
export const getProductsByPriceRange = async (minPrice, maxPrice, additionalParams = {}) => {
    try {
        const response = await api.get('/products', {
            params: {
                minPrice,
                maxPrice,
                ...additionalParams
            }
        });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch products by price range'
        };
    }
};

/**
 * Get products sorted by specific criteria
 * @param {string} sortBy - Sort criteria (priceAsc, priceDesc, rating, newest)
 * @param {Object} additionalParams - Additional query parameters
 * @returns {Promise<Object>} Response with sorted products
 */
export const getProductsSorted = async (sortBy, additionalParams = {}) => {
    try {
        const response = await api.get('/products', {
            params: {
                sortBy,
                ...additionalParams
            }
        });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch sorted products'
        };
    }
};

