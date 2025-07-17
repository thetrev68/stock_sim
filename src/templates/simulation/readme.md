# Simulation Template Refactoring Project

## 🎯 **Goal**
Reduce the massive `views/simulation.js` file (originally 2,235 lines) by extracting large HTML template strings into separate template modules. This is **Phase 2A** of a larger refactoring effort.

## 🚨 **Critical Rules**
- **ONLY MOVE EXISTING CODE** - Never add, modify, or "optimize" 
- **Exact copying required** - Templates must match original HTML exactly
- **One removal at a time** - Test after each extraction
- **Preserve all functionality** - Everything must work exactly the same

## 📁 **Files Included**

### **Target File**
- `views/simulation.js` - Originally 2,235 lines, now ~1,470 lines

### **Template Files (Created/Updated)**
- `templates/simulation/error-states.js` - Error handling templates
- `templates/simulation/simulation-layout.js` - Main page layout templates  
- `templates/simulation/simulation-sidebar.js` - Sidebar stats and rules templates
- `templates/simulation/simulation-modals.js` - Modal dialog templates
- `templates/simulation/member-components.js` - Member display templates
- `templates/simulation/activity-components.js` - Activity feed templates  
- `templates/simulation/ui-messages.js` - Text constants and loading templates
- `templates/simulation/portfolio-components.js` - **NEW** - Holdings and trades templates
- `templates/simulation/notification-components.js` - **NEW** - Banners and notifications

## ✅ **Progress Completed**

### **Phase 1B Complete** 
- ✅ All utility functions extracted (string-utils, currency-utils, etc.)

### **Phase 2A Progress** 
- ✅ **Loading template** → ui-messages.js (~10 lines)
- ✅ **Stats cards** → simulation-sidebar.js (~40 lines)  
- ✅ **Tab navigation & content** → simulation-layout.js (~120 lines)
- ✅ **Simulation rules & header** → simulation-layout.js (~70 lines)
- ✅ **Member management modal** → simulation-modals.js (~80 lines)
- ✅ **Settings modal** → simulation-modals.js (~200 lines)
- ✅ **Error states** (4 methods) → error-states.js (~60 lines)
- ✅ **Member card template** → member-components.js (~40 lines)
- ✅ **Activity element template** → activity-components.js (~30 lines)
- ✅ **Empty activity template** → activity-components.js (~10 lines)
- ✅ **Holdings & trades templates** → portfolio-components.js (~60 lines) 
- ✅ **Archive prompt banner** → notification-components.js (~40 lines)

**TOTAL EXTRACTED: ~760+ lines**

## 🔪 **Surgical Process**

### **Safe Method (No Breaking Changes)**
1. **Identify** a section in `views/simulation.js` to extract
2. **Copy** the exact HTML code from simulation.js
3. **Paste** into appropriate template file as a new function
4. **Replace** original HTML in simulation.js with `${templateFunction()}`
5. **Test** that everything still works exactly the same
6. **Repeat** with next section

### **Current Remaining Targets**
1. **`showArchiveSuccessInfo()` method** (~30 lines) → notification-components.js
2. **`showTemporaryMessage()` method** (~15 lines) → notification-components.js  
3. **Any other large template methods** in simulation.js

## 🎖️ **Success Metrics**
- **Original**: 2,235 lines in simulation.js
- **Current**: ~1,470 lines in simulation.js (**765+ lines extracted!**)
- **Target**: Reduce simulation.js to ~300-400 lines
- **Functionality**: 100% preserved - zero breaking changes
- **Template Organization**: Clean, focused template modules
- **Maintainability**: Much easier to update UI in the future

## 📊 **File Organization**
- **error-states.js** - Error handling and fallback templates
- **simulation-layout.js** - Main page structure and navigation
- **simulation-sidebar.js** - Stats cards and sidebar content
- **simulation-modals.js** - Modal dialogs and overlays
- **member-components.js** - Member cards and lists
- **activity-components.js** - Activity feed and elements
- **portfolio-components.js** - Holdings and trades display
- **notification-components.js** - Banners and alert messages
- **ui-messages.js** - Text constants and loading states

## 🚧 **Approach**
Use the **copy-exact-code → verify → replace** method to ensure zero functional changes. No assumptions, no shortcuts - only surgical precision.

---

**Phase 2A: Template Extraction - 65% Complete!** 🔧