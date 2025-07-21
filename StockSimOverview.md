## Core Application Files

**main.js** (180 lines) - The main application entry point that initializes the app, sets up routing, handles authentication state changes, and manages the overall app lifecycle.

**utils/router.js** (60 lines) - Handles client-side routing and navigation between different views in the single-page application.



## Service Layer (Business Logic)

**services/firebase.js** (62 lines) - Firebase configuration and initialization, exports database, auth, and analytics instances.

**services/auth.js** (163 lines) - Authentication service handling user login, logout, registration, and auth state management.

**services/stocks.js** (177 lines) - Main stocks service that coordinates stock data fetching, news, caching, and quotes from various stock-related sub-services.

**services/trading.js** (455 lines) - Core trading functionality for buying/selling stocks, managing portfolios, and trade history.

**services/simulation.js** (222 lines) - Main simulation service for creating and managing trading simulations/competitions.

**services/activity.js** (485 lines) - Tracks and manages user activities, recent trades, and activity feeds within simulations.

**services/leaderboard.js** (502 lines) - Calculates rankings, portfolio performance, and leaderboard data for simulations.



## Simulation Sub-Services

**services/simulation/simulation-core.js** (255 lines) - Core simulation operations like creating, updating, and managing simulation lifecycle.

**services/simulation/simulation-management.js** (503 lines) - Advanced simulation management including member operations and admin functions.

**services/simulation/simulation-members.js** (297 lines) - Handles adding/removing members, member permissions, and membership status.

**services/simulation/simulation-user-operations.js** (176 lines) - User-specific operations within simulations like joining, leaving, and user data management.



## Stock Data Sub-Services

**services/stocks/stock-api.js** (97 lines) - Interfaces with external stock APIs to fetch real-time stock data.

**services/stocks/stock-cache.js** (93 lines) - Caches stock data to reduce API calls and improve performance.

**services/stocks/stock-news.js** (311 lines) - Fetches and processes stock-related news articles and market updates.

**services/stocks/stock-quotes.js** (503 lines) - Handles real-time stock quotes, historical data, and chart information.



## View Components (Pages)

**views/dashboard.js** (726 lines) - Main dashboard page showing user's simulations, portfolio overview, recent activity, and navigation to other features.

**views/simulation.js** (1085 lines) - The main simulation page displaying leaderboards, member management, portfolio tracking, and all simulation-related functionality.

**views/portfolio.js** (405 lines) - User's personal portfolio view showing holdings, trade history, performance metrics, and portfolio management tools.

**views/research.js** (337 lines) - Stock research page with charts, news, search functionality, and detailed stock analysis tools.

**views/trade.js** (528 lines) - Trading interface for buying/selling stocks, order forms, trade confirmation, and portfolio selection.

**views/simulation-archive.js** (289 lines) - Archive view for completed simulations, showing historical data and final results.

**views/auth.js** (247 lines) - Authentication pages handling login, registration, and password reset functionality.



## Layout Components

**components/layout/Header.js** (82 lines) - Top navigation header with user menu, app title, and main navigation links.

**components/layout/Navigation.js** (52 lines) - Side navigation or menu component for navigating between main app sections.



## Research Components

**components/research/ChartManager.js** (232 lines) - Manages stock charts, technical indicators, and chart data visualization.

**components/research/NewsManager.js** (221 lines) - Handles stock news display, filtering, and news article management.

**components/research/SearchManager.js** (98 lines) - Stock search functionality with autocomplete and search result handling.

**components/research/StockDataManager.js** (136 lines) - Displays detailed stock data, metrics, and fundamental information.



## Simulation Components

**components/simulation/CreateSimulationModal.js** (392 lines) - Modal for creating new trading simulations with settings and configuration.

**components/simulation/EmailInviteModal.js** (451 lines) - Modal for inviting users to simulations via email with invitation management.

**components/simulation/JoinSimulationModal.js** (362 lines) - Modal for users to join existing simulations with validation and confirmation.

**components/simulation/LeaderboardOverview.js** (352 lines) - High-level leaderboard display with rankings and performance summaries.

**components/simulation/LeaderboardTable.js** (256 lines) - Detailed leaderboard table with sortable columns and user rankings.

**components/simulation/SimulationActivityManager.js** (86 lines) - Manages and displays recent activities within a simulation.

**components/simulation/SimulationAdminManager.js** (359 lines) - Admin controls for simulation creators including member management and settings.

**components/simulation/SimulationDisplayManager.js** (190 lines) - Main simulation information display with status, dates, and basic info.

**components/simulation/SimulationMemberManager.js** (274 lines) - Manages simulation members, member status, and member-related operations.

**components/simulation/SimulationPortfolioManager.js** (208 lines) - Handles portfolio display and management within simulation context.



## Admin Components

**components/admin/UserRoleManager.js** (320 lines) - Admin interface for managing user roles and permissions across the application.



## Utility Files

**utils/currency-utils.js** (194 lines) - Currency formatting, calculations, and financial number display utilities.

**utils/date-utils.js** (183 lines) - Date formatting, duration calculations, and time-related helper functions.

**utils/dom-utils.js** (514 lines) - DOM manipulation helpers, element selection, class management, and UI utilities.

**utils/math-utils.js** (379 lines) - Mathematical calculations for portfolio metrics, statistics, and financial computations.

**utils/string-utils.js** (310 lines) - String manipulation, formatting, validation, and text processing utilities.

**utils/validation-utils.js** (504 lines) - Form validation, input sanitization, and data validation helper functions.



## Constants

**constants/app-config.js** (112 lines) - Application configuration settings, API endpoints, and environment variables.

**constants/simulation-status.js** (69 lines) - Defines simulation states (pending, active, completed) and status-related constants.

**constants/trade-types.js** (54 lines) - Trading operation types (buy, sell) and trade-related constant definitions.

**constants/ui-messages.js** (147 lines) - User interface messages, error messages, and text constants for consistent messaging.



## Authentication Services

**services/auth/permission-service.js** (202 lines) - Handles user permissions, role-based access control, and authorization logic.



## Template Files (UI Components)

The template files contain reusable UI components and layouts:

**Portfolio Templates:**
- portfolio-main-layout.js, portfolio-holdings.js, portfolio-trade-history.js, portfolio-errors.js - Portfolio page layouts and components

**Research Templates:**
- research-main-layout.js, research-charts.js, research-news.js, research-search.js, research-stock-display.js, research-errors.js - Research page UI components

**Simulation Templates:**
- simulation-layout.js, simulation-modals.js, member-components.js, activity-components.js, portfolio-components.js, error-states.js, notification-components.js, ui-messages.js - Simulation-related UI components

**Trade Templates:**
- trade-main-layout.js, trade-order-form.js, trade-confirmation.js, trade-stock-lookup.js, trade-portfolio-selector.js, trade-recent-trades.js, trade-errors.js - Trading interface components

**Archive Templates:**
- archive-layout.js, archive-leaderboard.js, archive-export.js - Archive page components for completed simulations
