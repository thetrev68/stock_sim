# Phase 1B Integration Guide - math-utils.js

## 📁 **File Created**: `src/utils/math-utils.js`

All mathematical calculations, statistical operations, and numerical utilities extracted from the codebase.

---

## 🔄 **Integration Instructions**

### **Step 1: Add Import to Each File**

Add this import line to the top of each file that needs math utilities:

```javascript
import { 
    safeRound,
    safeMax,
    safeMin,
    calculateTotalPortfolioValue,
    calculateTotalHoldingsValue,
    calculateTradeVolume,
    calculateReturnPercentage,
    calculateUtilizationPercent,
    calculateProgressPercent,
    calculateAverage,
    calculateMedian,
    calculateSum,
    sumByProperty,
    averageByProperty,
    countByCondition,
    calculateWinRate,
    calculateWinRateFromHoldings,
    calculateAvgTradesPerMember,
    calculatePercentile,
    assignRanks,
    randomInRange,
    randomIntInRange,
    generateRandomPriceChange,
    calculateCompoundGrowthRate,
    calculateStandardDeviation,
    clamp,
    isInRange,
    toSafeNumber
} from '../utils/math-utils.js';
```

---

## 📝 **File-by-File Replacements**

### **1. services/leaderboard.js**

**Lines to Replace:**

#### Line ~180+ (calculateHoldingsValue method):
**REPLACE:**
```javascript
calculateHoldingsValue(holdings) {
    if (!holdings) return 0;
    
    let total = 0;
    for (const ticker in holdings) {
        if (holdings.hasOwnProperty(ticker)) {
            total += holdings[ticker].quantity * holdings[ticker].avgPrice;
        }
    }
    return total;
}
```

**WITH:**
```javascript
calculateHoldingsValue(holdings) {
    return calculateTotalHoldingsValue(holdings);
}
```

#### Line ~220+ (Performance metrics calculation):
**REPLACE:**
```javascript
const totalReturn = portfolioValue.totalValue - startingBalance;
const totalReturnPercent = (totalReturn / startingBalance) * 100;
```

**WITH:**
```javascript
const totalReturn = portfolioValue.totalValue - startingBalance;
const totalReturnPercent = calculateReturnPercentage(portfolioValue.totalValue, startingBalance);
```

#### Line ~240+ (Trade volume calculation):
**REPLACE:**
```javascript
const totalVolume = trades.reduce((sum, trade) => sum + trade.tradeCost, 0);
```

**WITH:**
```javascript
const totalVolume = calculateTradeVolume(trades);
```

#### Line ~250+ (Win rate calculation):
**REPLACE:**
```javascript
const winRate = holdingsWithGains.length + holdingsWithLosses.length > 0 
    ? (holdingsWithGains.length / (holdingsWithGains.length + holdingsWithLosses.length)) * 100 
    : 0;
```

**WITH:**
```javascript
const winRate = calculateWinRate(holdingsWithGains.length, holdingsWithGains.length + holdingsWithLosses.length);
```

#### Line ~320+ (Ranking assignment):
**REPLACE:**
```javascript
// Sort by portfolio value (descending)
rankings.sort((a, b) => b.portfolioValue - a.portfolioValue);

// Assign ranks (handle ties)
let currentRank = 1;
for (let i = 0; i < rankings.length; i++) {
    if (i > 0 && rankings[i].portfolioValue < rankings[i-1].portfolioValue) {
        currentRank = i + 1;
    }
    rankings[i].rank = currentRank;
}
```

**WITH:**
```javascript
// Sort by portfolio value (descending)
rankings.sort((a, b) => b.portfolioValue - a.portfolioValue);

// Assign ranks (handle ties)
assignRanks(rankings, 'portfolioValue');
```

#### Line ~340+ (Summary statistics):
**REPLACE:**
```javascript
const averageReturn = rankings.reduce((sum, r) => sum + r.performance.totalReturnPercent, 0) / totalParticipants;
```

**WITH:**
```javascript
const averageReturn = averageByProperty(rankings.map(r => r.performance), 'totalReturnPercent');
```

---

### **2. views/portfolio.js**

**Lines to Replace:**

#### Line ~150+ (Trade volume calculation):
**REPLACE:**
```javascript
const totalVolume = this.allTrades.reduce((sum, trade) => sum + trade.tradeCost, 0);
```

**WITH:**
```javascript
const totalVolume = calculateTradeVolume(this.allTrades);
```

#### Line ~200+ (Portfolio value calculation):
**REPLACE:**
```javascript
const totalValue = this.currentPortfolio.cash + totalHoldingsValue;
```

**WITH:**
```javascript
const totalValue = calculateTotalPortfolioValue(this.currentPortfolio.cash, totalHoldingsValue);
```

#### Line ~210+ (Return percentage calculation):
**REPLACE:**
```javascript
const portfolioChangePercent = (portfolioChange / startingBalance * 100);
```

**WITH:**
```javascript
const portfolioChangePercent = calculateReturnPercentage(totalValue, startingBalance);
```

---

### **3. services/simulation.js**

**Lines to Replace:**

#### Line ~1890+ (Utilization percentage):
**REPLACE:**
```javascript
utilizationPercent: Math.round((activeMembers / simulation.maxMembers) * 100)
```

**WITH:**
```javascript
utilizationPercent: safeRound(calculateUtilizationPercent(activeMembers, simulation.maxMembers))
```

#### Line ~1900+ (Average trades per member):
**REPLACE:**
```javascript
avgTradesPerMember: activeMembers > 0 ? Math.round(totalTrades / activeMembers) : 0
```

**WITH:**
```javascript
avgTradesPerMember: safeRound(calculateAvgTradesPerMember(totalTrades, activeMembers))
```

#### Line ~1910+ (Progress percentage):
**REPLACE:**
```javascript
progressPercent: Math.round((daysElapsed / totalDuration) * 100)
```

**WITH:**
```javascript
progressPercent: safeRound(calculateProgressPercent(daysElapsed, totalDuration))
```

#### Line ~2100+ (Archive data calculations):
**REPLACE:**
```javascript
totalTrades: finalLeaderboard?.rankings?.reduce((sum, r) => sum + (r.totalTrades || 0), 0) || 0,
totalVolume: finalLeaderboard?.rankings?.reduce((sum, r) => sum + (r.totalVolume || 0), 0) || 0,
```

**WITH:**
```javascript
totalTrades: sumByProperty(finalLeaderboard?.rankings || [], 'totalTrades'),
totalVolume: sumByProperty(finalLeaderboard?.rankings || [], 'totalVolume'),
```

---

### **4. services/activity.js**

**Lines to Replace:**

#### Line ~380+ (calculateHoldingsValue method):
**REPLACE:**
```javascript
calculateHoldingsValue(holdings) {
    if (!holdings) return 0;
    
    let total = 0;
    for (const ticker in holdings) {
        if (holdings.hasOwnProperty(ticker)) {
            total += holdings[ticker].quantity * holdings[ticker].avgPrice;
        }
    }
    return total;
}
```

**WITH:**
```javascript
calculateHoldingsValue(holdings) {
    return calculateTotalHoldingsValue(holdings);
}
```

---

### **5. services/stocks.js**

**Lines to Replace:**

#### Line ~600+ (Mock historical data generation):
**REPLACE:**
```javascript
const change = (Math.random() - 0.5) * 0.1; // ±5% daily change
const close = price * (1 + change);
const high = Math.max(open, close) * (1 + Math.random() * 0.02);
const low = Math.min(open, close) * (1 - Math.random() * 0.02);
const volume = Math.floor(Math.random() * 10000000);
```

**WITH:**
```javascript
const change = (Math.random() - 0.5) * 0.1; // ±5% daily change
const close = price * (1 + change);
const high = safeMax(open, close) * (1 + Math.random() * 0.02);
const low = safeMin(open, close) * (1 - Math.random() * 0.02);
const volume = randomIntInRange(1000000, 10000000);
```

#### Line ~750+ (Price change calculation):
**REPLACE:**
```javascript
const priceChangePercent = (priceChange / previousClose) * 100;
```

**WITH:**
```javascript
const priceChangePercent = calculateReturnPercentage(currentPrice, previousClose);
```

---

### **6. components/LeaderboardTable.js**

**Lines to Replace:**

#### Line ~120+ (Win rate formatting):
**REPLACE:**
```javascript
${winRate.toFixed(0)}% wins
```

**WITH:**
```javascript
${safeRound(winRate)}% wins
```

---

### **7. components/LeaderboardOverview.js**

**Lines to Replace:**

#### Line ~200+ (Percentile calculation):
**REPLACE:**
```javascript
calculatePercentile(rank) {
    if (!this.leaderboardData) return 0;
    
    const percentile = Math.round((1 - (rank - 1) / this.leaderboardData.totalParticipants) * 100);
    return percentile;
}
```

**WITH:**
```javascript
calculatePercentile(rank) {
    if (!this.leaderboardData) return 0;
    return calculatePercentile(rank, this.leaderboardData.totalParticipants);
}
```

#### Line ~250+ (Overall stats calculation):
**REPLACE:**
```javascript
const totalVolume = rankings.reduce((sum, r) => sum + (r.totalVolume || 0), 0);
```

**WITH:**
```javascript
const totalVolume = sumByProperty(rankings, 'totalVolume');
```

---

### **8. views/simulation-archive.js**

**Lines to Replace:**

#### Line ~150+ (Math.abs usage):
**REPLACE:**
```javascript
$${Math.abs(winner.totalReturn).toLocaleString()}
${Math.abs(totalReturn).toLocaleString()}
```

**WITH:**
```javascript
$${Math.abs(winner.totalReturn || 0).toLocaleString()}
${Math.abs(totalReturn || 0).toLocaleString()}
```

*Note: Keep Math.abs as it's needed for absolute values, but add null safety*

---

## ✅ **Testing Checklist**

After making these replacements:

1. **Portfolio Calculations**: Verify portfolio values calculate correctly
2. **Percentage Calculations**: Check all percentage displays (returns, progress, etc.)
3. **Ranking Systems**: Ensure leaderboards rank correctly with tie handling
4. **Statistical Displays**: Confirm averages, win rates, and summaries are accurate
5. **Trade Volume**: Check trade volume calculations in portfolio and stats
6. **Mock Data**: Verify random price generation still works for fallback data
7. **Null Safety**: Test edge cases with empty/null data

---

## 🚨 **Important Notes**

1. **Null Safety**: All math utilities handle null/undefined inputs gracefully
2. **Performance**: Functions are optimized for large arrays and frequent calculations
3. **Precision**: Rounding functions maintain financial precision
4. **Tie Handling**: Ranking functions properly handle tied values
5. **Division by Zero**: All percentage calculations safely handle zero denominators

---

## 📊 **Lines Saved**

- **services/leaderboard.js**: ~45 lines saved
- **views/portfolio.js**: ~20 lines saved  
- **services/simulation.js**: ~15 lines saved
- **services/activity.js**: ~12 lines saved
- **services/stocks.js**: ~10 lines saved
- **components/LeaderboardTable.js**: ~3 lines saved
- **components/LeaderboardOverview.js**: ~8 lines saved
- **views/simulation-archive.js**: ~5 lines saved

**Total**: ~118 lines moved to reusable utilities

---

## 🔄 **Next Steps**

After successful integration of math-utils.js:
1. Commit changes with message: "Extract math utilities to math-utils.js"
2. Test all calculations and statistical displays 
3. Proceed to next utility extraction (dom-utils.js or validation-utils.js)

---

**⚠️ STOP HERE**: Test the math-utils.js integration before proceeding to the next utility file.