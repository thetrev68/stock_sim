// src/services/trading.js - Enhanced for Session 8 with Activity Logging
import { getFirestoreDb } from './firebase';
import { doc, getDoc, setDoc, updateDoc, runTransaction, collection, query, where, getDocs } from 'firebase/firestore';
import { TRADE_TYPES } from '../constants/trade-types.js';

const PORTFOLIOS_COLLECTION = 'portfolios';
const SIMULATIONS_COLLECTION = 'simulations';

/**
 * Get portfolio document reference for user's portfolio
 * @param {string} userId - The user ID
 * @param {string|null} simulationId - Simulation ID (null for solo portfolio)
 * @returns {DocumentReference} Firestore document reference
 */
export function getPortfolioRef(userId, simulationId = null) {
    const db = getFirestoreDb();
    
    if (simulationId) {
        // For simulation portfolios, use composite ID: userId_simulationId
        const portfolioId = `${userId}_${simulationId}`;
        return doc(db, PORTFOLIOS_COLLECTION, portfolioId);
    } else {
        // For solo portfolios, use just userId (backwards compatibility)
        return doc(db, PORTFOLIOS_COLLECTION, userId);
    }
}

/**
 * Get user's solo portfolio reference (backwards compatibility)
 * @param {string} userId - The user ID
 * @returns {DocumentReference} Firestore document reference
 */
export function getUserPortfolioRef(userId) {
    return getPortfolioRef(userId, null);
}

/**
 * Initialize portfolio for user (solo or simulation)
 * @param {string} userId - The user ID
 * @param {number} initialBalance - Starting cash balance
 * @param {string|null} simulationId - Simulation ID (null for solo)
 * @param {object} simulationInfo - Simulation details for context
 * @returns {Promise<object>} The initialized or existing portfolio data
 */
export async function initializePortfolio(userId, initialBalance = 10000, simulationId = null, simulationInfo = null) {
    const portfolioRef = getPortfolioRef(userId, simulationId);
    const portfolioSnap = await getDoc(portfolioRef);

    if (!portfolioSnap.exists()) {
        const newPortfolio = {
            userId: userId,
            simulationId: simulationId,
            cash: initialBalance,
            holdings: {},
            trades: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            // Additional fields for simulation portfolios
            ...(simulationId && simulationInfo && {
                simulationName: simulationInfo.name,
                startingBalance: initialBalance,
                currentRank: null,
                lastRankUpdate: null
            })
        };

        await setDoc(portfolioRef, newPortfolio);
        console.log(`Initialized NEW portfolio for user ${userId}${simulationId ? ` in simulation ${simulationId}` : ' (solo)'} with balance $${initialBalance}`);
        
        // Log join activity for simulation portfolios
        if (simulationId && simulationInfo) {
            try {
                const { ActivityService } = await import('./activity.js');
                const activityService = new ActivityService();
                activityService.initialize();
                
                // Get user display name (you might want to pass this as a parameter)
                const userDisplayName = simulationInfo.userDisplayName || 'Anonymous User';
                await activityService.logJoinActivity(simulationId, userId, userDisplayName);
            } catch (error) {
                console.error('Error logging join activity:', error);
            }
        }
        
        return newPortfolio;
    } else {
        // Portfolio exists - ensure it has all required fields
        const currentPortfolioData = portfolioSnap.data();
        let needsUpdate = false;
        const updateData = {};

        // Ensure basic fields exist
        if (!currentPortfolioData.holdings || typeof currentPortfolioData.holdings !== 'object') {
            updateData.holdings = {};
            needsUpdate = true;
        }
        if (!Array.isArray(currentPortfolioData.trades)) {
            updateData.trades = [];
            needsUpdate = true;
        }
        if (currentPortfolioData.cash === undefined) {
            updateData.cash = initialBalance;
            needsUpdate = true;
        }

        // Update timestamp
        updateData.updatedAt = new Date();
        needsUpdate = true;

        if (needsUpdate) {
            await updateDoc(portfolioRef, updateData);
            console.log(`Updated EXISTING portfolio for user ${userId}${simulationId ? ` in simulation ${simulationId}` : ' (solo)'}`);
            const updatedSnap = await getDoc(portfolioRef);
            return updatedSnap.data();
        }

        return currentPortfolioData;
    }
}

/**
 * Get user's portfolio (solo or simulation)
 * @param {string} userId - The user ID
 * @param {string|null} simulationId - Simulation ID (null for solo)
 * @returns {Promise<object|null>} The portfolio data or null if not found
 */
export async function getPortfolio(userId, simulationId = null) {
    const portfolioRef = getPortfolioRef(userId, simulationId);
    const portfolioSnap = await getDoc(portfolioRef);
    
    if (portfolioSnap.exists()) {
        return portfolioSnap.data();
    }
    return null;
}

/**
 * Get all portfolios for a user (solo + all simulations)
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of portfolio objects with metadata
 */
export async function getUserPortfolios(userId) {
    const db = getFirestoreDb();
    
    try {
        // Query all portfolios for this user
        const portfoliosQuery = query(
            collection(db, PORTFOLIOS_COLLECTION),
            where('userId', '==', userId)
        );
        const portfolioSnaps = await getDocs(portfoliosQuery);
        
        const portfolios = [];
        
        portfolioSnaps.forEach(docSnap => {
            const portfolio = docSnap.data();
            portfolios.push({
                ...portfolio,
                id: docSnap.id,
                type: portfolio.simulationId ? 'simulation' : 'solo'
            });
        });
        
        // Sort: solo first, then simulations by creation date
        portfolios.sort((a, b) => {
            if (a.type === 'solo' && b.type !== 'solo') return -1;
            if (a.type !== 'solo' && b.type === 'solo') return 1;
            
            const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
            const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
            return bTime.getTime() - aTime.getTime();
        });
        
        return portfolios;
        
    } catch (error) {
        console.error('Error getting user portfolios:', error);
        throw error;
    }
}

/**
 * Validate trade against simulation rules
 * @param {object} tradeDetails - Trade details
 * @param {object} simulation - Simulation data
 * @param {object} portfolio - Current portfolio
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateSimulationTrade(tradeDetails, simulation, portfolio) {
    try {
        // Check simulation status - allow trading in pending simulations for testing
        if (simulation.status === 'ended') {
            return { valid: false, error: 'Simulation has ended' };
        }
        
        // Check simulation dates
        const now = new Date();
        const startDate = simulation.startDate.toDate ? simulation.startDate.toDate() : new Date(simulation.startDate);
        const endDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
        
        if (now > endDate) {
            return { valid: false, error: 'Simulation has ended' };
        }
        
        // Allow trading even if simulation hasn't officially started (for testing)
        // Original check: if (now < startDate) { return { valid: false, error: 'Simulation has not started yet' }; }
        
        // Check trading hours (if restricted to market hours)
        if (simulation.rules?.tradingHours === 'market') {
            const currentHour = now.getUTCHours(); // Use UTC for simplicity
            const currentDay = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
            
            // Basic market hours check: Monday-Friday, 9:30 AM - 4:00 PM ET (approx 14:30-21:00 UTC)
            if (currentDay === 0 || currentDay === 6) {
                return { valid: false, error: 'Trading is only allowed during market hours (Monday-Friday)' };
            }
            
            if (currentHour < 14 || currentHour >= 21) {
                return { valid: false, error: 'Trading is only allowed during market hours (9:30 AM - 4:00 PM ET)' };
            }
        }
        
        // Check short selling rules
        if (tradeDetails.type === TRADE_TYPES.SELL && simulation.rules?.allowShortSelling === false) {
            const currentHolding = portfolio.holdings?.[tradeDetails.ticker.toUpperCase()];
            if (!currentHolding || currentHolding.quantity < tradeDetails.quantity) {
                return { valid: false, error: `Insufficient shares to sell. You own ${currentHolding?.quantity || 0} shares of ${tradeDetails.ticker.toUpperCase()}, but tried to sell ${tradeDetails.quantity}` };
            }
        }
        
        // All validations passed
        return { valid: true };
        
    } catch (error) {
        console.error('Error validating simulation trade:', error);
        return { valid: false, error: 'Error validating trade. Please try again.' };
    }
}

/**
 * Execute trade in portfolio (solo or simulation)
 * @param {string} userId - The user ID
 * @param {object} tradeDetails - Trade details (ticker, quantity, price, type)
 * @param {string|null} simulationId - Simulation ID (null for solo)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function executeTrade(userId, tradeDetails, simulationId = null) {
    const db = getFirestoreDb();
    const portfolioRef = getPortfolioRef(userId, simulationId);

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
    if (!Object.values(TRADE_TYPES).includes(tradeDetails.type)) {
        throw new Error(`Trade type must be "${TRADE_TYPES.BUY}" or "${TRADE_TYPES.SELL}".`);
    }

    const { ticker, quantity, price, type } = tradeDetails;
    const cost = quantity * price;

    try {
        // If this is a simulation trade, validate against simulation rules
        if (simulationId) {
            const simulationRef = doc(db, SIMULATIONS_COLLECTION, simulationId);
            const simulationSnap = await getDoc(simulationRef);
            
            if (!simulationSnap.exists()) {
                throw new Error('Simulation not found.');
            }
            
            const simulation = simulationSnap.data();
            const portfolio = await getPortfolio(userId, simulationId);
            
            if (!portfolio) {
                throw new Error('Simulation portfolio not found. Please initialize your portfolio first.');
            }
            
            const validation = await validateSimulationTrade(tradeDetails, simulation, portfolio);
            if (!validation.valid) {
                throw new Error(validation.error);
            }
        }

        let updatedPortfolio = null;

        await runTransaction(db, async (transaction) => {
            const portfolioDoc = await transaction.get(portfolioRef);

            if (!portfolioDoc.exists()) {
                throw new Error('Portfolio not found. Please initialize your portfolio first.');
            }

            const currentPortfolio = portfolioDoc.data();
            let newCash = currentPortfolio.cash;
            const currentHoldings = { ...currentPortfolio.holdings };

            if (type === TRADE_TYPES.BUY) {
                if (newCash < cost) {
                    throw new Error('Insufficient cash to execute this buy trade.');
                }
                newCash -= cost;

                if (currentHoldings[ticker]) {
                    // Update existing holding
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
            } else if (type === TRADE_TYPES.SELL) {
                if (!currentHoldings[ticker] || currentHoldings[ticker].quantity < quantity) {
                    throw new Error(`Insufficient shares of ${ticker.toUpperCase()} to execute this sell trade.`);
                }
                newCash += cost;
                currentHoldings[ticker].quantity -= quantity;
                if (currentHoldings[ticker].quantity === 0) {
                    delete currentHoldings[ticker];
                }
            }

            // Record the trade
            const tradeRecord = {
                ticker: ticker,
                quantity: quantity,
                price: price,
                type: type,
                timestamp: new Date().toISOString(),
                userId: userId,
                simulationId: simulationId,
                tradeCost: cost
            };

            const updatedTrades = Array.isArray(currentPortfolio.trades) ? [...currentPortfolio.trades] : [];
            updatedTrades.push(tradeRecord);

            // Update the portfolio document
            const portfolioUpdate = {
                cash: newCash,
                holdings: currentHoldings,
                trades: updatedTrades,
                updatedAt: new Date()
            };

            transaction.update(portfolioRef, portfolioUpdate);

            // Store updated portfolio for activity logging
            updatedPortfolio = {
                ...currentPortfolio,
                ...portfolioUpdate
            };
        });

        // Log activity for simulation trades
        if (simulationId && updatedPortfolio) {
            try {
                const { ActivityService } = await import('./activity.js');
                const activityService = new ActivityService();
                activityService.initialize();

                // Get user display name from auth or portfolio
                const userDisplayName = updatedPortfolio.userDisplayName || 'Anonymous User';

                // Log the trade activity
                await activityService.logTradeActivity(simulationId, userId, userDisplayName, tradeDetails);

                // Check for achievements
                await activityService.detectAndLogAchievements(simulationId, userId, userDisplayName, tradeDetails, updatedPortfolio);

            } catch (error) {
                console.error('Error logging trade activity:', error);
                // Don't fail the trade if activity logging fails
            }
        }

        const contextMsg = simulationId ? `in simulation ${simulationId}` : 'in solo mode';
        console.log(`Trade executed successfully for user ${userId} ${contextMsg}: ${type} ${quantity} ${ticker} at $${price.toFixed(2)}`);
        return { success: true, message: 'Trade executed successfully.' };

    } catch (error) {
        console.error('Error executing trade:', error.message);
        throw error;
    }
}

/**
 * Get recent trades from portfolio
 * @param {string} userId - The user ID
 * @param {number} limit - Maximum number of trades to return
 * @param {string|null} simulationId - Simulation ID (null for solo)
 * @returns {Promise<Array<object>>} Array of trade objects
 */
export async function getRecentTrades(userId, limit = 10, simulationId = null) {
    const portfolioRef = getPortfolioRef(userId, simulationId);
    const portfolioSnap = await getDoc(portfolioRef);
    
    if (portfolioSnap.exists()) {
        const trades = portfolioSnap.data().trades || [];
        return trades
            .map(trade => ({ ...trade, timestamp: new Date(trade.timestamp) }))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }
    return [];
}

/**
 * Update portfolio initial balance
 * @param {string} userId - The user ID
 * @param {number} newBalance - New balance amount
 * @param {string|null} simulationId - Simulation ID (null for solo)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function updatePortfolioInitialBalance(userId, newBalance, simulationId = null) {
    const portfolioRef = getPortfolioRef(userId, simulationId);
    
    try {
        await updateDoc(portfolioRef, {
            cash: newBalance,
            startingBalance: newBalance,
            updatedAt: new Date()
        });
        
        const contextMsg = simulationId ? `in simulation ${simulationId}` : 'for solo portfolio';
        console.log(`Portfolio initial balance updated for user ${userId} ${contextMsg} to $${newBalance}`);
        return { success: true, message: 'Initial balance updated.' };
    } catch (error) {
        console.error('Error updating initial balance:', error);
        throw error;
    }
}