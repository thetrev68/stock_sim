/**
 * Validation and Sanitization Utilities
 * 
 * Pure utility functions for input validation, data sanitization,
 * and form validation extracted from the codebase.
 */

/**
 * Basic Input Validation
 */

/**
 * Check if value is not null, undefined, or empty string
 * @param {any} value - Value to check
 * @returns {boolean} True if value is present
 */
export const isPresent = (value) => {
    return value !== null && value !== undefined && value !== "";
};

/**
 * Check if string is not empty after trimming
 * @param {string} str - String to check
 * @returns {boolean} True if string has content
 */
export const isNotEmpty = (str) => {
    return typeof str === "string" && str.trim().length > 0;
};

/**
 * Validate email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean} True if email format is valid
 */
export const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length (default: 6)
 * @returns {object} Validation result with valid flag and message
 */
export const validatePassword = (password, minLength = 6) => {
    if (!password || typeof password !== "string") {
        return { valid: false, message: "Password is required" };
    }
    
    if (password.length < minLength) {
        return { valid: false, message: `Password must be at least ${minLength} characters` };
    }
    
    return { valid: true, message: "Password is valid" };
};

/**
 * Validate required fields in an object
 * @param {object} data - Data object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {object} Validation result with valid flag and missing fields
 */
export const validateRequiredFields = (data, requiredFields) => {
    const missing = [];
    
    requiredFields.forEach(field => {
        if (!isPresent(data[field])) {
            missing.push(field);
        }
    });
    
    return {
        valid: missing.length === 0,
        missing,
        message: missing.length > 0 ? `Missing required fields: ${missing.join(", ")}` : "All required fields present"
    };
};

/**
 * Stock Trading Validation
 */

/**
 * Validate stock ticker symbol
 * @param {string} ticker - Ticker symbol to validate
 * @returns {object} Validation result
 */
export const validateTicker = (ticker) => {
    if (!ticker || typeof ticker !== "string") {
        return { valid: false, message: "Ticker symbol is required" };
    }
    
    const cleaned = ticker.trim().toUpperCase();
    
    if (cleaned.length < 1 || cleaned.length > 10) {
        return { valid: false, message: "Ticker symbol must be 1-10 characters" };
    }
    
    // Check for valid characters (letters and numbers only)
    if (!/^[A-Z0-9]+$/.test(cleaned)) {
        return { valid: false, message: "Ticker symbol can only contain letters and numbers" };
    }
    
    return { valid: true, ticker: cleaned, message: "Valid ticker symbol" };
};

/**
 * Validate trade quantity
 * @param {any} quantity - Quantity to validate
 * @param {number} maxQuantity - Maximum allowed quantity (optional)
 * @returns {object} Validation result
 */
export const validateQuantity = (quantity, maxQuantity = null) => {
    // Convert to number if it's a string
    const num = typeof quantity === "string" ? parseInt(quantity, 10) : quantity;
    
    if (isNaN(num) || !Number.isInteger(num)) {
        return { valid: false, message: "Quantity must be a whole number" };
    }
    
    if (num <= 0) {
        return { valid: false, message: "Quantity must be greater than 0" };
    }
    
    if (maxQuantity !== null && num > maxQuantity) {
        return { valid: false, message: `Quantity cannot exceed ${maxQuantity}` };
    }
    
    return { valid: true, quantity: num, message: "Valid quantity" };
};

/**
 * Validate trade price
 * @param {any} price - Price to validate
 * @param {number} minPrice - Minimum allowed price (default: 0.01)
 * @param {number} maxPrice - Maximum allowed price (optional)
 * @returns {object} Validation result
 */
export const validatePrice = (price, minPrice = 0.01, maxPrice = null) => {
    // Convert to number if it's a string
    const num = typeof price === "string" ? parseFloat(price) : price;
    
    if (isNaN(num) || typeof num !== "number") {
        return { valid: false, message: "Price must be a valid number" };
    }
    
    if (num < minPrice) {
        return { valid: false, message: `Price must be at least $${minPrice}` };
    }
    
    if (maxPrice !== null && num > maxPrice) {
        return { valid: false, message: `Price cannot exceed $${maxPrice}` };
    }
    
    return { valid: true, price: num, message: "Valid price" };
};

/**
 * Validate trade type
 * @param {string} type - Trade type to validate
 * @param {Array<string>} allowedTypes - Allowed trade types (default: ['buy', 'sell'])
 * @returns {object} Validation result
 */
export const validateTradeType = (type, allowedTypes = ["buy", "sell"]) => {
    if (!type || typeof type !== "string") {
        return { valid: false, message: "Trade type is required" };
    }
    
    const normalized = type.toLowerCase().trim();
    
    if (!allowedTypes.includes(normalized)) {
        return { valid: false, message: `Trade type must be one of: ${allowedTypes.join(", ")}` };
    }
    
    return { valid: true, type: normalized, message: "Valid trade type" };
};

/**
 * Validate complete trade details
 * @param {object} tradeDetails - Trade details object
 * @returns {object} Validation result with all field validations
 */
export const validateTradeDetails = (tradeDetails) => {
    const results = {};
    let allValid = true;
    const errors = [];
    
    // Validate ticker
    const tickerResult = validateTicker(tradeDetails.ticker);
    results.ticker = tickerResult;
    if (!tickerResult.valid) {
        allValid = false;
        errors.push(tickerResult.message);
    }
    
    // Validate quantity
    const quantityResult = validateQuantity(tradeDetails.quantity);
    results.quantity = quantityResult;
    if (!quantityResult.valid) {
        allValid = false;
        errors.push(quantityResult.message);
    }
    
    // Validate price
    const priceResult = validatePrice(tradeDetails.price);
    results.price = priceResult;
    if (!priceResult.valid) {
        allValid = false;
        errors.push(priceResult.message);
    }
    
    // Validate type
    const typeResult = validateTradeType(tradeDetails.type);
    results.type = typeResult;
    if (!typeResult.valid) {
        allValid = false;
        errors.push(typeResult.message);
    }
    
    return {
        valid: allValid,
        results,
        errors,
        message: allValid ? "All trade details are valid" : errors.join("; ")
    };
};

/**
 * Simulation Validation
 */

/**
 * Validate simulation name
 * @param {string} name - Simulation name to validate
 * @param {number} minLength - Minimum length (default: 3)
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {object} Validation result
 */
export const validateSimulationName = (name, minLength = 3, maxLength = 50) => {
    if (!name || typeof name !== "string") {
        return { valid: false, message: "Simulation name is required" };
    }
    
    const trimmed = name.trim();
    
    if (trimmed.length < minLength) {
        return { valid: false, message: `Simulation name must be at least ${minLength} characters` };
    }
    
    if (trimmed.length > maxLength) {
        return { valid: false, message: `Simulation name cannot exceed ${maxLength} characters` };
    }
    
    return { valid: true, name: trimmed, message: "Valid simulation name" };
};

/**
 * Validate date range (start and end dates)
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {object} Validation result
 */
export const validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (isNaN(start.getTime())) {
        return { valid: false, message: "Start date is not valid" };
    }
    
    if (isNaN(end.getTime())) {
        return { valid: false, message: "End date is not valid" };
    }
    
    if (start >= end) {
        return { valid: false, message: "End date must be after start date" };
    }
    
    if (end <= now) {
        return { valid: false, message: "End date must be in the future" };
    }
    
    return { valid: true, startDate: start, endDate: end, message: "Valid date range" };
};

/**
 * Validate starting balance
 * @param {any} balance - Balance to validate
 * @param {number} minBalance - Minimum balance (default: 1000)
 * @param {number} maxBalance - Maximum balance (default: 1000000)
 * @returns {object} Validation result
 */
export const validateStartingBalance = (balance, minBalance = 1000, maxBalance = 1000000) => {
    const num = typeof balance === "string" ? parseFloat(balance) : balance;
    
    if (isNaN(num) || typeof num !== "number") {
        return { valid: false, message: "Starting balance must be a valid number" };
    }
    
    if (num < minBalance) {
        return { valid: false, message: `Starting balance must be at least $${minBalance.toLocaleString()}` };
    }
    
    if (num > maxBalance) {
        return { valid: false, message: `Starting balance cannot exceed $${maxBalance.toLocaleString()}` };
    }
    
    return { valid: true, balance: num, message: "Valid starting balance" };
};

/**
 * Validate invite code format
 * @param {string} code - Invite code to validate
 * @param {number} expectedLength - Expected length (default: 6)
 * @returns {object} Validation result
 */
export const validateInviteCode = (code, expectedLength = 6) => {
    if (!code || typeof code !== "string") {
        return { valid: false, message: "Invite code is required" };
    }
    
    const cleaned = code.trim().toUpperCase();
    
    if (cleaned.length !== expectedLength) {
        return { valid: false, message: `Invite code must be ${expectedLength} characters` };
    }
    
    if (!/^[A-Z0-9]+$/.test(cleaned)) {
        return { valid: false, message: "Invite code can only contain letters and numbers" };
    }
    
    return { valid: true, code: cleaned, message: "Valid invite code" };
};

/**
 * Validate complete simulation data
 * @param {object} simulationData - Simulation data to validate
 * @returns {object} Validation result
 */
export const validateSimulationData = (simulationData) => {
    const results = {};
    let allValid = true;
    const errors = [];
    
    // Validate name
    const nameResult = validateSimulationName(simulationData.name);
    results.name = nameResult;
    if (!nameResult.valid) {
        allValid = false;
        errors.push(nameResult.message);
    }
    
    // Validate date range
    const dateResult = validateDateRange(simulationData.startDate, simulationData.endDate);
    results.dateRange = dateResult;
    if (!dateResult.valid) {
        allValid = false;
        errors.push(dateResult.message);
    }
    
    // Validate starting balance
    const balanceResult = validateStartingBalance(simulationData.startingBalance);
    results.balance = balanceResult;
    if (!balanceResult.valid) {
        allValid = false;
        errors.push(balanceResult.message);
    }
    
    return {
        valid: allValid,
        results,
        errors,
        message: allValid ? "All fields are valid" : errors.join("; ")
    };
};

/**
 * Data Sanitization
 */

/**
 * Sanitize string input by trimming and removing potentially harmful characters
 * @param {string} input - Input string to sanitize
 * @param {boolean} allowSpecialChars - Whether to allow special characters (default: true)
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input, allowSpecialChars = true) => {
    if (!input || typeof input !== "string") return "";
    
    let sanitized = input.trim();
    
    if (!allowSpecialChars) {
        // Remove special characters except spaces, letters, and numbers
        sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, "");
    }
    
    // Remove multiple consecutive spaces
    sanitized = sanitized.replace(/\s+/g, " ");
    
    return sanitized;
};