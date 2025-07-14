# Phase 1B Integration Guide - date-utils.js

## 📁 **File Created**: `src/utils/date-utils.js`

All date formatting, duration calculations, and time-related utility functions extracted from the codebase.

---

## 🔄 **Integration Instructions**

### **Step 1: Add Import to Each File**

Add this import line to the top of each file that needs date utilities:

```javascript
import { 
    convertFirebaseDate, 
    formatDateRange, 
    calculateDaysRemaining, 
    calculateDaysUntilStart,
    calculateDaysElapsed,
    calculateTotalDuration,
    calculateDaysAgo,
    getTimeAgo,
    getTimeAgoCompact,
    formatNewsDate,
    getTomorrowISO,
    filterByDateRange,
    sortByDateDesc
} from '../utils/date-utils.js';
```

---

## 📝 **File-by-File Replacements**

### **1. views/simulation.js**

**Lines to Replace:**

#### Line ~580 (Duration display):
**REPLACE:**
```javascript
const startDate = this.currentSimulation.startDate.toDate ? this.currentSimulation.startDate.toDate() : new Date(this.currentSimulation.startDate);
const endDate = this.currentSimulation.endDate.toDate ? this.currentSimulation.endDate.toDate() : new Date(this.currentSimulation.endDate);
durationEl.textContent = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
```

**WITH:**
```javascript
durationEl.textContent = formatDateRange(this.currentSimulation.startDate, this.currentSimulation.endDate);
```

#### Line ~595 (Days remaining calculation):
**REPLACE:**
```javascript
const endDate = this.currentSimulation.endDate.toDate ? this.currentSimulation.endDate.toDate() : new Date(this.currentSimulation.endDate);
const now = new Date();
const diffTime = endDate - now;
const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
daysRemainingEl.textContent = diffDays;
```

**WITH:**
```javascript
const diffDays = calculateDaysRemaining(this.currentSimulation.endDate);
daysRemainingEl.textContent = diffDays;
```

#### Line ~1891 (Timeline stats calculation):
**REPLACE:**
```javascript
const startDate = simulation.startDate.toDate() : new Date(simulation.startDate);
const endDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
const originalEndDate = simulation.originalEndDate ? 
    (simulation.originalEndDate.toDate ? simulation.originalEndDate.toDate() : new Date(simulation.originalEndDate)) : 
    null;

const totalDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
const daysElapsed = Math.max(0, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));
const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
```

**WITH:**
```javascript
const startDate = convertFirebaseDate(simulation.startDate);
const endDate = convertFirebaseDate(simulation.endDate);
const originalEndDate = simulation.originalEndDate ? convertFirebaseDate(simulation.originalEndDate) : null;

const totalDuration = calculateTotalDuration(simulation.startDate, simulation.endDate);
const daysElapsed = calculateDaysElapsed(simulation.startDate);
const daysRemaining = calculateDaysRemaining(simulation.endDate);
```

#### Line ~2000+ (Template date displays):
**REPLACE:**
```javascript
${new Date(simulation.startDate.toDate()).toLocaleDateString()}
${new Date(simulation.endDate.toDate()).toLocaleDateString()}
${new Date(simulation.originalEndDate.toDate()).toLocaleDateString()}
```

**WITH:**
```javascript
${convertFirebaseDate(simulation.startDate).toLocaleDateString()}
${convertFirebaseDate(simulation.endDate).toLocaleDateString()}
${convertFirebaseDate(simulation.originalEndDate).toLocaleDateString()}
```

#### Line ~1650 (getTimeAgo method):
**REPLACE:**
```javascript
getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
}
```

**WITH:**
```javascript
// Remove this method entirely, use imported getTimeAgo function
```

#### Line ~2100+ (Date input minimum):
**REPLACE:**
```javascript
min="${new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}"
```

**WITH:**
```javascript
min="${getTomorrowISO()}"
```

---

### **2. views/dashboard.js**

**Lines to Replace:**

#### Line ~150+ (Date conversion and calculations):
**REPLACE:**
```javascript
const startDate = simulation.startDate.toDate() : new Date(simulation.startDate);
const endDate = simulation.endDate.toDate ? simulation.endDate.toDate() : new Date(simulation.endDate);
const now = new Date();
```

**WITH:**
```javascript
const startDate = convertFirebaseDate(simulation.startDate);
const endDate = convertFirebaseDate(simulation.endDate);
const now = new Date();
```

#### Line ~160+ (Days until start calculation):
**REPLACE:**
```javascript
const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
```

**WITH:**
```javascript
const daysUntilStart = calculateDaysUntilStart(simulation.startDate);
```

#### Line ~170+ (Days remaining calculation):
**REPLACE:**
```javascript
const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
```

**WITH:**
```javascript
const daysRemaining = calculateDaysRemaining(simulation.endDate);
```

#### Line ~180+ (Days ago calculation):
**REPLACE:**
```javascript
const daysAgo = Math.floor((now - endDate) / (1000 * 60 * 60 * 24));
```

**WITH:**
```javascript
const daysAgo = calculateDaysAgo(simulation.endDate);
```

---

### **3. services/stocks.js**

**Lines to Replace:**

#### Line ~850+ (formatNewsDate method):
**REPLACE:**
```javascript
formatNewsDate(timestamp) {
    const now = new Date();
    const newsDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - newsDate) / (1000 * 60));
    
    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}h ago`;
    } else {
        const days = Math.floor(diffInMinutes / 1440);
        if (days === 1) {
            return 'Yesterday';
            } else if (days < 7) {
                return `${days} days ago`;
            } else {
                return newsDate.toLocaleDateString();
            }
        }
    }
}
```

**WITH:**
```javascript
// Remove this method entirely, use imported formatNewsDate function
```

#### Line ~900+ (filterNewsByDate method):
**REPLACE:**
```javascript
filterNewsByDate(newsArticles, daysBack = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffTimestamp = cutoffDate.getTime();
    
    return newsArticles.filter(article => article.datetime >= cutoffTimestamp);
}
```

**WITH:**
```javascript
filterNewsByDate(newsArticles, daysBack = 7) {
    return filterByDateRange(newsArticles, daysBack);
}
```

#### Line ~920+ (sortNewsByDate method):
**REPLACE:**
```javascript
sortNewsByDate(newsArticles) {
    return [...newsArticles].sort((a, b) => b.datetime - a.datetime);
}
```

**WITH:**
```javascript
sortNewsByDate(newsArticles) {
    return sortByDateDesc(newsArticles);
}
```

---

### **4. services/activity.js**

**Lines to Replace:**

#### Line ~380+ (getTimeAgo method):
**REPLACE:**
```javascript
getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}
```

**WITH:**
```javascript
// Remove this method entirely, use imported getTimeAgoCompact function
```

**Note**: Replace calls to `this.getTimeAgo()` with `getTimeAgoCompact()` since activity.js uses the compact format.

---

## ✅ **Testing Checklist**

After making these replacements:

1. **Date Range Display**: Check simulation cards show correct "Start - End" dates
2. **Days Remaining**: Verify countdown timers show correct values
3. **Time Ago**: Ensure activity feeds show proper relative times
4. **News Dates**: Confirm news articles display correct timestamps
5. **Form Validation**: Test date inputs have correct minimum values
6. **Duration Calculations**: Verify timeline statistics are accurate

---

## 🚨 **Important Notes**

1. **Keep Original Code**: Comment out replaced code instead of deleting (for easy rollback)
2. **Test Incrementally**: Replace one file at a time and test functionality
3. **Firebase Timestamps**: The `convertFirebaseDate` function handles both Firebase Timestamps and regular Date objects
4. **Import Path**: Adjust import paths if your file structure differs
5. **Method Removal**: When removing methods from classes, ensure no other methods call them

---

## 📊 **Lines Saved**

- **views/simulation.js**: ~15 lines saved
- **views/dashboard.js**: ~8 lines saved  
- **services/stocks.js**: ~25 lines saved
- **services/activity.js**: ~10 lines saved

**Total**: ~58 lines moved to reusable utilities

---

## 🔄 **Next Steps**

After successful integration of date-utils.js:
1. Commit changes with message: "Extract date utilities to date-utils.js"
2. Test all date-related functionality 
3. Proceed to next utility extraction (currency-utils.js)

---

**⚠️ STOP HERE**: Test the date-utils.js integration before proceeding to the next utility file.