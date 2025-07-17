# Simulation Template Refactoring Project

## 🎯 **Goal**
Reduce the massive `views/simulation.js` file (2,235 lines) by extracting large HTML template strings into separate template modules. This is **Phase 2A** of a larger refactoring effort.

## 🚨 **Critical Rules**
- **ONLY MOVE EXISTING CODE** - Never add, modify, or "optimize" 
- **Exact copying required** - Templates must match original HTML exactly
- **One removal at a time** - Test after each extraction
- **Preserve all functionality** - Everything must work exactly the same

## 📁 **Files Included**

### **Target File**
- `views/simulation.js` - The 2,235-line monster we're shrinking

### **Template Files (Already Created)**
- `templates/simulation/error-states.js` - Error handling templates
- `templates/simulation/simulation-layout.js` - Main page layout templates  
- `templates/simulation/simulation-sidebar.js` - Sidebar stats and rules templates
- `templates/simulation/simulation-modals.js` - Modal dialog templates
- `templates/simulation/member-components.js` - Member display templates
- `templates/simulation/activity-components.js` - Activity feed templates  
- `templates/simulation/ui-messages.js` - Text constants 

## ✅ **Progress So Far**
- ✅ **Phase 1B Complete** - All utility functions extracted (string-utils, currency-utils, etc.)
- ✅ **Template imports added** - All template files can be imported
- ✅ **First removal successful** - Error state template working

## 🔪 **Surgical Process**

### **Safe Method (No Breaking Changes)**
1. **Identify** a section in `views/simulation.js` to extract
2. **Copy** the exact HTML code from simulation.js
3. **Paste** into appropriate template file as a new function
4. **Replace** original HTML in simulation.js with `${templateFunction()}`
5. **Test** that everything still works exactly the same
6. **Repeat** with next section

### **Current Target Sections**
Looking at the actual `getTemplate()` method content for safe removal candidates:

1. **Stats cards grid** (3 info cards: rank, portfolio value, time remaining)
2. **Tab navigation** (Portfolio & Trades, Leaderboard, Members & Activity)
3. **Simulation rules section** (bottom rules display)
4. **Individual tab content sections**

## 🎖️ **Success Metrics**
- **Target**: Reduce `views/simulation.js` from 2,235 lines to ~300-400 lines
- **Functionality**: 100% preserved - zero breaking changes
- **Template Organization**: Clean, focused template modules
- **Maintainability**: Much easier to update UI in the future

## 🚧 **Approach**
Use the **copy-exact-code → verify → replace** method to ensure zero functional changes. No assumptions, no shortcuts - only surgical precision.

---

**Ready to continue the template extraction surgery!** 🔧