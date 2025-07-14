/**
 * DOM Utilities
 * 
 * Pure utility functions for DOM manipulation, element creation,
 * and UI state management extracted from the codebase.
 */

/**
 * Element Selection Utilities
 */

/**
 * Get element by ID with null safety
 * @param {string} id - Element ID
 * @returns {Element|null} Element or null if not found
 */
export const getElement = (id) => {
    return document.getElementById(id);
};

/**
 * Get element by ID and update its text content
 * @param {string} id - Element ID
 * @param {string} text - Text content to set
 * @returns {boolean} True if element was found and updated
 */
export const updateElementText = (id, text) => {
    const element = getElement(id);
    if (element) {
        element.textContent = text;
        return true;
    }
    return false;
};

/**
 * Get element by ID and update its innerHTML
 * @param {string} id - Element ID
 * @param {string} html - HTML content to set
 * @returns {boolean} True if element was found and updated
 */
export const updateElementHTML = (id, html) => {
    const element = getElement(id);
    if (element) {
        element.innerHTML = html;
        return true;
    }
    return false;
};

/**
 * Class Management Utilities
 */

/**
 * Add class to element by ID
 * @param {string} id - Element ID
 * @param {string} className - Class name to add
 * @returns {boolean} True if element was found and class added
 */
export const addClass = (id, className) => {
    const element = getElement(id);
    if (element) {
        element.classList.add(className);
        return true;
    }
    return false;
};

/**
 * Remove class from element by ID
 * @param {string} id - Element ID
 * @param {string} className - Class name to remove
 * @returns {boolean} True if element was found and class removed
 */
export const removeClass = (id, className) => {
    const element = getElement(id);
    if (element) {
        element.classList.remove(className);
        return true;
    }
    return false;
};

/**
 * Toggle class on element by ID
 * @param {string} id - Element ID
 * @param {string} className - Class name to toggle
 * @returns {boolean} True if element was found and class toggled
 */
export const toggleClass = (id, className) => {
    const element = getElement(id);
    if (element) {
        element.classList.toggle(className);
        return true;
    }
    return false;
};

/**
 * Check if element has class
 * @param {string} id - Element ID
 * @param {string} className - Class name to check
 * @returns {boolean} True if element has the class
 */
export const hasClass = (id, className) => {
    const element = getElement(id);
    return element ? element.classList.contains(className) : false;
};

/**
 * UI State Management Utilities
 */

/**
 * Show element by removing 'hidden' class
 * @param {string} id - Element ID
 * @returns {boolean} True if element was found and shown
 */
export const showElement = (id) => {
    return removeClass(id, 'hidden');
};

/**
 * Hide element by adding 'hidden' class
 * @param {string} id - Element ID
 * @returns {boolean} True if element was found and hidden
 */
export const hideElement = (id) => {
    return addClass(id, 'hidden');
};

/**
 * Toggle element visibility using 'hidden' class
 * @param {string} id - Element ID
 * @returns {boolean} True if element was found and toggled
 */
export const toggleElement = (id) => {
    return toggleClass(id, 'hidden');
};

/**
 * Check if element is visible (doesn't have 'hidden' class)
 * @param {string} id - Element ID
 * @returns {boolean} True if element is visible
 */
export const isElementVisible = (id) => {
    return !hasClass(id, 'hidden');
};

/**
 * Show loading state by hiding main content and showing loading element
 * @param {string} contentId - ID of content element to hide
 * @param {string} loadingId - ID of loading element to show
 */
export const showLoadingState = (contentId, loadingId) => {
    hideElement(contentId);
    showElement(loadingId);
};

/**
 * Hide loading state by showing main content and hiding loading element
 * @param {string} contentId - ID of content element to show
 * @param {string} loadingId - ID of loading element to hide
 */
export const hideLoadingState = (contentId, loadingId) => {
    showElement(contentId);
    hideElement(loadingId);
};

/**
 * Element Creation Utilities
 */

/**
 * Create element with class and content
 * @param {string} tagName - HTML tag name
 * @param {string|null} className - CSS class(es) to add
 * @param {string|null} content - Text content or innerHTML
 * @param {boolean} useInnerHTML - Whether to use innerHTML (default: false)
 * @returns {Element} Created element
 */
export const createElement = (tagName, className = null, content = null, useInnerHTML = false) => {
    const element = document.createElement(tagName);
    
    if (className) {
        element.className = className;
    }
    
    if (content) {
        if (useInnerHTML) {
            element.innerHTML = content;
        } else {
            element.textContent = content;
        }
    }
    
    return element;
};

/**
 * Create div element with class and content
 * @param {string|null} className - CSS class(es) to add
 * @param {string|null} content - Text content or innerHTML
 * @param {boolean} useInnerHTML - Whether to use innerHTML (default: false)
 * @returns {Element} Created div element
 */
export const createDiv = (className = null, content = null, useInnerHTML = false) => {
    return createElement('div', className, content, useInnerHTML);
};

/**
 * Append child element to parent by ID
 * @param {string} parentId - Parent element ID
 * @param {Element} childElement - Child element to append
 * @returns {boolean} True if parent was found and child appended
 */
export const appendChild = (parentId, childElement) => {
    const parent = getElement(parentId);
    if (parent && childElement) {
        parent.appendChild(childElement);
        return true;
    }
    return false;
};

/**
 * Clear all children from element by ID
 * @param {string} id - Element ID
 * @returns {boolean} True if element was found and cleared
 */
export const clearElement = (id) => {
    const element = getElement(id);
    if (element) {
        element.innerHTML = '';
        return true;
    }
    return false;
};

/**
 * Remove element from DOM by ID
 * @param {string} id - Element ID
 * @returns {boolean} True if element was found and removed
 */
export const removeElement = (id) => {
    const element = getElement(id);
    if (element) {
        element.remove();
        return true;
    }
    return false;
};

/**
 * Modal and Popup Utilities
 */

/**
 * Insert HTML at end of body (useful for modals)
 * @param {string} html - HTML string to insert
 */
export const insertAtBodyEnd = (html) => {
    document.body.insertAdjacentHTML('beforeend', html);
};

/**
 * Create and show temporary message
 * @param {string} message - Message text
 * @param {string} type - Message type ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in milliseconds (default: 5000)
 * @param {string} containerId - Optional container ID (default: adds to body)
 */
export const showTemporaryMessage = (message, type = 'info', duration = 5000, containerId = null) => {
    const colorClasses = {
        success: 'bg-green-900/20 border-green-500 text-green-400',
        warning: 'bg-yellow-900/20 border-yellow-500 text-yellow-400',
        error: 'bg-red-900/20 border-red-500 text-red-400',
        info: 'bg-blue-900/20 border-blue-500 text-blue-400'
    };

    const messageHTML = `
        <div id="temp-message" class="fixed top-4 right-4 ${colorClasses[type]} border rounded-lg p-4 z-50 max-w-sm">
            <div class="flex items-center gap-3">
                <div class="flex-1">
                    <p class="font-medium">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-current opacity-70 hover:opacity-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    // Remove existing message
    removeElement('temp-message');

    // Insert new message
    if (containerId) {
        const container = getElement(containerId);
        if (container) {
            container.insertAdjacentHTML('beforeend', messageHTML);
        }
    } else {
        insertAtBodyEnd(messageHTML);
    }

    // Auto-remove after duration
    setTimeout(() => removeElement('temp-message'), duration);
};

/**
 * UI State Patterns (Common multi-element operations)
 */

/**
 * Show loading, hide content and error
 * @param {string} loadingId - Loading element ID
 * @param {string} contentId - Content element ID
 * @param {string} errorId - Error element ID
 */
export const showLoading = (loadingId, contentId, errorId) => {
    showElement(loadingId);
    hideElement(contentId);
    hideElement(errorId);
};

/**
 * Show content, hide loading and error
 * @param {string} loadingId - Loading element ID
 * @param {string} contentId - Content element ID
 * @param {string} errorId - Error element ID
 */
export const showContent = (loadingId, contentId, errorId) => {
    hideElement(loadingId);
    showElement(contentId);
    hideElement(errorId);
};

/**
 * Show error, hide loading and content
 * @param {string} loadingId - Loading element ID
 * @param {string} contentId - Content element ID
 * @param {string} errorId - Error element ID
 * @param {string} errorMessage - Error message to display
 */
export const showError = (loadingId, contentId, errorId, errorMessage = null) => {
    hideElement(loadingId);
    hideElement(contentId);
    showElement(errorId);
    
    if (errorMessage) {
        updateElementText(errorId, errorMessage);
    }
};

/**
 * Show empty state, hide loading, content, and error
 * @param {string} loadingId - Loading element ID
 * @param {string} contentId - Content element ID
 * @param {string} errorId - Error element ID
 * @param {string} emptyId - Empty state element ID
 */
export const showEmpty = (loadingId, contentId, errorId, emptyId) => {
    hideElement(loadingId);
    hideElement(contentId);
    hideElement(errorId);
    showElement(emptyId);
};

/**
 * Form and Input Utilities
 */

/**
 * Set element disabled state
 * @param {string} id - Element ID
 * @param {boolean} disabled - Disabled state
 * @returns {boolean} True if element was found and updated
 */
export const setDisabled = (id, disabled) => {
    const element = getElement(id);
    if (element) {
        element.disabled = disabled;
        return true;
    }
    return false;
};

/**
 * Enable element
 * @param {string} id - Element ID
 * @returns {boolean} True if element was found and enabled
 */
export const enableElement = (id) => {
    return setDisabled(id, false);
};

/**
 * Disable element
 * @param {string} id - Element ID
 * @returns {boolean} True if element was found and disabled
 */
export const disableElement = (id) => {
    return setDisabled(id, true);
};

/**
 * Get element value
 * @param {string} id - Element ID
 * @returns {string|null} Element value or null if not found
 */
export const getElementValue = (id) => {
    const element = getElement(id);
    return element ? element.value : null;
};

/**
 * Set element value
 * @param {string} id - Element ID
 * @param {string} value - Value to set
 * @returns {boolean} True if element was found and value set
 */
export const setElementValue = (id, value) => {
    const element = getElement(id);
    if (element) {
        element.value = value;
        return true;
    }
    return false;
};

/**
 * Focus on element
 * @param {string} id - Element ID
 * @param {number} delay - Delay in milliseconds (default: 0)
 * @returns {boolean} True if element was found
 */
export const focusElement = (id, delay = 0) => {
    const element = getElement(id);
    if (element) {
        if (delay > 0) {
            setTimeout(() => element.focus(), delay);
        } else {
            element.focus();
        }
        return true;
    }
    return false;
};

/**
 * Event Listener Utilities
 */

/**
 * Add event listener to element by ID
 * @param {string} id - Element ID
 * @param {string} event - Event type
 * @param {Function} handler - Event handler function
 * @returns {boolean} True if element was found and listener added
 */
export const addEventListenerById = (id, event, handler) => {
    const element = getElement(id);
    if (element) {
        element.addEventListener(event, handler);
        return true;
    }
    return false;
};

/**
 * Remove event listener from element by ID
 * @param {string} id - Element ID
 * @param {string} event - Event type
 * @param {Function} handler - Event handler function
 * @returns {boolean} True if element was found and listener removed
 */
export const removeEventListenerById = (id, event, handler) => {
    const element = getElement(id);
    if (element) {
        element.removeEventListener(event, handler);
        return true;
    }
    return false;
};

/**
 * Utility Functions
 */

/**
 * Check if element exists in DOM
 * @param {string} id - Element ID
 * @returns {boolean} True if element exists
 */
export const elementExists = (id) => {
    return getElement(id) !== null;
};

/**
 * Get multiple elements by IDs
 * @param {Array<string>} ids - Array of element IDs
 * @returns {Object} Object with ID as key and element as value
 */
export const getElements = (ids) => {
    const elements = {};
    ids.forEach(id => {
        elements[id] = getElement(id);
    });
    return elements;
};