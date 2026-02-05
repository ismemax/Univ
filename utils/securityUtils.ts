/// <reference types="vite/client" />
/**
 * Security utilities following OWASP and Android security principles adapted for Web.
 */

/**
 * Sanitizes user input to prevent XSS and injection attacks.
 * Upgraded with recursive tag removal and encoding prevention.
 */
export const sanitizeInput = (val: string): string => {
    if (typeof val !== 'string') return '';
    let sanitized = val;
    // Recursive removal of HTML tags
    while (sanitized.includes('<') && sanitized.includes('>')) {
        sanitized = sanitized.replace(/<[^>]*>?/gm, '');
    }
    return sanitized
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '')      // Remove inline event handlers (onerror, onclick, etc)
        .replace(/&/g, '&amp;')       // Encode &
        .replace(/</g, '&lt;')        // Encode <
        .replace(/>/g, '&gt;')        // Encode >
        .replace(/"/g, '&quot;')      // Encode "
        .replace(/'/g, '&#x27;')      // Encode '
        .trim();
};

/**
 * Checks for session integrity by verifying basic client-side fingerprints.
 * Prevents simple session hijacking/copying.
 */
export const validateSessionIntegrity = (sessionId: string): boolean => {
    if (!sessionId) return false;
    const clientKey = btoa(navigator.userAgent + navigator.language);
    const storedKey = localStorage.getItem(`umak_fp_${sessionId}`);

    if (!storedKey) {
        localStorage.setItem(`umak_fp_${sessionId}`, clientKey);
        return true;
    }
    return storedKey === clientKey;
};

/**
 * Creates a honeypot field check to detect bot-based penetration.
 */
export const isBotDetected = (honeypotValue: string): boolean => {
    return !!honeypotValue;
};

/**
 * Checks if the user has already submitted a response for a specific question in a session.
 * Prevents multiple submissions via page refresh.
 */
export const hasUserResponded = (sessionId: string, questionIndex: number): boolean => {
    const key = `umak_sub_${sessionId}_${questionIndex}`;
    return localStorage.getItem(key) === 'true';
};

/**
 * Marks a question as responded for the current user.
 */
export const markUserResponded = (sessionId: string, questionIndex: number): void => {
    const key = `umak_sub_${sessionId}_${questionIndex}`;
    localStorage.setItem(key, 'true');
};

/**
 * Conditional logger that only prints in development mode.
 * Following "Disable debug logs in production" practice.
 */
export const secureLog = (message: string, data?: any) => {
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
