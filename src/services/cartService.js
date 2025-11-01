import api from '../api/axiosConfig';

// Get user's cart
export const getCart = async () => {
    const response = await api.get('/cart');
    return response.data;
};

// Add or update item in cart
export const addToCart = async (productId, quantity = 1, packInfo = null) => {
    const response = await api.post('/cart', { productId, quantity, packInfo });
    return response.data;
};

// Update cart item quantity
export const updateCartQuantity = async (productId, quantity) => {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
};

// Remove item from cart
export const removeFromCart = async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
};

export default {
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart
};

