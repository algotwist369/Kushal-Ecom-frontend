// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/v1/api';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const config = {
    apiUrl: API_URL,
    timeout: 10000,
    tokenKey: 'token',
    userKey: 'user',
    googleClientId: GOOGLE_CLIENT_ID
};

