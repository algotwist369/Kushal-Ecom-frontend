/**
 * Environment-aware logging utility
 * Removes console.logs in production builds
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

export const logger = {
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    
    warn: (...args) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },
    
    error: (...args) => {
        // Always log errors, even in production
        console.error(...args);
    },
    
    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
    
    debug: (...args) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },
    
    table: (...args) => {
        if (isDevelopment) {
            console.table(...args);
        }
    }
};

export default logger;

