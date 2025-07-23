# Project Outline

## components/admin/UserRoleManager.js
- Lines: 320
- Functions: userIndex, originalRole
- Exports: 1
- Imports: ../../services/auth/permission-service.js, ../../services/firebase.js

## components/layout/Header.js
- Lines: 82
- Exports: 1

## components/layout/Navigation.js
- Lines: 52
- Functions: navItems
- Exports: 1

## components/research/ChartManager.js
- Lines: 235
- Functions: labels
- Exports: 1
- Imports: ../../templates/research/research-errors.js, ../../utils/dom-utils.js

## components/research/NewsManager.js
- Lines: 230
- Exports: 1
- Imports: ../../utils/date-utils.js, ../../utils/dom-utils.js, ../../templates/research/research-news.js, ../../templates/research/research-stock-display.js

## components/research/SearchManager.js
- Lines: 98
- Exports: 1
- Imports: ../../constants/app-config.js

## components/research/StockDataManager.js
- Lines: 141
- Exports: 1
- Imports: ../../utils/string-utils.js

## components/simulation/CreateSimulationModal.js
- Lines: 408
- Exports: 1
- Imports: ../../services/simulation.js, ../../services/auth.js

## components/simulation/EmailInviteModal.js
- Lines: 429
- Exports: 1
- Imports: ../../services/simulation.js, ../../services/auth.js, ../../utils/validation-utils.js

## components/simulation/JoinSimulationModal.js
- Lines: 374
- Exports: 1
- Imports: ../../services/simulation.js, ../../services/auth.js, ../../utils/string-utils.js, ../../utils/validation-utils.js

## components/simulation/LeaderboardManager.js
- Lines: 744
- Functions: rankingRows, totalVolume, totalReturns
- Exports: 1
- Imports: ../../utils/date-utils.js

## components/simulation/SimulationContentManager.js
- Lines: 600
- Functions: pricePromises, sortedTrades
- Exports: 1
- Imports: ../../constants/simulation-status.js, ../../constants/trade-types.js, ../../utils/date-utils.js, ../../utils/currency-utils.js, ../../utils/string-utils.js, ../../utils/dom-utils.js, ../../services/trading.js, ../../services/stocks.js, ../../templates/simulation/portfolio-components.js, ../../templates/portfolio/portfolio-errors.js, ../../templates/simulation/error-states.js

## components/simulation/SimulationMembershipManager.js
- Lines: 622
- Functions: activeMemberCount, removedMemberCount
- Exports: 1
- Imports: ../../constants/simulation-status.js, ../../constants/ui-messages.js, ../../templates/simulation/member-components.js, ../../templates/simulation/simulation-modals.js, ../../templates/simulation/error-states.js

## constants/app-config.js
- Lines: 112
- Exports: 12

## constants/simulation-status.js
- Lines: 69
- Exports: 6

## constants/trade-types.js
- Lines: 54
- Exports: 6

## constants/ui-messages.js
- Lines: 147
- Exports: 9

## main.js
- Lines: 198
- Class: App
  - Methods: constructor, initialize, setupComponents, setupRouting, loadView, updateNavigationActive, handleAuthStateChange, showApp, showError, initializePWA
- Imports: ./services/firebase.js, ./utils/router.js, ./services/auth.js, ./components/layout/Header.js, ./components/layout/Navigation.js, ./services/trading.js, ./utils/pwa-utils.js

## services/activity.js
- Lines: 485
- Functions: recentActivities, mostActiveUserId, mostActiveActivity, tradeActivities
- Exports: 1
- Imports: ./firebase.js, ../utils/date-utils.js

## services/auth/permission-service.js
- Lines: 202
- Exports: 4
- Imports: ../firebase.js, firebase/firestore

## services/auth.js
- Lines: 163
- Exports: 1
- Imports: firebase/firestore, ./firebase.js, ../constants/ui-messages.js

## services/firebase.js
- Lines: 62
- Exports: 3
- Imports: firebase/app, firebase/analytics, firebase/auth, firebase/firestore

## services/leaderboard.js
- Lines: 552
- Functions: batchPromises, buyTrades, sellTrades, averageReturn, userRanking
- Exports: 1
- Imports: ./firebase.js, ./trading.js, ./stocks.js

## services/simulation/simulation-core.js
- Lines: 254
- Exports: 6
- Imports: ../firebase.js, ../../constants/simulation-status.js

## services/simulation/simulation-management.js
- Lines: 820
- Functions: getDb, handleError, changes, activeMembers, removedMembers, tradeActivities, memberSimulationIds, toDate
- Exports: 14
- Imports: ../firebase.js, ../../constants/simulation-status.js, ./simulation-core.js, ../auth/permission-service.js, ../../utils/date-utils.js

## services/simulation/simulation-members.js
- Lines: 297
- Exports: 6
- Imports: ../firebase.js, ../../constants/simulation-status.js

## services/simulation/simulation-user-operations.js
- Lines: 173
- Functions: simulationIds, memberData
- Exports: 2
- Imports: ../firebase.js, ../../constants/simulation-status.js, ./simulation-members.js, ../../utils/date-utils.js

## services/simulation.js
- Lines: 222
- Exports: 1
- Imports: ./firebase.js

## services/stocks/stock-api.js
- Lines: 97
- Exports: 1
- Imports: ../../constants/app-config.js

## services/stocks/stock-cache.js
- Lines: 93
- Functions: cacheInfo, entries
- Exports: 1
- Imports: ../../constants/app-config.js

## services/stocks/stock-news.js
- Lines: 315
- Exports: 1
- Imports: ../../constants/app-config.js, ../../utils/date-utils.js, ../../utils/string-utils.js

## services/stocks/stock-quotes.js
- Lines: 505
- Functions: timestamps, closes, opens, highs, lows, volumes
- Exports: 1
- Imports: ../../utils/currency-utils

## services/stocks.js
- Lines: 177
- Exports: 1
- Imports: ./stocks/stock-news.js, ./stocks/stock-cache.js, ./stocks/stock-api.js, ./stocks/stock-quotes.js

## services/trading.js
- Lines: 475
- Exports: 9
- Imports: ./firebase, firebase/firestore, ../constants/trade-types.js, ../utils/date-utils.js, ../utils/validation-utils.js

## templates/archive/archive-export.js
- Lines: 54
- Exports: 3

## templates/archive/archive-layout.js
- Lines: 229
- Exports: 2
- Imports: ../../utils/currency-utils

## templates/archive/archive-leaderboard.js
- Lines: 95
- Exports: 2
- Imports: ../../utils/currency-utils

## templates/gains-templates.js
- Lines: 404
- Functions: formatCurrency, formatNumber, formatPercent, getColorClass
- Exports: 9

## templates/portfolio/portfolio-errors.js
- Lines: 34
- Exports: 2

## templates/portfolio/portfolio-holdings.js
- Lines: 119
- Exports: 3
- Imports: ../../utils/string-utils.js

## templates/portfolio/portfolio-main-layout.js
- Lines: 242
- Exports: 1
- Imports: ../../utils/currency-utils.js

## templates/portfolio/portfolio-trade-history.js
- Lines: 47
- Exports: 1
- Imports: ../../utils/date-utils.js, ../../utils/string-utils.js

## templates/research/research-charts.js
- Lines: 230
- Exports: 14

## templates/research/research-errors.js
- Lines: 22
- Exports: 1

## templates/research/research-main-layout.js
- Lines: 353
- Exports: 1

## templates/research/research-news.js
- Lines: 57
- Exports: 1

## templates/research/research-search.js
- Lines: 42
- Exports: 2

## templates/research/research-stock-display.js
- Lines: 22
- Exports: 1

## templates/simulation/activity-components.js
- Lines: 36
- Exports: 2

## templates/simulation/error-states.js
- Lines: 96
- Exports: 5

## templates/simulation/member-components.js
- Lines: 82
- Exports: 2
- Imports: ../../utils/date-utils.js, ../../utils/string-utils.js

## templates/simulation/notification-components.js
- Lines: 101
- Exports: 3

## templates/simulation/portfolio-components.js
- Lines: 127
- Exports: 4
- Imports: ../../utils/date-utils.js

## templates/simulation/simulation-layout.js
- Lines: 456
- Exports: 7

## templates/simulation/simulation-modals.js
- Lines: 509
- Functions: activeMembers, removedMembers, isCurrentUserCreator
- Exports: 2

## templates/simulation/ui-messages.js
- Lines: 182
- Exports: 2

## templates/trade/trade-confirmation.js
- Lines: 124

## templates/trade/trade-errors.js
- Lines: 132

## templates/trade/trade-main-layout.js
- Lines: 140
- Exports: 1

## templates/trade/trade-order-form.js
- Lines: 129

## templates/trade/trade-portfolio-selector.js
- Lines: 209

## templates/trade/trade-recent-trades.js
- Lines: 34
- Exports: 2
- Imports: ../../utils/currency-utils.js

## templates/trade/trade-stock-lookup.js
- Lines: 193

## utils/currency-utils.js
- Lines: 199
- Exports: 15

## utils/date-utils.js
- Lines: 248
- Exports: 17

## utils/dom-utils.js
- Lines: 948
- Exports: 58

## utils/math-utils.js
- Lines: 476
- Functions: validNumbers, wins, tickerTrades, tickerTrades
- Exports: 17

## utils/portfolio-debug.js
- Lines: 196
- Functions: userRanking
- Exports: 3
- Imports: ../services/leaderboard.js, ../services/trading.js, ../services/stocks.js

## utils/pwa-utils.js
- Lines: 376
- Exports: 2

## utils/router.js
- Lines: 60
- Exports: 1

## utils/string-utils.js
- Lines: 176
- Exports: 12

## utils/validation-utils.js
- Lines: 405
- Exports: 16

## views/auth.js
- Lines: 245
- Exports: 1
- Imports: ../services/auth.js, ../utils/validation-utils.js

## views/dashboard.js
- Lines: 491
- Functions: activeSimCount
- Exports: 1
- Imports: ../services/simulation.js, ../services/auth.js, ../components/simulation/CreateSimulationModal.js, ../components/simulation/JoinSimulationModal.js, ../components/simulation/EmailInviteModal.js, ../constants/simulation-status.js, ../utils/currency-utils.js

## views/portfolio.js
- Lines: 482
- Functions: totalVolume
- Exports: 1
- Imports: ../services/trading.js, ../services/auth.js, ../services/stocks.js, ../utils/math-utils.js, ../templates/portfolio/portfolio-main-layout.js, ../templates/portfolio/portfolio-trade-history.js, ../templates/portfolio/portfolio-errors.js

## views/research.js
- Lines: 337
- Exports: 1
- Imports: ../services/stocks.js, ../constants/app-config.js, ../constants/ui-messages.js, ../components/research/NewsManager.js, ../components/research/ChartManager.js, ../components/research/SearchManager.js, ../components/research/StockDataManager.js, ../templates/research/research-main-layout.js

## views/simulation-archive.js
- Lines: 289
- Exports: 1
- Imports: ../services/simulation.js, ../services/auth.js, ../constants/app-config.js

## views/simulation.js
- Lines: 1189
- Functions: userRanking, isCreator, userRanking
- Exports: 1
- Imports: ../services/simulation.js, ../services/auth.js, ../services/activity.js, ../services/leaderboard.js, ../services/trading.js, ../components/simulation/LeaderboardManager.js, ../components/simulation/SimulationContentManager.js, ../components/simulation/SimulationMembershipManager.js, ../constants/app-config.js, ../constants/simulation-status.js, ../utils/currency-utils.js, ../templates/simulation/ui-messages.js

## views/trade.js
- Lines: 528
- Functions: simPortfolio
- Exports: 1
- Imports: ../services/stocks.js, ../services/trading.js, ../services/simulation.js, ../services/auth.js, ../constants/trade-types.js, ../constants/ui-messages.js, ../templates/trade/trade-main-layout.js
