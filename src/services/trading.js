// src/services/trading.js
import { getFirestoreDb } from './firebase'; // Import getFirestoreDb, not db
import { doc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';



const PORTFOLIOS_COLLECTION = 'portfolios';
const USERS_COLLECTION = 'users'; 

// Function to get a user's portfolio document reference (for their primary/default portfolio)
export function getUserPortfolioRef(userId) {
    // IMPORTANT FIX: Get the Firestore DB instance here, inside the function,
    // ensuring it's called AFTER Firebase has been initialized by initializeApp()
    const db = getFirestoreDb();
    return doc(db, PORTFOLIOS_COLLECTION, userId);
}

/**
 * Initializes a new portfolio for a user if one does not exist.
 * This is intended for the primary user portfolio (e.g., solo practice).
 * For multi-simulation, a different initialization for simulation-specific portfolios would be used.
 * @param {string} userId - The ID of the user.
 * @param {number} [initialBalance=10000] - The starting cash balance for the portfolio.
 * @returns {Promise<object>} The initialized or existing portfolio data.
 */
export async function initializePortfolio(userId, initialBalance = 10000) {
    const portfolioRef = getUserPortfolioRef(userId);
    const portfolioSnap = await getDoc(portfolioRef);

    if (!portfolioSnap.exists()) {
        const newPortfolio = {
            userId: userId,
            simulationId: null, // Null indicates this is a primary/solo portfolio, not part of a specific simulation
            cash: initialBalance,
            holdings: {}, // Ticker: { quantity, avgPrice }
            trades: [], // Array of trade objects
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await setDoc(portfolioRef, newPortfolio);
        console.log(`Initialized NEW portfolio for user ${userId} with balance $${initialBalance}`);
        return newPortfolio;
    } else {
        // CASE 2: Portfolio already EXISTS - ensure it has all required fields
        const currentPortfolioData = portfolioSnap.data();
        let needsUpdate = false;
        const updateData = {};

        // Ensure 'holdings' field exists and is an object
        if (currentPortfolioData.holdings === undefined || typeof currentPortfolioData.holdings !== 'object' || currentPortfolioData.holdings === null) {
            updateData.holdings = {};
            needsUpdate = true;
        }

        // Ensure 'trades' field exists and is an array
        if (currentPortfolioData.trades === undefined || !Array.isArray(currentPortfolioData.trades)) {
            updateData.trades = [];
            needsUpdate = true;
        }

        // Ensure 'cash' field exists. If not, set it to initial balance.
        if (currentPortfolioData.cash === undefined) {
            updateData.cash = initialBalance;
            needsUpdate = true;
        }

        // Always update the 'updatedAt' timestamp
        updateData.updatedAt = new Date();
        needsUpdate = true; // Mark for update if anything changed or just for timestamp

        if (needsUpdate) {
            await updateDoc(portfolioRef, updateData);
            console.log(`Updated EXISTING portfolio for user ${userId} to ensure correct structure.`);
            // Fetch the updated data to return the latest state
            const updatedSnap = await getDoc(portfolioRef);
            return updatedSnap.data();
        }

        console.log(`Portfolio already exists for user ${userId}. Current balance: $${currentPortfolioData.cash}`);
        return currentPortfolioData; // Return existing data if no update was needed
    }
}

/**
 * Retrieves a user's primary portfolio.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object|null>} The portfolio data or null if not found.
 */
export async function getPortfolio(userId) {
    const portfolioRef = getUserPortfolioRef(userId);
    const portfolioSnap = await getDoc(portfolioRef);
    if (portfolioSnap.exists()) {
        return portfolioSnap.data();
    }
    return null; // Portfolio not found
}

/**
 * Executes a buy or sell trade and updates the user's portfolio in Firestore.
 * Uses a transaction for atomicity and consistency.
 * @param {string} userId - The ID of the user.
 * @param {object} tradeDetails - Details of the trade (ticker, quantity, price, type: 'buy'|'sell').
 * @returns {Promise<{success: boolean, message: string}>} Result of the trade execution.
 */
export async function executeTrade(userId, tradeDetails) {
    const db = getFirestoreDb();
    const portfolioRef = getUserPortfolioRef(userId);

    // Validate trade details
    if (!tradeDetails.ticker || !tradeDetails.quantity || !tradeDetails.price || !tradeDetails.type) {
        throw new Error('Invalid trade details provided. Missing ticker, quantity, price, or type.');
    }
    if (typeof tradeDetails.quantity !== 'number' || tradeDetails.quantity <= 0) {
        throw new Error('Quantity must be a positive number.');
    }
    if (typeof tradeDetails.price !== 'number' || tradeDetails.price <= 0) {
        throw new Error('Price must be a positive number.');
    }
    if (!['buy', 'sell'].includes(tradeDetails.type)) {
        throw new Error('Trade type must be "buy" or "sell".');
    }

    const { ticker, quantity, price, type } = tradeDetails;
    const cost = quantity * price;

    try {
        await runTransaction(db, async (transaction) => {
            const portfolioDoc = await transaction.get(portfolioRef);

            if (!portfolioDoc.exists()) {
                // If a portfolio doesn't exist, we can optionally create it here,
                // or ensure it's initialized during user sign-up/login.
                // For now, let's throw an error to enforce explicit initialization.
                throw new Error('Portfolio not found. Please initialize your portfolio first.');
            }

            const currentPortfolio = portfolioDoc.data();
            let newCash = currentPortfolio.cash;
            const currentHoldings = { ...currentPortfolio.holdings }; // Create a mutable copy

            if (type === 'buy') {
                if (newCash < cost) {
                    throw new Error('Insufficient cash to execute this buy trade.');
                }
                newCash -= cost;

                if (currentHoldings[ticker]) {
                    // Update existing holding (average down/up)
                    const existingHolding = currentHoldings[ticker];
                    const totalQuantity = existingHolding.quantity + quantity;
                    const totalCost = (existingHolding.quantity * existingHolding.avgPrice) + cost;
                    currentHoldings[ticker] = {
                        quantity: totalQuantity,
                        avgPrice: totalCost / totalQuantity
                    };
                } else {
                    // Add new holding
                    currentHoldings[ticker] = {
                        quantity: quantity,
                        avgPrice: price
                    };
                }
            } else if (type === 'sell') {
                if (!currentHoldings[ticker] || currentHoldings[ticker].quantity < quantity) {
                    throw new Error('Insufficient shares of ' + ticker.toUpperCase() + ' to execute this sell trade.');
                }
                newCash += cost; // Cash received from sale
                currentHoldings[ticker].quantity -= quantity;
                if (currentHoldings[ticker].quantity === 0) {
                    delete currentHoldings[ticker]; // Remove holding if quantity is zero
                }
            } else {
                // This case should ideally be caught by initial validation
                throw new Error('Invalid trade type. Must be "buy" or "sell".');
            }

            // Record the trade
            const tradeRecord = {
                ticker: ticker,
                quantity: quantity,
                price: price,
                type: type,
                timestamp: new Date().toISOString(), // ISO string for better date handling
                userId: userId,
                portfolioValueAtTrade: newCash + calculateHoldingsValue(currentHoldings, price), // Placeholder - actual calculation needs current prices for all holdings
                tradeCost: cost // Store the cost/revenue of this specific trade
            };

            // Ensure the trades array exists before pushing
            const updatedTrades = Array.isArray(currentPortfolio.trades) ? [...currentPortfolio.trades] : [];
            updatedTrades.push(tradeRecord);

            // Update the portfolio document
            transaction.update(portfolioRef, {
                cash: newCash,
                holdings: currentHoldings,
                trades: updatedTrades,
                updatedAt: new Date() // Update timestamp for the portfolio document itself
            });
        });
        console.log(`Trade executed successfully for user ${userId}: ${type} ${quantity} ${ticker} at $${price.toFixed(2)}`);
        return { success: true, message: 'Trade executed successfully.' };
    } catch (error) {
        console.error('Error executing trade:', error.message);
        throw error; // Re-throw to be handled by the calling function/UI
    }
}

// Helper function to calculate current value of holdings (simplified, needs real-time prices for accuracy)
function calculateHoldingsValue(holdings, currentPriceOfTradedStock) {
    let totalValue = 0;
    // This is a simplified calculation. For true portfolio value, you'd need current prices for *all* holdings.
    // For now, we'll just factor in the stock being traded for a rough estimate.
    // In Session 4, with live prices, this will be properly implemented.
    for (const ticker in holdings) {
        if (holdings.hasOwnProperty(ticker)) {
            const holding = holdings[ticker];
            if (ticker === currentPriceOfTradedStock.ticker) { // Crude check
                 totalValue += holding.quantity * currentPriceOfTradedStock.price;
            } else {
                totalValue += holding.quantity * holding.avgPrice; // Fallback to avgPrice if not the traded stock
            }
        }
    }
    return totalValue;
}


/**
 * Fetches a user's recent trades from their primary portfolio.
 * @param {string} userId - The ID of the user.
 * @param {number} [limit=10] - The maximum number of trades to return.
 * @returns {Promise<Array<object>>} An array of trade objects.
 */
export async function getRecentTrades(userId, limit = 10) {
    const portfolioRef = getUserPortfolioRef(userId);
    const portfolioSnap = await getDoc(portfolioRef);
    if (portfolioSnap.exists()) {
        const trades = portfolioSnap.data().trades || [];
        // Sort by timestamp (assuming ISO string can be compared or convert to Date objects)
        return trades
            .map(trade => ({ ...trade, timestamp: new Date(trade.timestamp) })) // Convert timestamp string back to Date for sorting
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Most recent first
            .slice(0, limit);
    }
    return [];
}

// Optionally, add a function to update initial balance for a user's portfolio
// This could be used by an admin or for specific simulation settings later
export async function updatePortfolioInitialBalance(userId, newBalance) {
    const portfolioRef = getUserPortfolioRef(userId);
    try {
        await updateDoc(portfolioRef, {
            cash: newBalance,
            updatedAt: new Date()
        });
        console.log(`Portfolio initial balance updated for user ${userId} to $${newBalance}`);
        return { success: true, message: 'Initial balance updated.' };
    } catch (error) {
        console.error('Error updating initial balance:', error);
        throw error;
    }
}