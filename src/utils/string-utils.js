/**
 * String Utilities
 * 
 * Pure utility functions for string manipulation, text formatting,
 * and text processing. Cleaned up to include only actively used functions.
 */

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} String with first letter capitalized
 */
export const capitalize = (str) => {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get first character of a string in uppercase (for initials)
 * @param {string} str - String to get initial from
 * @returns {string} First character in uppercase
 */
export const getInitial = (str) => {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase();
};

/**
 * Get initials from a full name (first letter of each word)
 * @param {string} name - Full name string
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} Initials string
 */
export const getInitials = (name, maxInitials = 2) => {
    if (!name || typeof name !== "string") return "";
    
    return name
        .split(" ")
        .slice(0, maxInitials)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} suffix - Suffix to append (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, suffix = "...") => {
    if (!text || typeof text !== "string") return "";
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Format display name for UI (handle long names)
 * @param {string} name - Display name
 * @param {number} maxLength - Maximum length (default: 20)
 * @returns {string} Formatted display name
 */
export const formatDisplayName = (name, maxLength = 20) => {
    if (!name || typeof name !== "string") return "Unknown User";
    
    const trimmed = name.trim();
    if (trimmed.length <= maxLength) return trimmed;
    
    // Try to keep first name and last initial
    const parts = trimmed.split(" ");
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
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} HTML-escaped text
 */
export const escapeHtml = (text) => {
    if (!text || typeof text !== "string") return "";
    
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    };
    
    return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Remove extra whitespace and normalize spacing
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
export const normalizeWhitespace = (text) => {
    if (!text || typeof text !== "string") return "";
    
    return text
        .trim()
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, "\n\n"); // Normalize line breaks
};

/**
 * Check if string is empty or only whitespace
 * @param {string} text - Text to check
 * @returns {boolean} True if empty or whitespace only
 */
export const isEmpty = (text) => {
    return !text || typeof text !== "string" || text.trim().length === 0;
};

/**
 * Get safe text content (handles null/undefined)
 * @param {any} value - Value to convert to safe text
 * @param {string} fallback - Fallback text (default: '')
 * @returns {string} Safe text content
 */
export const getSafeText = (value, fallback = "") => {
    if (value === null || value === undefined) return fallback;
    return String(value);
};

/**
 * Generate a simple unique ID with prefix
 * @param {string} prefix - Prefix for the ID (default: 'id')
 * @returns {string} Simple unique ID
 */
export const generateSimpleId = (prefix = "id") => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};