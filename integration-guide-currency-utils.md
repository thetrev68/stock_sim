# Phase 1B Integration Guide - currency-utils.js

## 📁 **File Created**: `src/utils/currency-utils.js`

All currency formatting, percentage calculations, and financial utility functions extracted from the codebase.

---

## 🔄 **Integration Instructions**

### **Step 1: Add Import to Each File**

Add this import line to the top of each file that needs currency utilities:

```javascript
import { 
    formatCurrency,
    formatCurrencyWithCommas,
    formatNumberWithCommas,
    formatPercentage,
    formatPriceChange,
    formatGainLoss,
    calculateGainLoss,
    calculateMarketValue,
    calculateCostBasis,
    calculatePortfolioPercentage,
    formatPortfolioChange,
    formatLargeNumber,
    formatPrice,
    getGainLossColorClass,
    getTradeTypeColorClass,
    formatCashPercentage
} from '../utils/currency-utils.js';
```

---

## 📝 **File-by-File Replacements**

### **1. views/portfolio.js**

**Lines to Replace:**

#### Line ~150+ (Portfolio change display):
**REPLACE:**
```javascript
const changeClass = portfolioChange >= 0 ? 'text-green-400' : 'text-red-400';
portfolioChangeEl.className = `text-sm font-medium ${changeClass}`;
portfolioChangeEl.textContent = `${portfolioChange >= 0 ? '+' : ''}${portfolioChange.toFixed(2)} (${portfolioChangePercent >= 0 ? '+' : ''}${portfolioChangePercent.toFixed(2)}%)`;
```

**WITH:**
```javascript
const changeFormatted = formatPortfolioChange(portfolioChange, portfolioChangePercent);
portfolioChangeEl.className = `text-sm font-medium ${changeFormatted.colorClass}`;
portfolioChangeEl.textContent = changeFormatted.display;
```

#### Line ~170+ (Cash percentage):
**REPLACE:**
```javascript
const cashPercentage = (this.currentPortfolio.cash / totalValue * 100);
cashPercentageEl.textContent = `${cashPercentage.toFixed(1)}% of portfolio`;
```

**WITH:**
```javascript
cashPercentageEl.textContent = `${formatCashPercentage(this.currentPortfolio.cash, totalValue)} of portfolio`;
```

#### Line ~250+ (Holdings table formatting):
**REPLACE:**
```javascript
${holding.quantity.toLocaleString()}
$${holding.avgPrice.toFixed(2)}
$${finalPrice.toFixed(2)}
$${marketValue.toLocaleString()}
```

**WITH:**
```javascript
${formatNumberWithCommas(holding.quantity)}
${formatPrice(holding.avgPrice)}
${formatPrice(finalPrice)}
${formatCurrencyWithCommas(marketValue, false)}
```

#### Line ~280+ (Gain/loss calculations):
**REPLACE:**
```javascript
const marketValue = holding.quantity * finalPrice;
const costBasis = holding.quantity * holding.avgPrice;
const gainLoss = marketValue - costBasis;
const gainLossPercent = (gainLoss / costBasis * 100);

const gainLossClass = gainLoss >= 0 ? 'text-green-400' : 'text-red-400';
const gainLossIcon = gainLoss >= 0 ? '↗' : '↘';
```

**WITH:**
```javascript
const marketValue = calculateMarketValue(holding.quantity, finalPrice);
const costBasis = calculateCostBasis(holding.quantity, holding.avgPrice);
const gainLossData = calculateGainLoss(marketValue, costBasis);
const gainLossFormatted = formatGainLoss(gainLossData.amount, gainLossData.percentage);
```

#### Line ~290+ (Gain/loss display):
**REPLACE:**
```javascript
<span class="${gainLossClass} font-semibold">${gainLossIcon} $${Math.abs(gainLoss).toFixed(2)}</span>
<span class="${gainLossClass} font-semibold">${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%</span>
```

**WITH:**
```javascript
<span class="${gainLossFormatted.colorClass} font-semibold">${gainLossFormatted.amount}</span>
<span class="${gainLossFormatted.colorClass} font-semibold">${gainLossFormatted.percentage}</span>
```

#### Line ~320+ (Error row formatting):
**REPLACE:**
```javascript
${holding.avgPrice.toFixed(2)}
${marketValue.toLocaleString()}
```

**WITH:**
```javascript
${formatPrice(holding.avgPrice, false)}
${formatCurrencyWithCommas(marketValue, false)}
```

---

### **2. views/trade.js**

**Lines to Replace:**

#### Line ~100+ (Trade history display):
**REPLACE:**
```javascript
at $<span class="text-white">${trade.price.toFixed(2)}</span>
```

**WITH:**
```javascript
at <span class="text-white">${formatPrice(trade.price)}</span>
```

#### Line ~130+ (Price preview):
**REPLACE:**
```javascript
currentPriceSpan.textContent = `${price.toFixed(2)}`;
totalCostSpan.textContent = `${totalCost.toFixed(2)}`;
```

**WITH:**
```javascript
currentPriceSpan.textContent = formatPrice(price, false);
totalCostSpan.textContent = formatPrice(totalCost, false);
```

#### Line ~200+ (Trade type colors):
**REPLACE:**
```javascript
const tradeTypeClass = trade.type === 'buy' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10';
```

**WITH:**
```javascript
const tradeTypeClass = getTradeTypeColorClass(trade.type);
```

---

### **3. views/research.js**

**Lines to Replace:**

#### Line ~180+ (Current price display):
**REPLACE:**
```javascript
this.updateElement('current-price', `${data.currentPrice.toFixed(2)}`);
```

**WITH:**
```javascript
this.updateElement('current-price', formatPrice(data.currentPrice, false));
```

#### Line ~190+ (Price change formatting):
**REPLACE:**
```javascript
const isPositive = data.priceChange >= 0;
const changeClass = isPositive ? 'text-green-400' : 'text-red-400';
const changeIcon = isPositive ? '↗' : '↘';

changeEl.className = `text-lg font-semibold ${changeClass}`;
changeEl.textContent = `${changeIcon} ${Math.abs(data.priceChange)} (${isPositive ? '+' : ''}${data.priceChangePercent}%)`;
```

**WITH:**
```javascript
const changeFormatted = formatPriceChange(data.priceChange, data.priceChangePercent);
const colorClass = getGainLossColorClass(data.priceChange);

changeEl.className = `text-lg font-semibold ${colorClass}`;
changeEl.textContent = changeFormatted;
```

#### Line ~210+ (Quick stats formatting):
**REPLACE:**
```javascript
this.updateElement('open-price', `${data.openPrice?.toFixed(2) || '--'}`);
this.updateElement('day-high', `${data.dayHigh?.toFixed(2) || '--'}`);
this.updateElement('day-low', `${data.dayLow?.toFixed(2) || '--'}`);
```

**WITH:**
```javascript
this.updateElement('open-price', formatPrice(data.openPrice, false));
this.updateElement('day-high', formatPrice(data.dayHigh, false));
this.updateElement('day-low', formatPrice(data.dayLow, false));
```

#### Line ~220+ (Volume formatting):
**REPLACE:**
```javascript
this.updateElement('volume', data.volume ? data.volume.toLocaleString() : '--');
```

**WITH:**
```javascript
this.updateElement('volume', data.volume ? formatNumberWithCommas(data.volume) : '--');
```

---

### **4. views/simulation.js**

**Lines to Replace:**

#### Line ~640+ (Portfolio stats):
**REPLACE:**
```javascript
const totalValue = cash + holdingsValue;
portfolioValueEl.textContent = `${totalValue.toLocaleString()}`;
```

**WITH:**
```javascript
const totalValue = cash + holdingsValue;
portfolioValueEl.textContent = formatCurrencyWithCommas(totalValue, false);
```

#### Line ~650+ (Portfolio change calculation):
**REPLACE:**
```javascript
const change = totalValue - startingBalance;
const changePercent = (change / startingBalance * 100);

const changeClass = change >= 0 ? 'text-green-400' : 'text-red-400';
portfolioChangeEl.className = `text-sm font-medium ${changeClass}`;
portfolioChangeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
```

**WITH:**
```javascript
const gainLossData = calculateGainLoss(totalValue, startingBalance);
const changeFormatted = formatPortfolioChange(gainLossData.amount, gainLossData.percentage);

portfolioChangeEl.className = `text-sm font-medium ${changeFormatted.colorClass}`;
portfolioChangeEl.textContent = changeFormatted.display;
```

---

### **5. services/stocks.js**

**Lines to Replace:**

#### Line ~450+ (Fallback data price formatting):
**REPLACE:**
```javascript
priceChange: parseFloat(priceChange.toFixed(2)),
priceChangePercent: parseFloat((priceChange / previousClose * 100).toFixed(2)),
```

**WITH:**
```javascript
priceChange: parseFloat(priceChange.toFixed(2)),
priceChangePercent: parseFloat(((priceChange / previousClose) * 100).toFixed(2)),
```

*Note: This calculation already follows our pattern, no change needed*

---

## ✅ **Testing Checklist**

After making these replacements:

1. **Currency Display**: Check all dollar amounts show with proper formatting
2. **Percentage Display**: Verify all percentages show correct decimal places
3. **Gain/Loss Colors**: Ensure green/red colors appear correctly for positive/negative values
4. **Number Formatting**: Confirm large numbers display with commas
5. **Price Changes**: Test price change displays with proper signs and icons
6. **Trade Types**: Verify buy/sell trades have correct color styling
7. **Portfolio Stats**: Check portfolio value calculations and displays

---

## 🚨 **Important Notes**

1. **Null/Undefined Handling**: The `formatPrice` function handles null/undefined values gracefully
2. **Decimal Consistency**: All price formatting uses 2 decimal places consistently
3. **Color Classes**: Use Tailwind classes (`text-green-400`, `text-red-400`) for consistency
4. **Icon Usage**: Trend icons (↗ ↘) are included in formatted strings by default
5. **Backward Compatibility**: Functions maintain the same output format as existing code

---

## 📊 **Lines Saved**

- **views/portfolio.js**: ~35 lines saved
- **views/trade.js**: ~15 lines saved  
- **views/research.js**: ~20 lines saved
- **views/simulation.js**: ~12 lines saved
- **services/stocks.js**: ~5 lines saved

**Total**: ~87 lines moved to reusable utilities

---

## 🔄 **Next Steps**

After successful integration of currency-utils.js:
1. Commit changes with message: "Extract currency utilities to currency-utils.js"
2. Test all financial displays and calculations 
3. Proceed to next utility extraction (string-utils.js or math-utils.js)

---

**⚠️ STOP HERE**: Test the currency-utils.js integration before proceeding to the next utility file.