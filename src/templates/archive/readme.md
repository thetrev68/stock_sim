# Simulation Template Refactoring Project

## 🎯 **Goal**
Reduce the massive `views/simulation-archive.js` file (~550 lines) by extracting large HTML template strings into separate template modules. This is **Phase 2A** of a larger refactoring effort.

## 🚨 **Critical Rules**
- **ONLY MOVE EXISTING CODE** - Never add, modify, or "optimize" 
- **Exact copying required** - Templates must match original HTML exactly
- **One removal at a time** - Test after each extraction
- **Preserve all functionality** - Everything must work exactly the same

## 📁 **Files Included**

### **Target File**
- `views/simulation-archive.js` - The monster we're shrinking

### **Template Files (Already Created)**
- `templates/archive/archive-export.js` - Export and modal templates for simulation archive view
- `templates/archive/archive-layout.js` - Main layout templates for simulation archive view  
- `templates/archive/archive-leaderboard.js` - Leaderboard templates for simulation archive view
- `templates/archive/archive-trade.js` - Trade history templates for simulation archive view

## ✅ **Progress So Far**
- ✅ **Phase 1B Complete** - All utility functions extracted (string-utils, currency-utils, etc.)
- ✅ **Template imports added** - All template files can be imported

## 🔪 **Surgical Process**

### **Safe Method (No Breaking Changes)**
1. **Identify** a section in `views/simulation-archive.js` to extract
2. **Copy** the exact HTML code from simulation.js
3. **Paste** into appropriate template file as a new function
4. **Replace** original HTML in simulation.js with `${templateFunction()}`
5. **Test** that everything still works exactly the same
6. **Repeat** with next section

### **Current Target Sections**


## 🎖️ **Success Metrics**
- **Target**: Reduce `views/simulation-archive.js` to ~300 lines
- **Functionality**: 100% preserved - zero breaking changes
- **Template Organization**: Clean, focused template modules
- **Maintainability**: Much easier to update UI in the future

## 🚧 **Approach**
Use the **copy-exact-code → verify → replace** method to ensure zero functional changes. No assumptions, no shortcuts - only surgical precision.

---

**Ready to continue the template extraction surgery!** 🔧