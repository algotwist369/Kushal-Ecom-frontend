import api from '../api/axiosConfig';

/**
 * Google OAuth Login
 * @param {string} credential - Google OAuth credential token
 * @returns {Promise<object>} - Response with user data and token
 */
export const googleLogin = async (credential) => {
    try {
        const response = await api.post('/auth/google', { credential });
        
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
            message: error.response?.data?.message || 'Google login failed. Please try again.'
        };
    }
};

