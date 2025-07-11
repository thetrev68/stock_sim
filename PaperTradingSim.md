# Paper Trading Simulator - Technical Build Plan

## 🎯 **Core Philosophy**
Build in **layers** that each add working functionality. Each session should result in something you can actually see and interact with.

---

## 🛠️ **Phase 1: Foundation & Solo Mode** 
*Get the core trading engine working first*

### **Session 1: Project Setup + Basic Structure**
- [ ] Vite project setup with Tailwind
- [ ] Firebase project initialization (Auth, Firestore, Hosting)
- [ ] Copy styling/theme from `core.html` 
- [ ] Basic routing setup (Dashboard, Trade, Portfolio views)
- [ ] Navigation component working
- [ ] **Deliverable**: Empty app with working navigation

### **Session 2: Firebase Auth + User State**
- [ ] Firebase Auth integration (Google + Email)
- [ ] Login/logout UI components
- [ ] User context/state management
- [ ] Protected routes setup
- [ ] **Deliverable**: Users can sign in and see their dashboard

### **Session 3: Solo Trading Core**
- [ ] Portfolio data structure in Firestore
- [ ] Trade form component (ticker, quantity, buy/sell)
- [ ] Mock price fetching (hardcoded prices for testing)
- [ ] Basic trade execution (update portfolio in Firestore)
- [ ] **Deliverable**: Users can make trades and see portfolio update

### **Session 4: Live Price Integration**
- [ ] Firebase Cloud Function for Finnhub API
- [ ] Price caching strategy (1-minute cache)
- [ ] Replace mock prices with real API calls
- [ ] Portfolio value calculations with live prices
- [ ] **Deliverable**: Real trading with live stock prices

### **Session 5: Portfolio UI Polish**
- [ ] Holdings display with current values
- [ ] Gain/loss calculations and coloring
- [ ] Trade history view
- [ ] Cash balance management
- [ ] **Deliverable**: Complete solo trading experience

---

## 🚀 **Phase 2: Multi-User Simulations**
*Layer on the competitive/social features*

### **Session 6: Simulation Data Model**
- [ ] Simulation schema design in Firestore
- [ ] Create simulation form and logic
- [ ] Simulation state management
- [ ] Basic simulation view (empty but navigable)
- [ ] **Deliverable**: Users can create and enter simulations

### **Session 7: Simulation Trading**
- [ ] Adapt solo trading logic for simulations
- [ ] Simulation-scoped portfolios
- [ ] Trade validation within simulation rules
- [ ] Portfolio isolation per simulation
- [ ] **Deliverable**: Trading works inside simulations

### **Session 8: Invite System**
- [ ] Invitation code generation
- [ ] Join simulation by code
- [ ] User-simulation relationship management
- [ ] Basic member list display
- [ ] **Deliverable**: Multi-user simulations work

### **Session 9: Leaderboard**
- [ ] Portfolio value calculation for ranking
- [ ] Real-time leaderboard updates
- [ ] Sorting and display logic
- [ ] Performance metrics (daily P&L, etc.)
- [ ] **Deliverable**: Working competitive leaderboard

---

## 📊 **Phase 3: Research & Advanced Features**
*Add the nice-to-have features*

### **Session 10: Research Tab Foundation**
- [ ] Stock quote display component
- [ ] Basic price charts (Chart.js integration)
- [ ] Company profile API integration
- [ ] **Deliverable**: Research tab with prices and basic charts

### **Session 11: Advanced Research**
- [ ] Multiple timeframe charts
- [ ] News feed integration
- [ ] News filtering options
- [ ] Search functionality
- [ ] **Deliverable**: Full research experience

### **Session 12: Admin & Simulation Management**
- [ ] Simulation settings panel
- [ ] End simulation functionality
- [ ] Kick user capability
- [ ] Simulation history/archives
- [ ] **Deliverable**: Complete simulation management

---

## 🎨 **Phase 4: Polish & Production**

### **Session 13: UI/UX Polish**
- [ ] Responsive design improvements
- [ ] Loading states and error handling
- [ ] Animations and micro-interactions
- [ ] Mobile optimization
- [ ] **Deliverable**: Production-ready UI

### **Session 14: Performance & Deployment**
- [ ] Firebase deployment pipeline
- [ ] Performance optimization
- [ ] Error monitoring setup
- [ ] Final testing and bug fixes
- [ ] **Deliverable**: Live production app

---

## 🧩 **Key Technical Decisions**

### **Data Structure**
```javascript
// Users
{
  uid: "user123",
  email: "user@example.com",
  displayName: "John Doe",
  createdAt: timestamp
}

// Simulations
{
  id: "sim123",
  name: "Q1 Trading Challenge",
  createdBy: "user123",
  startDate: timestamp,
  endDate: timestamp,
  startingBalance: 10000,
  inviteCode: "ABC123",
  members: ["user123", "user456"],
  status: "active" | "ended"
}

// Portfolios (per user per simulation)
{
  userId: "user123",
  simulationId: "sim123", // null for solo mode
  cash: 8500,
  holdings: {
    "AAPL": { quantity: 10, avgPrice: 150.00 },
    "TSLA": { quantity: 5, avgPrice: 200.00 }
  },
  trades: [...] // trade history
}
```

### **File Structure**
```
src/
├── components/
│   ├── auth/
│   ├── trading/
│   ├── portfolio/
│   ├── simulation/
│   └── research/
├── services/
│   ├── firebase.js
│   ├── trading.js
│   └── stocks.js
├── utils/
├── views/
└── main.js
```

---

## 🎯 **Session Success Criteria**

Each session should end with:
1. **Working feature** you can demo
2. **No broken functionality** from previous sessions
3. **Clear starting point** for next session
4. **Deployable state** (even if incomplete)

---

## 🚦 **Build Order Rationale**

1. **Solo first** = Get core trading logic solid before adding complexity
2. **Auth early** = Everything else depends on user identity
3. **Data model stable** = Changes get expensive once you have real users
4. **Features over polish** = Working features first, pretty UI later
5. **Real API integration** = Don't build on fake data too long

This plan lets you have something **working and deployable** after almost every session, while building up complexity gradually!