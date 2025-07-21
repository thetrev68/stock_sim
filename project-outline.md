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
- Lines: 232
- Functions: labels
- Exports: 1
- Imports: ../../templates/research/research-errors.js

## components/research/NewsManager.js
- Lines: 221
- Exports: 1
- Imports: ../../utils/date-utils.js, ../../templates/research/research-news.js, ../../templates/research/research-stock-display.js

## components/research/SearchManager.js
- Lines: 98
- Exports: 1
- Imports: ../../constants/app-config.js

## components/research/StockDataManager.js
- Lines: 136
- Exports: 1
- Imports: ../../utils/string-utils.js

## components/simulation/CreateSimulationModal.js
- Lines: 392
- Exports: 1
- Imports: ../../services/simulation.js, ../../services/auth.js

## components/simulation/EmailInviteModal.js
- Lines: 451
- Exports: 1
- Imports: ../../services/simulation.js, ../../services/auth.js

## components/simulation/JoinSimulationModal.js
- Lines: 362
- Exports: 1
- Imports: ../../services/simulation.js, ../../services/auth.js, ../../utils/string-utils.js

## components/simulation/LeaderboardOverview.js
- Lines: 352
- Functions: totalVolume
- Exports: 1

## components/simulation/LeaderboardTable.js
- Lines: 256
- Functions: rankingRows
- Exports: 1

## components/simulation/SimulationActivityManager.js
- Lines: 86
- Exports: 1
- Imports: ../../templates/simulation/error-states.js

## components/simulation/SimulationAdminManager.js
- Lines: 359
- Exports: 1
- Imports: ../../templates/simulation/simulation-modals.js, ../../constants/ui-messages.js

## components/simulation/SimulationDisplayManager.js
- Lines: 190
- Functions: userRanking
- Exports: 1
- Imports: ../../constants/simulation-status.js, ../../utils/date-utils.js, ../../utils/currency-utils.js, ../../utils/string-utils.js

## components/simulation/SimulationMemberManager.js
- Lines: 274
- Functions: activeMemberCount, removedMemberCount
- Exports: 1
- Imports: ../../constants/simulation-status.js, ../../templates/simulation/member-components.js, ../../templates/simulation/simulation-modals.js, ../../templates/simulation/error-states.js

## components/simulation/SimulationPortfolioManager.js
- Lines: 208
- Exports: 1
- Imports: ../../services/trading.js, ../../constants/trade-types.js, ../../utils/currency-utils.js, ../../templates/simulation/error-states.js

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
- Lines: 180
- Class: App
  - Methods: constructor, initialize, setupComponents, setupRouting, loadView, updateNavigationActive, handleAuthStateChange, showApp, showError
- Imports: ./services/firebase.js, ./utils/router.js, ./services/auth.js, ./components/layout/Header.js, ./components/layout/Navigation.js, ./services/trading.js

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
- Lines: 502
- Functions: pricePromises, buyTrades, sellTrades, totalVolume, averageReturn, userRanking
- Exports: 1
- Imports: ./firebase.js, ./trading.js, ./stocks.js

## services/simulation/simulation-core.js
- Lines: 255
- Exports: 6
- Imports: ../firebase.js, ../../constants/simulation-status.js, ../../utils/string-utils.js

## services/simulation/simulation-management.js
- Lines: 726
- Functions: getDb, handleError, changes, activeMembers, removedMembers, tradeActivities, memberSimulationIds, results, toDate
- Exports: 13
- Imports: ../firebase.js, ../../constants/simulation-status.js, ./simulation-core.js, ../auth/permission-service.js

## services/simulation/simulation-members.js
- Lines: 297
- Exports: 6
- Imports: ../firebase.js, ../../constants/simulation-status.js

## services/simulation/simulation-user-operations.js
- Lines: 176
- Functions: simulationIds, memberData
- Exports: 2
- Imports: ../firebase.js, ../../constants/simulation-status.js, ./simulation-members.js

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
- Lines: 311
- Exports: 1
- Imports: ../../constants/app-config.js, ../../utils/date-utils.js, ../../utils/string-utils.js

## services/stocks/stock-quotes.js
- Lines: 503
- Functions: timestamps, closes, opens, highs, lows, volumes
- Exports: 1

## services/stocks.js
- Lines: 177
- Exports: 1
- Imports: ./stocks/stock-news.js, ./stocks/stock-cache.js, ./stocks/stock-api.js, ./stocks/stock-quotes.js

## services/trading.js
- Lines: 455
- Exports: 9
- Imports: ./firebase, firebase/firestore, ../constants/trade-types.js

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

## templates/portfolio/portfolio-errors.js
- Lines: 34
- Exports: 2

## templates/portfolio/portfolio-holdings.js
- Lines: 119
- Exports: 3
- Imports: ../../utils/string-utils.js

## templates/portfolio/portfolio-main-layout.js
- Lines: 241
- Exports: 1
- Imports: ../../utils/currency-utils.js

## templates/portfolio/portfolio-trade-history.js
- Lines: 48
- Exports: 1
- Imports: ../../utils/string-utils.js

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
- Lines: 52
- Exports: 2

## templates/simulation/simulation-layout.js
- Lines: 411
- Exports: 7

## templates/simulation/simulation-modals.js
- Lines: 444
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
- Lines: 32
- Exports: 2

## templates/trade/trade-stock-lookup.js
- Lines: 193

## utils/currency-utils.js
- Lines: 194
- Exports: 14

## utils/date-utils.js
- Lines: 183
- Exports: 12

## utils/dom-utils.js
- Lines: 514
- Exports: 34

## utils/math-utils.js
- Lines: 379
- Functions: validNumbers, validNumbers, sorted, wins, squaredDifferences
- Exports: 28

## utils/router.js
- Lines: 60
- Exports: 1

## utils/string-utils.js
- Lines: 310
- Exports: 22

## utils/validation-utils.js
- Lines: 504
- Exports: 19

## views/auth.js
- Lines: 247
- Exports: 1
- Imports: ../services/auth.js

## views/dashboard.js
- Lines: 503
- Functions: activeSimCount
- Exports: 1
- Imports: ../services/simulation.js, ../services/auth.js, ../components/simulation/CreateSimulationModal.js, ../components/simulation/JoinSimulationModal.js, ../components/simulation/EmailInviteModal.js, ../constants/simulation-status.js

## views/portfolio.js
- Lines: 405
- Functions: totalVolume
- Exports: 1
- Imports: ../services/trading.js, ../services/auth.js, ../services/stocks.js, ../templates/portfolio/portfolio-main-layout.js, ../templates/portfolio/portfolio-trade-history.js, ../templates/portfolio/portfolio-errors.js

## views/research.js
- Lines: 337
- Exports: 1
- Imports: ../services/stocks.js, ../constants/app-config.js, ../constants/ui-messages.js, ../utils/string-utils.js, ../components/research/NewsManager.js, ../components/research/ChartManager.js, ../components/research/SearchManager.js, ../components/research/StockDataManager.js, ../templates/research/research-main-layout.js

## views/simulation-archive.js
- Lines: 289
- Exports: 1
- Imports: ../services/simulation.js, ../services/auth.js, ../constants/app-config.js

## views/simulation.js
- Lines: 1085
- Functions: userRanking, isCreator
- Exports: 1
- Imports: ../services/simulation.js, ../services/auth.js, ../services/activity.js, ../services/leaderboard.js, ../components/simulation/LeaderboardOverview.js, ../components/simulation/LeaderboardTable.js, ../components/simulation/SimulationAdminManager.js, ../components/simulation/SimulationPortfolioManager.js, ../components/simulation/SimulationMemberManager.js, ../components/simulation/SimulationActivityManager.js, ../components/simulation/SimulationDisplayManager.js, ../constants/app-config.js, ../constants/simulation-status.js, ../templates/simulation/ui-messages.js

## views/trade.js
- Lines: 528
- Functions: simPortfolio
- Exports: 1
- Imports: ../services/stocks.js, ../services/trading.js, ../services/simulation.js, ../services/auth.js, ../constants/trade-types.js, ../constants/ui-messages.js, ../utils/string-utils.js, ../templates/trade/trade-main-layout.js
