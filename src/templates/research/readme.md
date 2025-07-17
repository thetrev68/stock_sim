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
- `views/research.js` - The monster we're shrinking

### **Template Files (Already Created)**
1. **research-main-layout.js** (~200 lines) - Main layout and search interface
2. **research-news.js** (~100 lines) - News article templates and filtering
3. **research-search.js** (~80 lines) - Search autocomplete and dropdown
4. **research-charts.js** (~120 lines) - Chart containers and controls
5. **research-stock-display.js** (~180 lines) - Stock quotes and company profiles
6. **research-errors.js** (~60 lines) - Error states and loading templates

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