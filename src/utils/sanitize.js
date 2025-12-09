/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 * @param {string} input - Input string to sanitize
 * @param {object} options - Sanitization options
 * @returns {string}
 */
export const sanitizeInput = (input, options = {}) => {
    if (input === null || input === undefined) return '';
    
    if (typeof input !== 'string') {
        return String(input);
    }

    const {
        maxLength = 10000,
        allowHtml = false,
        trim = true
    } = options;

    let sanitized = input;

    // Trim whitespace
    if (trim) {
        sanitized = sanitized.trim();
    }

    // Remove HTML tags if not allowed
    if (!allowHtml) {
        sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Remove potentially dangerous characters
    sanitized = sanitized
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/&#x?[0-9a-f]+;/gi, ''); // Remove HTML entities

    // Limit length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
};

/**
 * Sanitize HTML content for safe rendering with dangerouslySetInnerHTML
 * Note: For production, use DOMPurify library
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (html) => {
    if (!html || typeof html !== 'string') return '';
    
    // Basic sanitization - remove script tags and event handlers
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '');
};

/**
 * Sanitize email address
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
export const sanitizeEmail = (email) => {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase().replace(/[<>]/g, '');
};

/**
 * Sanitize phone number (keep only digits)
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone number
 */
export const sanitizePhone = (phone) => {
    if (!phone || typeof phone !== 'string') return '';
    return phone.replace(/\D/g, '').substring(0, 10);
};

/**
 * Validate and sanitize URL
 * @param {string} url - URL to validate and sanitize
 * @returns {string|null} Sanitized URL or null if invalid
 */
export const sanitizeURL = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    try {
        const parsed = new URL(url);
        // Only allow http/https protocols
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return null;
        }
        return parsed.toString();
    } catch {
        return null;
    }
};

/**
 * Sanitize object recursively
 * @param {object} obj - Object to sanitize
 * @param {object} options - Sanitization options
 * @returns {object} Sanitized object
 */
export const sanitizeObject = (obj, options = {}) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, options));
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = sanitizeInput(key, { maxLength: 100 });
        if (typeof value === 'string') {
            sanitized[sanitizedKey] = sanitizeInput(value, options);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[sanitizedKey] = sanitizeObject(value, options);
        } else {
            sanitized[sanitizedKey] = value;
        }
    }
    
    return sanitized;
};

