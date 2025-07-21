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
    return removeClass(id, "hidden");
};

/**
 * Hide element by adding 'hidden' class
 * @param {string} id - Element ID
 * @returns {boolean} True if element was found and hidden
 */
export const hideElement = (id) => {
    return addClass(id, "hidden");
};

/**
 * Toggle element visibility using 'hidden' class
 * @param {string} id - Element ID
 * @returns {boolean} True if element was found and toggled
 */
export const toggleElement = (id) => {
    return toggleClass(id, "hidden");
};

/**
 * Check if element is visible (doesn't have 'hidden' class)
 * @param {string} id - Element ID
 * @returns {boolean} True if element is visible
 */
export const isElementVisible = (id) => {
    return !hasClass(id, "hidden");
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
    return createElement("div", className, content, useInnerHTML);
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
        element.innerHTML = "";
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
    document.body.insertAdjacentHTML("beforeend", html);
};

/**
 * Create and show temporary message
 * @param {string} message - Message text
 * @param {string} type - Message type ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in milliseconds (default: 5000)
 * @param {string} containerId - Optional container ID (default: adds to body)
 */
export const showTemporaryMessage = (message, type = "info", duration = 5000, containerId = null) => {
    const colorClasses = {
        success: "bg-green-900/20 border-green-500 text-green-400",
        warning: "bg-yellow-900/20 border-yellow-500 text-yellow-400",
        error: "bg-red-900/20 border-red-500 text-red-400",
        info: "bg-blue-900/20 border-blue-500 text-blue-400"
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
    removeElement("temp-message");

    // Insert new message
    if (containerId) {
        const container = getElement(containerId);
        if (container) {
            container.insertAdjacentHTML("beforeend", messageHTML);
        }
    } else {
        insertAtBodyEnd(messageHTML);
    }

    // Auto-remove after duration
    setTimeout(() => removeElement("temp-message"), duration);
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

// ============================================================================
// NEW UTILITIES - Added based on codebase audit
// ============================================================================

/**
 * Button Loading State Management
 */

/**
 * Set button loading state with text and spinner management
 * @param {string} buttonId - Button element ID
 * @param {boolean} loading - Loading state
 * @param {string} textId - Text element ID (optional)
 * @param {string} spinnerId - Spinner element ID (optional)
 * @returns {boolean} True if button was found and updated
 */
export const setButtonLoading = (buttonId, loading, textId = null, spinnerId = null) => {
    const button = getElement(buttonId);
    if (!button) return false;

    button.disabled = loading;

    if (textId) {
        if (loading) {
            hideElement(textId);
        } else {
            showElement(textId);
        }
    }

    if (spinnerId) {
        if (loading) {
            showElement(spinnerId);
        } else {
            hideElement(spinnerId);
        }
    }

    return true;
};

/**
 * Set button loading state with HTML content replacement
 * @param {string} buttonId - Button element ID
 * @param {boolean} loading - Loading state
 * @param {string} loadingHTML - HTML to show when loading
 * @param {string} normalHTML - HTML to show when not loading
 * @returns {boolean} True if button was found and updated
 */
export const setButtonLoadingHTML = (buttonId, loading, loadingHTML, normalHTML) => {
    const button = getElement(buttonId);
    if (!button) return false;

    button.disabled = loading;
    button.innerHTML = loading ? loadingHTML : normalHTML;

    return true;
};

/**
 * Enable button
 * @param {string} buttonId - Button element ID
 * @returns {boolean} True if button was found and enabled
 */
export const enableButton = (buttonId) => {
    return enableElement(buttonId);
};

/**
 * Disable button
 * @param {string} buttonId - Button element ID
 * @returns {boolean} True if button was found and disabled
 */
export const disableButton = (buttonId) => {
    return disableElement(buttonId);
};

/**
 * Bulk Element Operations
 */

/**
 * Update multiple elements' text content
 * @param {Object} updates - Object with element ID as key and text as value
 * @returns {Object} Object with element ID as key and success boolean as value
 */
export const updateMultipleElementsText = (updates) => {
    const results = {};
    Object.entries(updates).forEach(([id, text]) => {
        results[id] = updateElementText(id, text);
    });
    return results;
};

/**
 * Update multiple elements' HTML content
 * @param {Object} updates - Object with element ID as key and HTML as value
 * @returns {Object} Object with element ID as key and success boolean as value
 */
export const updateMultipleElementsHTML = (updates) => {
    const results = {};
    Object.entries(updates).forEach(([id, html]) => {
        results[id] = updateElementHTML(id, html);
    });
    return results;
};

/**
 * Show multiple elements
 * @param {Array<string>} ids - Array of element IDs to show
 * @returns {Object} Object with element ID as key and success boolean as value
 */
export const showMultipleElements = (ids) => {
    const results = {};
    ids.forEach(id => {
        results[id] = showElement(id);
    });
    return results;
};

/**
 * Hide multiple elements
 * @param {Array<string>} ids - Array of element IDs to hide
 * @returns {Object} Object with element ID as key and success boolean as value
 */
export const hideMultipleElements = (ids) => {
    const results = {};
    ids.forEach(id => {
        results[id] = hideElement(id);
    });
    return results;
};

/**
 * Enable multiple elements
 * @param {Array<string>} ids - Array of element IDs to enable
 * @returns {Object} Object with element ID as key and success boolean as value
 */
export const enableMultipleElements = (ids) => {
    const results = {};
    ids.forEach(id => {
        results[id] = enableElement(id);
    });
    return results;
};

/**
 * Disable multiple elements
 * @param {Array<string>} ids - Array of element IDs to disable
 * @returns {Object} Object with element ID as key and success boolean as value
 */
export const disableMultipleElements = (ids) => {
    const results = {};
    ids.forEach(id => {
        results[id] = disableElement(id);
    });
    return results;
};

/**
 * Modal Management Utilities
 */

/**
 * Show modal by ID
 * @param {string} modalId - Modal element ID
 * @returns {boolean} True if modal was found and shown
 */
export const showModal = (modalId) => {
    return showElement(modalId);
};

/**
 * Hide modal by ID
 * @param {string} modalId - Modal element ID
 * @returns {boolean} True if modal was found and hidden
 */
export const hideModal = (modalId) => {
    return hideElement(modalId);
};

/**
 * Remove modal from DOM
 * @param {string} modalId - Modal element ID
 * @returns {boolean} True if modal was found and removed
 */
export const removeModal = (modalId) => {
    return removeElement(modalId);
};

/**
 * Check if modal is visible
 * @param {string} modalId - Modal element ID
 * @returns {boolean} True if modal is visible
 */
export const isModalVisible = (modalId) => {
    return isElementVisible(modalId);
};

/**
 * Form State Management
 */

/**
 * Reset form by ID
 * @param {string} formId - Form element ID
 * @returns {boolean} True if form was found and reset
 */
export const resetForm = (formId) => {
    const form = getElement(formId);
    if (form && form.reset) {
        form.reset();
        return true;
    }
    return false;
};

/**
 * Set form loading state (disable all form controls)
 * @param {string} formId - Form element ID
 * @param {boolean} loading - Loading state
 * @returns {boolean} True if form was found and updated
 */
export const setFormLoading = (formId, loading) => {
    const form = getElement(formId);
    if (!form) return false;

    const controls = form.querySelectorAll("input, button, select, textarea");
    controls.forEach(control => {
        control.disabled = loading;
    });

    return true;
};

/**
 * Get form data as object
 * @param {string} formId - Form element ID
 * @returns {Object|null} Form data object or null if form not found
 */
export const getFormData = (formId) => {
    const form = getElement(formId);
    if (!form) return null;

    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
};

/**
 * Set form data from object
 * @param {string} formId - Form element ID
 * @param {Object} data - Data object with field names as keys
 * @returns {boolean} True if form was found and updated
 */
export const setFormData = (formId, data) => {
    const form = getElement(formId);
    if (!form) return false;

    Object.entries(data).forEach(([name, value]) => {
        const field = form.querySelector(`[name="${name}"]`);
        if (field) {
            if (field.type === "checkbox" || field.type === "radio") {
                field.checked = value;
            } else {
                field.value = value;
            }
        }
    });

    return true;
};

/**
 * Message and Notification Utilities
 */

/**
 * Show error message in designated error container
 * @param {string} errorContainerId - Error container element ID
 * @param {string} message - Error message
 * @param {string} textElementId - Optional specific text element ID within container
 * @returns {boolean} True if container was found and updated
 */
export const showErrorMessage = (errorContainerId, message, textElementId = null) => {
    const container = getElement(errorContainerId);
    if (!container) return false;

    if (textElementId) {
        updateElementText(textElementId, message);
    } else {
        const textElement = container.querySelector("p");
        if (textElement) {
            textElement.textContent = message;
        } else {
            container.textContent = message;
        }
    }

    return showElement(errorContainerId);
};

/**
 * Show success message in designated success container
 * @param {string} successContainerId - Success container element ID
 * @param {string} message - Success message
 * @param {string} textElementId - Optional specific text element ID within container
 * @returns {boolean} True if container was found and updated
 */
export const showSuccessMessage = (successContainerId, message, textElementId = null) => {
    const container = getElement(successContainerId);
    if (!container) return false;

    if (textElementId) {
        updateElementText(textElementId, message);
    } else {
        const textElement = container.querySelector("p");
        if (textElement) {
            textElement.textContent = message;
        } else {
            container.textContent = message;
        }
    }

    return showElement(successContainerId);
};

/**
 * Hide error message container
 * @param {string} errorContainerId - Error container element ID
 * @returns {boolean} True if container was found and hidden
 */
export const hideErrorMessage = (errorContainerId) => {
    return hideElement(errorContainerId);
};

/**
 * Hide success message container
 * @param {string} successContainerId - Success container element ID
 * @returns {boolean} True if container was found and hidden
 */
export const hideSuccessMessage = (successContainerId) => {
    return hideElement(successContainerId);
};

/**
 * Advanced State Management Patterns
 */

/**
 * Complete state management for common loading/content/error/empty pattern
 * @param {Object} config - Configuration object
 * @param {string} config.loadingId - Loading element ID
 * @param {string} config.contentId - Content element ID
 * @param {string} config.errorId - Error element ID
 * @param {string} config.emptyId - Empty state element ID (optional)
 * @param {string} state - State to show ('loading', 'content', 'error', 'empty')
 * @param {string} message - Optional message for error/empty states
 * @returns {boolean} True if state was successfully set
 */
export const setUIState = (config, state, message = null) => {
    const { loadingId, contentId, errorId, emptyId } = config;

    // Hide all states first
    hideElement(loadingId);
    hideElement(contentId);
    hideElement(errorId);
    if (emptyId) hideElement(emptyId);

    // Show the requested state
    switch (state) {
        case "loading":
            return showElement(loadingId);
        
        case "content":
            return showElement(contentId);
        
        case "error":
            if (message) updateElementText(errorId, message);
            return showElement(errorId);
        
        case "empty":
            if (emptyId) {
                if (message) updateElementText(emptyId, message);
                return showElement(emptyId);
            }
            return false;
        
        default:
            console.warn(`Unknown UI state: ${state}`);
            return false;
    }
};

/**
 * Copy text to clipboard (modern approach)
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Promise that resolves to true if successful
 */
export const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand("copy");
                textArea.remove();
                return true;
            } catch {
                textArea.remove();
                return false;
            }
        }
    } catch {
        return false;
    }
};