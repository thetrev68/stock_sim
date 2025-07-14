# Project Outline

## components/layout/Header.js
- Lines: 82
- Exports: 1

## components/layout/Navigation.js
- Lines: 52
- Functions: navItems
- Exports: 1

## components/simulation/CreateSimulationModal.js
- Lines: 390
- Exports: 1
- Imports: ../../services/simulation.js, ../../services/auth.js

## components/simulation/EmailInviteModal.js
- Lines: 451
- Exports: 1
- Imports: ../../services/simulation.js, ../../services/auth.js

## components/simulation/JoinSimulationModal.js
- Lines: 362
- Exports: 1
- Imports: ../../services/simulation.js, ../../services/auth.js

## components/simulation/LeaderboardOverview.js
- Lines: 345
- Functions: totalVolume
- Exports: 1

## components/simulation/LeaderboardTable.js
- Lines: 252
- Functions: rankingRows
- Exports: 1

## counter.js
- Lines: 10
- Functions: setCounter
- Exports: 1

## main.js
- Lines: 180
- Class: App
  - Methods: constructor, initialize, setupComponents, setupRouting, loadView, updateNavigationActive, handleAuthStateChange, showApp, showError
- Imports: ./services/firebase.js, ./utils/router.js, ./services/auth.js, ./components/layout/Header.js, ./components/layout/Navigation.js, ./services/trading.js

## services/activity.js
- Lines: 478
- Functions: recentActivities, mostActiveUserId, mostActiveActivity, tradeActivities
- Exports: 1
- Imports: ./firebase.js

## services/auth.js
- Lines: 98
- Exports: 1
- Imports: ./firebase.js

## services/firebase.js
- Lines: 62
- Exports: 3
- Imports: firebase/app, firebase/analytics, firebase/auth, firebase/firestore

## services/leaderboard.js
- Lines: 504
- Functions: pricePromises, buyTrades, sellTrades, totalVolume, averageReturn, userRanking
- Exports: 1
- Imports: ./firebase.js, ./trading.js, ./stocks.js

## services/simulation.js
- Lines: 1245
- Functions: activeMembers, removedMembers, tradeActivities, memberSimulationIds, results, simulationIds, memberData
- Exports: 1
- Imports: ./firebase.js

## services/stocks.js
- Lines: 967
- Functions: filteredNews, timestamps, closes, opens, highs, lows, volumes, cacheInfo, entries
- Exports: 1

## services/trading.js
- Lines: 445
- Exports: 9
- Imports: ./firebase, firebase/firestore

## utils/router.js
- Lines: 60
- Exports: 1

## views/auth.js
- Lines: 221
- Exports: 1
- Imports: ../services/auth.js

## views/dashboard.js
- Lines: 485
- Functions: activeSimCount
- Exports: 1
- Imports: ../services/simulation.js, ../services/auth.js, ../components/simulation/CreateSimulationModal.js, ../components/simulation/JoinSimulationModal.js, ../components/simulation/EmailInviteModal.js

## views/portfolio.js
- Lines: 716
- Functions: totalVolume
- Exports: 1
- Imports: ../services/trading.js, ../services/auth.js, ../services/stocks.js

## views/research.js
- Lines: 1312
- Functions: labels
- Exports: 1
- Imports: ../services/stocks.js

## views/simulation-archive.js
- Lines: 544
- Exports: 1
- Imports: ../services/simulation.js, ../services/auth.js

## views/simulation.js
- Lines: 2235
- Functions: userRanking, isCreator, activeMemberCount, removedMemberCount, isCreator
- Exports: 1
- Imports: ../services/simulation.js, ../services/auth.js, ../services/activity.js, ../services/leaderboard.js, ../components/simulation/LeaderboardOverview.js, ../components/simulation/LeaderboardTable.js, ../services/trading.js

## views/trade.js
- Lines: 647
- Functions: simPortfolio
- Exports: 1
- Imports: ../services/stocks.js, ../services/trading.js, ../services/simulation.js, ../services/auth.js
