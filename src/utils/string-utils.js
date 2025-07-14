/**
 * String Utilities
 * 
 * Pure utility functions for string manipulation, text formatting,
 * and text processing extracted from the codebase.
 */

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} String with first letter capitalized
 */
export const capitalize = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert string to uppercase
 * @param {string} str - String to convert
 * @returns {string} Uppercase string
 */
export const toUpperCase = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.toUpperCase();
};

/**
 * Convert string to lowercase
 * @param {string} str - String to convert
 * @returns {string} Lowercase string
 */
export const toLowerCase = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.toLowerCase();
};

/**
 * Get first character of a string in uppercase (for initials)
 * @param {string} str - String to get initial from
 * @returns {string} First character in uppercase
 */
export const getInitial = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase();
};

/**
 * Get initials from a full name (first letter of each word)
 * @param {string} name - Full name string
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} Initials string
 */
export const getInitials = (name, maxInitials = 2) => {
    if (!name || typeof name !== 'string') return '';
    
    return name
        .split(' ')
        .slice(0, maxInitials)
        .map(word => word.charAt(0).toUpperCase())
        .join('');
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} suffix - Suffix to append (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Truncate email for display
 * Used in leaderboards and member lists
 * @param {string} email - Email to truncate
 * @param {number} maxLength - Maximum length (default: 20)
 * @returns {string} Truncated email
 */
export const truncateEmail = (email, maxLength = 20) => {
    return truncateText(email, maxLength);
};

/**
 * Generate summary from headline (used in news processing)
 * @param {string} headline - Article headline
 * @param {number} maxLength - Maximum summary length (default: 100)
 * @returns {string} Generated summary
 */
export const generateSummaryFromHeadline = (headline, maxLength = 100) => {
    if (!headline || typeof headline !== 'string') return '';
    
    if (headline.length > maxLength) {
        return headline.substring(0, maxLength - 3) + '...';
    }
    return `${headline} - Read the full article for more details.`;
};

/**
 * Clean and format invite code (uppercase, alphanumeric only)
 * @param {string} input - Input string
 * @param {number} maxLength - Maximum length (default: 6)
 * @returns {string} Cleaned invite code
 */
export const formatInviteCode = (input, maxLength = 6) => {
    if (!input || typeof input !== 'string') return '';
    return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, maxLength);
};

/**
 * Generate a random alphanumeric string
 * @param {number} length - Length of the string
 * @param {string} chars - Characters to use (default: uppercase + numbers)
 * @returns {string} Random string
 */
export const generateRandomString = (length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generate a unique 6-character invite code
 * @returns {string} 6-character invite code
 */
export const generateInviteCode = () => {
    return generateRandomString(6);
};

/**
 * Generate a unique ID with prefix
 * @param {string} prefix - Prefix for the ID (default: 'id')
 * @param {number} length - Length of random part (default: 9)
 * @returns {string} Unique ID
 */
export const generateUniqueId = (prefix = 'id', length = 9) => {
    const randomPart = Math.random().toString(36).substr(2, length);
    return `${prefix}_${Date.now()}_${randomPart}`;
};

/**
 * Check if string contains search term (case-insensitive)
 * @param {string} text - Text to search in
 * @param {string} searchTerm - Term to search for
 * @returns {boolean} True if found
 */
export const containsText = (text, searchTerm) => {
    if (!text || !searchTerm) return false;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
};

/**
 * Filter array of objects by search term in specified fields
 * @param {Array} items - Array of objects to filter
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Array} Filtered items
 */
export const filterBySearch = (items, searchTerm, fields) => {
    if (!searchTerm || searchTerm.trim().length < 2) return items;
    
    const term = searchTerm.toLowerCase().trim();
    
    return items.filter(item => {
        return fields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
};

/**
 * Create URL-friendly slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
export const createSlug = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Validate and clean text input
 * @param {string} input - Input text
 * @param {number} maxLength - Maximum allowed length
 * @param {boolean} allowSpecialChars - Allow special characters (default: true)
 * @returns {string} Cleaned text
 */
export const cleanTextInput = (input, maxLength = 1000, allowSpecialChars = true) => {
    if (!input || typeof input !== 'string') return '';
    
    let cleaned = input.trim();
    
    if (!allowSpecialChars) {
        cleaned = cleaned.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    
    return cleaned.substring(0, maxLength);
};

/**
 * Extract ticker symbol from company name or mixed text
 * @param {string} text - Text containing ticker
 * @returns {string} Extracted ticker (uppercase)
 */
export const extractTicker = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    // Look for patterns like (AAPL) or [AAPL] or just AAPL
    const tickerMatch = text.match(/\(([A-Z]{1,5})\)|\[([A-Z]{1,5})\]|([A-Z]{2,5})/);
    
    if (tickerMatch) {
        return tickerMatch[1] || tickerMatch[2] || tickerMatch[3];
    }
    
    return text.toUpperCase().trim();
};

/**
 * Format display name for UI (handle long names)
 * @param {string} name - Display name
 * @param {number} maxLength - Maximum length (default: 20)
 * @returns {string} Formatted display name
 */
export const formatDisplayName = (name, maxLength = 20) => {
    if (!name || typeof name !== 'string') return 'Unknown User';
    
    const trimmed = name.trim();
    if (trimmed.length <= maxLength) return trimmed;
    
    // Try to keep first name and last initial
    const parts = trimmed.split(' ');
    if (parts.length > 1) {
        const firstName = parts[0];
        const lastInitial = parts[parts.length - 1].charAt(0);
        const formatted = `${firstName} ${lastInitial}.`;
        
        if (formatted.length <= maxLength) {
            return formatted;
        }
    }
    
    return truncateText(trimmed, maxLength);
};

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} HTML-escaped text
 */
export const escapeHtml = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    
    return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Remove extra whitespace and normalize spacing
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
export const normalizeWhitespace = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n\n'); // Normalize line breaks
};

/**
 * Check if string is empty or only whitespace
 * @param {string} text - Text to check
 * @returns {boolean} True if empty or whitespace only
 */
export const isEmpty = (text) => {
    return !text || typeof text !== 'string' || text.trim().length === 0;
};

/**
 * Get safe text content (handles null/undefined)
 * @param {any} value - Value to convert to safe text
 * @param {string} fallback - Fallback text (default: '')
 * @returns {string} Safe text content
 */
export const getSafeText = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    return String(value);
};