# Integration Guide - Constants Files

## Overview
This guide shows exactly how to integrate the 4 extracted constants files into the existing codebase.

---

## 1. `src/constants/simulation-status.js`

### **Files to Update:**

#### **views/dashboard.js**
**Lines ~150-200** - Simulation card status logic:
```javascript
// BEFORE:
if (simulation.status === 'active') {
    statusText = 'Active';
    statusColor = 'text-green-400';
    statusBg = 'bg-green-600';
}

// AFTER:
import { SIMULATION_STATUS, STATUS_CONFIG } from '../constants/simulation-status.js';

if (simulation.status === SIMULATION_STATUS.ACTIVE) {
    const config = STATUS_CONFIG[SIMULATION_STATUS.ACTIVE];
    statusText = config.text;
    statusColor = config.color;
    statusBg = config.bgClass;
}
```

**Lines ~220-250** - Role badge logic:
```javascript
// BEFORE:
const roleText = simulation.userRole === 'creator' ? 'Creator' : 'Member';
const roleColor = simulation.userRole === 'creator' ? 'text-cyan-400 bg-cyan-400/10' : 'text-gray-400 bg-gray-400/10';

// AFTER:
import { USER_ROLES, ROLE_CONFIG } from '../constants/simulation-status.js';

const config = ROLE_CONFIG[simulation.userRole] || ROLE_CONFIG[USER_ROLES.MEMBER];
const roleText = config.text;
const roleColor = config.color;
```

#### **views/simulation.js**
**Lines ~800-850** - Status display updates:
```javascript
// BEFORE:
const statusClass = this.currentSimulation.status === 'active' ? 'bg-green-600 text-white' :
                   this.currentSimulation.status === 'pending' ? 'bg-yellow-600 text-white' :
                   'bg-gray-600 text-gray-300';

// AFTER:
import { SIMULATION_STATUS, STATUS_CONFIG } from '../constants/simulation-status.js';

const statusClass = STATUS_CONFIG[this.currentSimulation.status]?.statusClass || 'bg-gray-600 text-gray-300';
```

**Lines ~1100-1150** - Status checking in loadData():
```javascript
// BEFORE:
if (this.currentSimulation.status === 'ended' && !this.currentSimulation.archived) {

// AFTER:
if (this.currentSimulation.status === SIMULATION_STATUS.ENDED && !this.currentSimulation.archived) {
```

#### **services/simulation.js**
**Lines ~400-450** - calculateRealTimeStatus method:
```javascript
// BEFORE:
if (now > endDate) {
    return 'ended';
} else if (now >= startDate) {
    return 'active';
} else {
    return 'pending';
}

// AFTER:
import { SIMULATION_STATUS } from '../constants/simulation-status.js';

if (now > endDate) {
    return SIMULATION_STATUS.ENDED;
} else if (now >= startDate) {
    return SIMULATION_STATUS.ACTIVE;
} else {
    return SIMULATION_STATUS.PENDING;
}
```

**Lines ~500-550** - endSimulationEarly method:
```javascript
// BEFORE:
if (simulation.status === 'ended') {
    throw new Error('Simulation is already ended');
}

// AFTER:
if (simulation.status === SIMULATION_STATUS.ENDED) {
    throw new Error('Simulation is already ended');
}
```

---

## 2. `src/constants/trade-types.js`

### **Files to Update:**

#### **views/trade.js**
**Lines ~200-250** - Trade button handling:
```javascript
// BEFORE:
buyBtn.addEventListener('click', () => this.handleTrade('buy'));
sellBtn.addEventListener('click', () => this.handleTrade('sell'));

// AFTER:
import { TRADE_TYPES } from '../constants/trade-types.js';

buyBtn.addEventListener('click', () => this.handleTrade(TRADE_TYPES.BUY));
sellBtn.addEventListener('click', () => this.handleTrade(TRADE_TYPES.SELL));
```

**Lines ~400-450** - Trade element creation:
```javascript
// BEFORE:
const tradeTypeClass = trade.type === 'buy' ? 'text-green-400' : 'text-red-400';

// AFTER:
import { TRADE_TYPES, TRADE_TYPE_CONFIG } from '../constants/trade-types.js';

const tradeTypeClass = TRADE_TYPE_CONFIG[trade.type]?.color || 'text-gray-400';
```

#### **services/trading.js**
**Lines ~100-150** - Trade validation:
```javascript
// BEFORE:
if (!['buy', 'sell'].includes(tradeDetails.type)) {
    throw new Error('Trade type must be "buy" or "sell".');
}

// AFTER:
import { TRADE_TYPES } from '../constants/trade-types.js';

if (!Object.values(TRADE_TYPES).includes(tradeDetails.type)) {
    throw new Error(`Trade type must be "${TRADE_TYPES.BUY}" or "${TRADE_TYPES.SELL}".`);
}
```

**Lines ~300-350** - validateSimulationTrade function:
```javascript
// BEFORE:
if (tradeDetails.type === 'sell' && simulation.rules?.allowShortSelling === false) {

// AFTER:
if (tradeDetails.type === TRADE_TYPES.SELL && simulation.rules?.allowShortSelling === false) {
```

#### **views/simulation.js**
**Lines ~1800-1850** - createTradeElement method:
```javascript
// BEFORE:
const tradeTypeClass = trade.type === 'buy' ? 'text-green-400' : 'text-red-400';
const tradeIcon = trade.type === 'buy' ? '↗' : '↘';

// AFTER:
import { TRADE_TYPES, TRADE_TYPE_CONFIG } from '../constants/trade-types.js';

const config = TRADE_TYPE_CONFIG[trade.type];
const tradeTypeClass = config?.color || 'text-gray-400';
const tradeIcon = config?.icon || '•';
```

---

## 3. `src/constants/ui-messages.js`

### **Files to Update:**

#### **views/auth.js**
**Lines ~80-120** - formatAuthError method:
```javascript
// BEFORE:
const errorMessages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password.',
    // ... rest of error messages
};

// AFTER:
import { ERROR_MESSAGES } from '../constants/ui-messages.js';

const errorMessages = {
    'auth/user-not-found': ERROR_MESSAGES.AUTH_USER_NOT_FOUND,
    'auth/wrong-password': ERROR_MESSAGES.AUTH_WRONG_PASSWORD,
    'auth/email-already-in-use': ERROR_MESSAGES.AUTH_EMAIL_IN_USE,
    'auth/weak-password': ERROR_MESSAGES.AUTH_WEAK_PASSWORD,
    'auth/invalid-email': ERROR_MESSAGES.AUTH_INVALID_EMAIL,
    'auth/popup-closed-by-user': ERROR_MESSAGES.AUTH_POPUP_CLOSED,
    'auth/network-request-failed': ERROR_MESSAGES.AUTH_NETWORK_ERROR,
};

return new Error(errorMessages[error.code] || ERROR_MESSAGES.AUTH_GENERAL);
```

#### **views/simulation.js**
**Lines ~100-150** - Loading template:
```javascript
// BEFORE:
<p class="text-gray-400">Loading simulation...</p>

// AFTER:
import { LOADING_MESSAGES } from '../constants/ui-messages.js';

<p class="text-gray-400">${LOADING_MESSAGES.SIMULATION}</p>
```

**Lines ~500-550** - showTemporaryMessage calls:
```javascript
// BEFORE:
this.showTemporaryMessage('Settings updated successfully', 'success');

// AFTER:
import { SUCCESS_MESSAGES } from '../constants/ui-messages.js';

this.showTemporaryMessage(SUCCESS_MESSAGES.SETTINGS_UPDATED, 'success');
```

#### **views/trade.js**
**Lines ~300-350** - Feedback messages:
```javascript
// BEFORE:
this.showFeedback('Processing trade...', 'text-cyan-400');
this.showFeedback('You must be logged in to make trades.', 'text-red-400');

// AFTER:
import { INFO_MESSAGES, ERROR_MESSAGES } from '../constants/ui-messages.js';

this.showFeedback(INFO_MESSAGES.PROCESSING_TRADE, 'text-cyan-400');
this.showFeedback(ERROR_MESSAGES.AUTH_LOGIN_REQUIRED, 'text-red-400');
```

#### **views/research.js**
**Lines ~200-250** - Error states:
```javascript
// BEFORE:
this.showError('Please enter a stock ticker symbol');

// AFTER:
import { ERROR_MESSAGES } from '../constants/ui-messages.js';

this.showError(ERROR_MESSAGES.STOCK_TICKER_REQUIRED);
```

---

## 4. `src/constants/app-config.js`

### **Files to Update:**

#### **views/simulation.js**
**Lines ~2000-2050** - startAutoRefresh method:
```javascript
// BEFORE:
this.refreshInterval = setInterval(async () => {
    // ... refresh logic
}, 30000);

this.leaderboardRefreshInterval = setInterval(async () => {
    // ... leaderboard refresh
}, 120000);

// AFTER:
import { REFRESH_INTERVALS } from '../constants/app-config.js';

this.refreshInterval = setInterval(async () => {
    // ... refresh logic
}, REFRESH_INTERVALS.SIMULATION_DATA);

this.leaderboardRefreshInterval = setInterval(async () => {
    // ... leaderboard refresh
}, REFRESH_INTERVALS.LEADERBOARD);
```

#### **views/research.js**
**Lines ~300-350** - Search debouncing:
```javascript
// BEFORE:
this.searchTimeout = setTimeout(async () => {
    // ... search logic
}, 300);

// AFTER:
import { TIMEOUTS } from '../constants/app-config.js';

this.searchTimeout = setTimeout(async () => {
    // ... search logic
}, TIMEOUTS.SEARCH_DEBOUNCE);
```

**Lines ~800-850** - News search debouncing:
```javascript
// BEFORE:
searchTimeout = setTimeout(() => {
    this.searchNews(e.target.value);
}, 300);

// AFTER:
searchTimeout = setTimeout(() => {
    this.searchNews(e.target.value);
}, TIMEOUTS.NEWS_SEARCH_DEBOUNCE);
```

#### **services/stocks.js**
**Lines ~100-150** - Rate limiting:
```javascript
// BEFORE:
if (this.callTimestamps.length >= this.maxCallsPerMinute) {
    // Rate limit logic
}

// AFTER:
import { API_LIMITS } from '../constants/app-config.js';

if (this.callTimestamps.length >= API_LIMITS.MAX_CALLS_PER_MINUTE) {
    // Rate limit logic
}
```

**Lines ~200-250** - Cache timeouts:
```javascript
// BEFORE:
this.cacheTimeout = 60000; // 1 minute

// AFTER:
import { CACHE_CONFIG } from '../constants/app-config.js';

this.cacheTimeout = CACHE_CONFIG.STOCK_PRICES;
```

#### **views/simulation-archive.js**
**Lines ~400-450** - Auto-hide timeout:
```javascript
// BEFORE:
setTimeout(() => {
    document.getElementById('temp-message')?.remove();
}, 5000);

// AFTER:
import { TIMEOUTS } from '../constants/app-config.js';

setTimeout(() => {
    document.getElementById('temp-message')?.remove();
}, TIMEOUTS.TEMP_MESSAGE_AUTO_HIDE);
```

---

## **Integration Order**

**Recommended order for safety:**
1. Start with `app-config.js` (least risky - just timeouts)
2. Then `simulation-status.js` (well-defined constants)
3. Then `trade-types.js` (straightforward replacements)
4. Finally `ui-messages.js` (most complex - many string replacements)

**Test after each file integration** to ensure no functionality breaks.

---

## **Import Pattern**

Add these imports at the top of each file being modified:

```javascript
// Single imports
import { SIMULATION_STATUS } from '../constants/simulation-status.js';

// Multiple imports
import { 
    SIMULATION_STATUS, 
    STATUS_CONFIG, 
    USER_ROLES 
} from '../constants/simulation-status.js';

// Full imports when using many constants
import * as SimulationConstants from '../constants/simulation-status.js';
```

---

## **Verification Checklist**

After each integration:
- [ ] No console errors on page load
- [ ] Simulation status displays correctly
- [ ] Trade buttons work as expected
- [ ] Error messages show properly
- [ ] Auto-refresh intervals working
- [ ] Search functionality intact