---

## 🎨 UI/UX Plan

We'll structure this into **pages**, **views**, and **flows**, focusing on user intent.

---

### 🏠 1. **Dashboard (Home Page)**

#### 🔹 Purpose:

Overview of all simulations the user is part of.

#### 🧩 Components:

* “My Simulations” (list of joined sims)
* “Create New Simulation” button
* “Join via Invite Code” input (optional)
* “Solo Practice” quick start

---

### ➕ 2. **Create Simulation Page**

#### 🔹 Purpose:

Let the user configure and start a new game.

#### 🧩 Form Fields:

* `Simulation Name`
* `Start Date`
* `End Date`
* `Starting Balance` (e.g. \$10,000)
* `Mode`:

  * Live (real prices)
  * Historical (predefined window)
* `Visibility`: Public / Private
* Invite players by email or UID
* ✅ Create button

---

### 📊 3. **Simulation View (Inside a Game)**

#### 🔹 Purpose:

Where the action happens – portfolio management, trading, leaderboard.

#### 🧩 Tabs:

* **Portfolio**

  * Holdings summary
  * Cash balance
  * Trade history
* **Trade**

  * Buy/sell form
  * Ticker + quantity
* **Research**

  * Price charts
  * News + Profile
* **Leaderboard**

  * Rank by total portfolio value
* *(Admin Only)*: Settings / Kick users / End sim

---

### 👥 4. **Join Simulation Flow**

#### 🔹 Purpose:

User accepts an invite or enters a code to join a simulation.

#### 🧩 Flows:

* Invite link → Accept → Simulation added
* Manual code entry → Validate → Join

---

### 🧪 5. **Solo Sandbox Mode**

#### 🔹 Purpose:

User can test ideas without leaderboard/competition.

#### 🧩 Interface:

* Just like regular sim
* All data is private to user
* No start/end dates

---

## 🧭 User Journey Flow

```text
Login
 ↓
Dashboard
 ├─> Create Simulation
 │     └─> Configure + Invite Players
 ├─> Join Simulation
 │     └─> Invite link/code
 └─> Enter Simulation
        ├─ Portfolio
        ├─ Trade
        ├─ Research
        └─ Leaderboard
```

---

## 🛠️ Project Task List (Milestone-Based)

Here’s a structured list of tasks for building the full project. We’ll break them down into **milestones**:

---

### 🧱 **Milestone 1: Project Setup**

* [ ] Initialize Firebase project
* [ ] Set up Firebase Hosting
* [ ] Initialize Firestore, Auth, Functions
* [ ] Scaffold UI framework (TailwindCSS + HTML)
* [ ] Setup router/views: Dashboard, CreateSim, JoinSim, Simulation

---

### 🎮 **Milestone 2: Core Simulation Logic**

* [ ] Create Simulation (form + Firebase write)
* [ ] Simulation model validation (dates, balance, invites)
* [ ] Save simulation to Firestore
* [ ] Generate invite link/code
* [ ] Join simulation flow

---

### 👤 **Milestone 3: Authentication & User Management**

* [ ] Firebase Auth (Email/Password or Google)
* [ ] Track user in Firestore
* [ ] Show simulations user belongs to on Dashboard
* [ ] Restrict access to simulations (invited users only)

---

### 💰 **Milestone 4: Trading System**

* [ ] Trade form (ticker + quantity + buy/sell)
* [ ] Proxy API call to fetch stock price
* [ ] Record trade in Firestore under simulation
* [ ] Update portfolio with new balance and holdings

---

### 📈 **Milestone 5: Live Data Integration**

* [ ] Firebase Cloud Function: `getQuote(symbol)`
* [ ] Caching mechanism (1 min per ticker)
* [ ] UI polling or on-demand fetch
* [ ] Display in portfolio & research tabs

---

### 🧾 **Milestone 6: Research Tab**

* [ ] Chart view using Chart.js
* [ ] News feed with source filter
* [ ] Company profile section
* [ ] Range selection buttons

---

### 🏆 **Milestone 7: Leaderboard**

* [ ] Compute total portfolio value (cash + holdings)
* [ ] Sort and display leaderboard table
* [ ] Update values periodically or on trade

---

### ⚙️ **Milestone 8: Admin Features**

* [ ] End simulation early
* [ ] Kick user
* [ ] View simulation config
* [ ] Recalculate portfolio values

---

### 🧪 **Milestone 9: Solo Sandbox Mode**

* [ ] Create default solo simulation for each user
* [ ] Hide from public lists
* [ ] Use same trade/portfolio logic

---

### 🚀 **Milestone 10: Deployment & Testing**

* [ ] Firebase deployment scripts
* [ ] Manual QA walkthrough
* [ ] Optional: Invite-only beta
* [ ] Collect feedback for Phase 2

---
