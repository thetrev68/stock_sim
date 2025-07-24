// // src/utils/logger.js
// // Production-ready logging system

// /**
//  * Detect environment type
//  */
// const isProduction = () => {
//     return window.location.hostname !== "localhost" && 
//            window.location.hostname !== "127.0.0.1" &&
//            !window.location.hostname.includes("localhost") &&
//            window.location.protocol === "https:";
// };

// /**
//  * Log levels for different types of messages
//  */
// export const LOG_LEVELS = {
//     ERROR: 0,   // Always shown
//     WARN: 1,    // Always shown  
//     INFO: 2,    // Hidden in production
//     DEBUG: 3    // Hidden in production
// };

// /**
//  * Production Logger Class
//  */
// class ProductionLogger {
//     constructor() {
//         this.isProd = isProduction();
//         this.maxLevel = this.isProd ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
        
//         // In production, we still want to track errors for debugging
//         this.errorBuffer = [];
//         this.maxErrorBuffer = 50; // Keep last 50 errors
        
//         if (this.isProd) {
//             console.log("🚀 Production mode detected - logging reduced");
//         } else {
//             console.log("🛠️ Development mode detected - full logging enabled");
//         }
//     }

//     /**
//      * Error logging - Always shown and tracked
//      */
//     error(message, ...args) {
//         console.error(message, ...args);
        
//         // Track errors in production for debugging
//         if (this.isProd) {
//             this.errorBuffer.push({
//                 timestamp: new Date().toISOString(),
//                 message: typeof message === "string" ? message : JSON.stringify(message),
//                 args: args.map(arg => typeof arg === "object" ? JSON.stringify(arg) : String(arg))
//             });
            
//             // Keep buffer size manageable
//             if (this.errorBuffer.length > this.maxErrorBuffer) {
//                 this.errorBuffer.shift();
//             }
//         }
//     }

//     /**
//      * Warning logging - Always shown
//      */
//     warn(message, ...args) {
//         console.warn(message, ...args);
//     }

//     /**
//      * Info logging - Hidden in production
//      */
//     info(message, ...args) {
//         if (this.maxLevel >= LOG_LEVELS.INFO) {
//             console.log(message, ...args);
//         }
//     }

//     /**
//      * Debug logging - Hidden in production  
//      */
//     debug(message, ...args) {
//         if (this.maxLevel >= LOG_LEVELS.DEBUG) {
//             console.log("🐛", message, ...args);
//         }
//     }

//     /**
//      * Group logging for related messages
//      */
//     group(title, collapsed = false) {
//         if (this.maxLevel >= LOG_LEVELS.INFO) {
//             if (collapsed) {
//                 console.groupCollapsed(title);
//             } else {
//                 console.group(title);
//             }
//         }
//     }

//     /**
//      * End logging group
//      */
//     groupEnd() {
//         if (this.maxLevel >= LOG_LEVELS.INFO) {
//             console.groupEnd();
//         }
//     }

//     /**
//      * Performance timing
//      */
//     time(label) {
//         if (this.maxLevel >= LOG_LEVELS.DEBUG) {
//             console.time(label);
//         }
//     }

//     timeEnd(label) {
//         if (this.maxLevel >= LOG_LEVELS.DEBUG) {
//             console.timeEnd(label);
//         }
//     }

//     /**
//      * Get error buffer for debugging (production only)
//      */
//     getErrorHistory() {
//         return this.errorBuffer;
//     }

//     /**
//      * Clear error buffer
//      */
//     clearErrorHistory() {
//         this.errorBuffer = [];
//         this.info("Error history cleared");
//     }

//     /**
//      * Special method for API calls - always log in production for monitoring
//      */
//     api(method, endpoint, data = null) {
//         const message = `API ${method.toUpperCase()}: ${endpoint}`;
//         if (this.isProd) {
//             // In production, always log API calls but concisely
//             console.log(`🌐 ${message}`);
//         } else {
//             // In development, log with full details
//             this.group(`🌐 ${message}`, true);
//             if (data) {
//                 console.log("Data:", data);
//             }
//             console.log("Timestamp:", new Date().toISOString());
//             this.groupEnd();
//         }
//     }

//     /**
//      * Firebase operation logging
//      */
//     firebase(operation, collection, documentId = null) {
//         const message = `Firebase ${operation}: ${collection}${documentId ? `/${documentId}` : ""}`;
//         if (this.isProd) {
//             // Only log errors in production
//             return;
//         } else {
//             this.debug(`🔥 ${message}`);
//         }
//     }

//     /**
//      * Trading operation logging - important to track
//      */
//     trade(action, ticker, quantity, price) {
//         const message = `Trade ${action}: ${quantity} ${ticker} @ $${price}`;
//         // Always log trades (but concisely in production)
//         if (this.isProd) {
//             console.log(`💰 ${message}`);
//         } else {
//             this.info(`💰 ${message}`);
//         }
//     }

//     /**
//      * User action logging
//      */
//     userAction(action, details = null) {
//         if (this.isProd) {
//             // Only log significant user actions in production
//             const significantActions = ["login", "signup", "trade", "join_simulation", "create_simulation"];
//             if (significantActions.includes(action)) {
//                 console.log(`👤 User: ${action}`);
//             }
//         } else {
//             this.info(`👤 User: ${action}`, details);
//         }
//     }
// }

// // Create singleton logger instance
// const logger = new ProductionLogger();

// // Export the logger
// export { logger };

// // Backward compatibility - map old console.log calls
// export const log = {
//     error: (...args) => console.error(...args),
//     warn: (...args) => console.warn(...args),
//     info: (...args) => console.log(...args),
//     debug: (...args) => console.log(...args),
//     api: (...args) => logger.api(...args),
//     firebase: (...args) => logger.firebase(...args),
//     trade: (...args) => logger.trade(...args),
//     userAction: (...args) => logger.userAction(...args)
// };

// // Make logger available globally for debugging in production
// if (typeof window !== "undefined") {
//     window.debugLogger = {
//         getErrors: () => logger.getErrorHistory(),
//         clearErrors: () => logger.clearErrorHistory(),
//         setLevel: (level) => { logger.maxLevel = level; },
//         logger: logger
//     };
// }