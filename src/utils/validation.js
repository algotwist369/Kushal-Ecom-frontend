/**
 * Input validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate password strength (matches backend requirements)
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return { 
            isValid: false, 
            message: 'Password must contain uppercase, lowercase, and at least one number' 
        };
    }

    return { isValid: true, message: '' };
};

/**
 * Validate pincode (Indian format - 6 digits)
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} True if valid
 */
export const isValidPincode = (pincode) => {
    if (!pincode || typeof pincode !== 'string') return false;
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode.trim());
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export const isValidURL = (url) => {
    if (!url || typeof url !== 'string') return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {object} Validation result
 */
export const validateLength = (text, min = 0, max = Infinity) => {
    if (!text || typeof text !== 'string') {
        return { isValid: false, message: 'Text is required' };
    }
    
    const length = text.trim().length;
    
    if (length < min) {
        return { isValid: false, message: `Must be at least ${min} characters` };
    }
    
    if (length > max) {
        return { isValid: false, message: `Must be no more than ${max} characters` };
    }
    
    return { isValid: true, message: '' };
};

