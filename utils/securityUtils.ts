/// <reference types="vite/client" />
/**
 * Security utilities following OWASP and Android security principles adapted for Web.
 */

/**
 * Sanitizes user input to prevent XSS and injection attacks.
 * Removes HTML tags and potential script patterns.
 */
export const sanitizeInput = (val: string): string => {
    if (typeof val !== 'string') return '';
    return val
        .replace(/<[^>]*>?/gm, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .trim();
};

/**
 * Validates that string has a minimum length and only safe characters.
 */
export const isSecureInput = (val: string, minLength = 1): boolean => {
    if (!val || val.length < minLength) return false;
    // Check for common SQL injection or script patterns if needed
    const suspiciousTags = /('|--|;|\/\*|\*\/)/;
    return !suspiciousTags.test(val);
};

/**
 * Conditional logger that only prints in development mode.
 * Following "Disable debug logs in production" practice.
 */
export const secureLog = (message: string, data?: any) => {
    // In a pure browser environment, we check for dev mode via location or flag
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
        if (data) console.log(`[DEV_SEC] ${message}`, data);
        else console.log(`[DEV_SEC] ${message}`);
    }
};

/**
 * Generic error handler to avoid exposing stack traces or sensitive info.
 */
export const handleGenericError = (error: any, customMsg = 'An unexpected error occurred. Please try again.') => {
    secureLog('Caught error:', error);
    alert(customMsg);
};
