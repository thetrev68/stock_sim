# Copilot Instructions for `stock_sim`

## Big Picture Architecture
- **Layered Build Philosophy:** Features are added in phases, each session delivers a working, demo-able feature. See `README.md` for build plan and rationale.
- **Frontend:** Vanilla JS, modular structure in `src/`, Vite for dev/build, Tailwind CSS for UI.
- **Backend:** Firebase (Auth, Firestore, Hosting, Cloud Functions for price API).
- **Routing:** Custom SPA router (`src/utils/router.js`).
- **Views:** Each main feature (auth, dashboard, portfolio, research, trade, simulation) is a separate file/class in `src/views/`.
- **Components:** Organized by domain in `src/components/` (e.g., `auth/`, `trading/`, `portfolio/`).

## Developer Workflows
- **Start Dev Server:** `npm run dev`
- **Build for Production:** `npm run build`
- **Preview Build:** `npm run preview`
- **Deploy:** `npm run build && firebase deploy`
- **Cloud Functions:** Add price API logic in Firebase functions (see Phase 1, Session 4 in `README.md`).

## Project-Specific Conventions
- **Routing:** Add routes via `Router.addRoute(path, handler)`. Unknown routes redirect to dashboard (`/`).
- **Views:** Each view class exports a `render(container)` method. Use Tailwind utility classes for styling.
- **Auth:** Auth state changes handled via callback (`onAuthStateChanged`). Supports email/password and Google sign-in.
- **Firebase:** Always call `initializeApp()` before accessing services. Use exported functions from `firebase.js` for auth/db access.
- **Tailwind v4:** Use `@import "tailwindcss/preflight"` in CSS for base styles (not `@tailwind base`).
- **Data Model:** See `README.md` for user, simulation, and portfolio schemas. Portfolios are scoped per user per simulation.

## Integration Points
- **Firebase:** Config in `src/services/firebase.js`. Rules in `firestore.rules`, indexes in `firestore.indexes.json`.
- **Finnhub API:** Integrated via Firebase Cloud Functions for live price data (see build plan).
- **Chart.js:** Used for price charts in research tab (see Phase 3, Session 10).

## File Structure Reference
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

## Session Success Criteria
- Each session ends with a working feature, no regressions, clear next steps, and a deployable state.
- Build order prioritizes solo mode, stable data model, and real API integration before polish.

## Examples
- **Add a new view:** Create `src/views/newview.js` exporting a class with `render(container)`.
- **Add a route:** In router setup, use `app.router.addRoute('/new', () => { /* render new view */ });`

---

For more details, see `README.md`. Please provide feedback if any section is unclear or missing context.
