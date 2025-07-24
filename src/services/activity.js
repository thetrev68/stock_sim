// src/services/activity.js
import { getFirestoreDb } from "./firebase.js";
import { 
    collection,
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp 
} from "firebase/firestore";
import { getTimeAgoCompact } from "../utils/date-utils.js";



const ACTIVITIES_COLLECTION = "simulationActivities";

/**
 * Activity Data Model:
 * {
 *   id: "auto-generated",
 *   simulationId: "sim123",
 *   userId: "user123",
 *   userDisplayName: "John Doe",
 *   type: "join" | "trade" | "achievement" | "leave",
 *   action: "joined_simulation" | "executed_trade" | "reached_milestone" | "left_simulation",
 *   data: {
 *     // Type-specific data
 *     ticker?: "AAPL",
 *     tradeType?: "buy" | "sell",
 *     quantity?: 100,
 *     price?: 150.00,
 *     amount?: 15000,
 *     milestone?: "first_trade" | "profitable_day" | "big_winner",
 *     rank?: 1
 *   },
 *   timestamp: timestamp,
 *   isVisible: true // For filtering/moderation
 * }
 */

export class ActivityService {
    constructor() {
        this.db = null;
    }

    // Initialize service
    initialize() {
        this.db = getFirestoreDb();
        console.log("ActivityService initialized");
    }

    /**
     * Log user joining simulation
     */
    async logJoinActivity(simulationId, userId, userDisplayName) {
        this.db = this.db || getFirestoreDb();
        
        try {
            const activity = {
                simulationId,
                userId,
                userDisplayName,
                type: "join",
                action: "joined_simulation",
                data: {},
                timestamp: serverTimestamp(),
                isVisible: true
            };

            await addDoc(collection(this.db, ACTIVITIES_COLLECTION), activity);
            console.log(`Logged join activity for user ${userId} in simulation ${simulationId}`);
            
        } catch (error) {
            console.error("Error logging join activity:", error);
        }
    }

    /**
     * Log trading activity
     */
    async logTradeActivity(simulationId, userId, userDisplayName, tradeData) {
        this.db = this.db || getFirestoreDb();
        
        try {
            const activity = {
                simulationId,
                userId,
                userDisplayName,
                type: "trade",
                action: "executed_trade",
                data: {
                    ticker: tradeData.ticker.toUpperCase(), // FIX: Convert ticker to uppercase
                    tradeType: tradeData.type,
                    quantity: tradeData.quantity,
                    price: tradeData.price,
                    amount: tradeData.quantity * tradeData.price
                },
                timestamp: serverTimestamp(),
                isVisible: true
            };

            await addDoc(collection(this.db, ACTIVITIES_COLLECTION), activity);
            console.log(`Logged trade activity for user ${userId}: ${tradeData.type} ${tradeData.quantity} ${tradeData.ticker.toUpperCase()}`);
            
        } catch (error) {
            console.error("Error logging trade activity:", error);
        }
    }

    /**
     * Log achievement/milestone activity
     */
    async logAchievementActivity(simulationId, userId, userDisplayName, achievementData) {
        this.db = this.db || getFirestoreDb();
        
        try {
            // Build data object, excluding undefined values
            const data = {
                milestone: achievementData.milestone,
                value: achievementData.value
            };

            // Only add rank if it's defined
            if (achievementData.rank !== undefined && achievementData.rank !== null) {
                data.rank = achievementData.rank;
            }

            // Add any other optional fields that might exist
            if (achievementData.reason !== undefined) {
                data.reason = achievementData.reason;
            }
            if (achievementData.endedByRole !== undefined) {
                data.endedByRole = achievementData.endedByRole;
            }

            const activity = {
                simulationId,
                userId,
                userDisplayName,
                type: "achievement",
                action: "reached_milestone",
                data,
                timestamp: serverTimestamp(),
                isVisible: true
            };

            await addDoc(collection(this.db, ACTIVITIES_COLLECTION), activity);
            console.log(`Logged achievement activity for user ${userId}: ${achievementData.milestone}`);
            
        } catch (error) {
            console.error("Error logging achievement activity:", error);
        }
    }

    /**
     * Log admin actions (simulation ended, member removed, etc.)
     */
    async logAdminActivity(simulationId, adminUserId, adminDisplayName, actionData) {
        this.db = this.db || getFirestoreDb();
        
        try {
            const activity = {
                simulationId,
                userId: adminUserId,
                userDisplayName: adminDisplayName,
                type: "admin",
                action: actionData.action || "admin_action",
                data: {
                    ...actionData,
                    isAdminAction: true
                },
                timestamp: serverTimestamp(),
                isVisible: true
            };

            await addDoc(collection(this.db, ACTIVITIES_COLLECTION), activity);
            console.log(`Logged admin activity for user ${adminUserId}: ${actionData.action}`);
            
        } catch (error) {
            console.error("Error logging admin activity:", error);
        }
    }

    /**
     * Get recent activities for a simulation
     */
    async getSimulationActivities(simulationId, maxActivities = 20) {
        this.db = this.db || getFirestoreDb();

        try {
            const activitiesQuery = query(
                collection(this.db, ACTIVITIES_COLLECTION),
                where("simulationId", "==", simulationId),
                where("isVisible", "==", true),
                orderBy("timestamp", "desc"),
                limit(maxActivities)
            );

            const activityDocs = await getDocs(activitiesQuery);
            
            return activityDocs.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error("Error getting simulation activities:", error);
            return [];
        }
    }

    /**
     * Get recent activities for a specific user in a simulation
     */
    async getUserActivities(simulationId, userId, maxActivities = 10) {
        this.db = this.db || getFirestoreDb();

        try {
            const activitiesQuery = query(
                collection(this.db, ACTIVITIES_COLLECTION),
                where("simulationId", "==", simulationId),
                where("userId", "==", userId),
                where("isVisible", "==", true),
                orderBy("timestamp", "desc"),
                limit(maxActivities)
            );

            const activityDocs = await getDocs(activitiesQuery);
            
            return activityDocs.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        } catch (error) {
            console.error("Error getting user activities:", error);
            return [];
        }
    }

    /**
     * Format activity for display
     */
    formatActivity(activity) {
        const timestamp = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
        const timeAgo = getTimeAgoCompact(timestamp);

        switch (activity.action) {
            case "joined_simulation": {
                return {
                    icon: "👋",
                    iconColor: "text-green-400",
                    iconBg: "bg-green-400/10",
                    title: `${activity.userDisplayName} joined the simulation`,
                    description: "Welcome to the competition!",
                    timeAgo,
                    priority: "low"
                };
            }

            case "executed_trade": {
                const { ticker, tradeType, quantity, amount } = activity.data;
                const tradeIcon = tradeType === "buy" ? "📈" : "📉";
                const tradeColor = tradeType === "buy" ? "text-green-400" : "text-red-400";
                const tradeBg = tradeType === "buy" ? "bg-green-400/10" : "bg-red-400/10";
                
                return {
                    icon: tradeIcon,
                    iconColor: tradeColor,
                    iconBg: tradeBg,
                    title: `${activity.userDisplayName} ${tradeType === "buy" ? "bought" : "sold"} ${ticker}`,
                    description: `${quantity.toLocaleString()} shares for $${amount.toLocaleString()}`,
                    timeAgo,
                    priority: "medium"
                };
            }

            case "reached_milestone": {
                const { milestone, value, rank } = activity.data;
                let milestoneText = "";
                let milestoneIcon = "🏆";
                
                switch (milestone) {
                    case "first_trade":
                        milestoneText = "made their first trade";
                        milestoneIcon = "🎯";
                        break;
                    case "profitable_day":
                        milestoneText = "had a profitable day";
                        milestoneIcon = "💰";
                        break;
                    case "big_winner":
                        milestoneText = `earned $${value.toLocaleString()} in a single trade`;
                        milestoneIcon = "🚀";
                        break;
                    case "rank_change":
                        milestoneText = `moved to rank #${rank}`;
                        milestoneIcon = "📊";
                        break;
                    default:
                        milestoneText = "achieved a milestone";
                }
            
                return {
                    icon: milestoneIcon,
                    iconColor: "text-yellow-400",
                    iconBg: "bg-yellow-400/10",
                    title: `${activity.userDisplayName} ${milestoneText}`,
                    description: "Great progress!",
                    timeAgo,
                    priority: "high"
                };
            }

            case "admin_action":
            case "simulation_ended_early": {
                let adminText = "";
                let adminIcon = "⚙️";
                
                if (activity.action === "simulation_ended_early" || activity.data?.milestone === "simulation_ended_early") {
                    adminText = `${activity.userDisplayName} ended the simulation early`;
                    adminIcon = "🏁";
                    const reason = activity.data?.reason;
                    return {
                        icon: adminIcon,
                        iconColor: "text-orange-400",
                        iconBg: "bg-orange-400/10",
                        title: adminText,
                        description: reason ? `Reason: ${reason}` : "Simulation ended by admin",
                        timeAgo,
                        priority: "high"
                    };
                } else {
                    adminText = `${activity.userDisplayName} performed an admin action`;
                    return {
                        icon: adminIcon,
                        iconColor: "text-purple-400",
                        iconBg: "bg-purple-400/10",
                        title: adminText,
                        description: activity.data?.description || "Admin action performed",
                        timeAgo,
                        priority: "high"
                    };
                }
            }

            default: {
                return {
                    icon: "📱",
                    iconColor: "text-gray-400",
                    iconBg: "bg-gray-400/10",
                    title: `${activity.userDisplayName} did something`,
                    description: "Activity recorded",
                    timeAgo,
                    priority: "low"
                };
            }
        }
    }

    /**
     * Generate summary statistics from activities
     */
    generateActivitySummary(activities) {
        const summary = {
            totalActivities: activities.length,
            recentJoins: 0,
            recentTrades: 0,
            recentAchievements: 0,
            mostActiveUser: null,
            biggestTrade: null,
            latestActivity: null
        };

        if (activities.length === 0) return summary;

        // Count activity types from last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentActivities = activities.filter(activity => {
            const activityTime = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
            return activityTime > oneDayAgo;
        });

        recentActivities.forEach(activity => {
            switch (activity.action) {
                case "joined_simulation":
                    summary.recentJoins++;
                    break;
                case "executed_trade":
                    summary.recentTrades++;
                    break;
                case "reached_milestone":
                    summary.recentAchievements++;
                    break;
            }
        });

        // Find most active user (most activities in last 24h)
        const userActivityCount = {};
        recentActivities.forEach(activity => {
            userActivityCount[activity.userId] = (userActivityCount[activity.userId] || 0) + 1;
        });
        
        const mostActiveUserId = Object.keys(userActivityCount).reduce((a, b) => 
            userActivityCount[a] > userActivityCount[b] ? a : b, null
        );
        
        if (mostActiveUserId) {
            const mostActiveActivity = recentActivities.find(a => a.userId === mostActiveUserId);
            summary.mostActiveUser = {
                userId: mostActiveUserId,
                displayName: mostActiveActivity?.userDisplayName,
                activityCount: userActivityCount[mostActiveUserId]
            };
        }

        // Find biggest trade
        const tradeActivities = activities.filter(a => a.action === "executed_trade");
        if (tradeActivities.length > 0) {
            summary.biggestTrade = tradeActivities.reduce((biggest, current) => 
                (current.data.amount > biggest.data.amount) ? current : biggest
            );
        }

        // Latest activity
        summary.latestActivity = activities[0]; // Already sorted by timestamp desc

        return summary;
    }

    /**
     * Auto-detect and log achievements based on trade data
     */
    async detectAndLogAchievements(simulationId, userId, userDisplayName, tradeData, portfolioData) {
        try {
            // Check for first trade
            if (portfolioData.trades && portfolioData.trades.length === 1) {
                await this.logAchievementActivity(simulationId, userId, userDisplayName, {
                    milestone: "first_trade",
                    value: tradeData.quantity * tradeData.price
                });
            }

            // Check for big trade (over $10k)
            const tradeValue = tradeData.quantity * tradeData.price;
            if (tradeValue >= 10000) {
                await this.logAchievementActivity(simulationId, userId, userDisplayName, {
                    milestone: "big_winner",
                    value: tradeValue
                });
            }

            // Check for profitable day (portfolio value > starting balance)
            const currentValue = portfolioData.cash + this.calculateHoldingsValue(portfolioData.holdings);
            const startingBalance = portfolioData.startingBalance || 10000;
            
            if (currentValue > startingBalance * 1.05) { // 5% profit threshold
                await this.logAchievementActivity(simulationId, userId, userDisplayName, {
                    milestone: "profitable_day",
                    value: currentValue - startingBalance
                });
            }

        } catch (error) {
            console.error("Error detecting achievements:", error);
        }
    }

    /**
     * Calculate total holdings value (simplified)
     */
    calculateHoldingsValue(holdings) {
        if (!holdings) return 0;
        
        let total = 0;
        for (const ticker in holdings) {
            if (Object.prototype.hasOwnProperty.call(holdings, ticker)) {
                total += holdings[ticker].quantity * holdings[ticker].avgPrice;
            }
        }
        return total;
    }
}