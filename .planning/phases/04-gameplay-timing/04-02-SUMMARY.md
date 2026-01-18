---
phase: 04-gameplay-timing
plan: 02
subsystem: gameplay
tags: [economy, money, hud, state]

requires:
  - phase: 04-gameplay-timing/01
    provides: Fixed timestep game loop for consistent timing
provides:
  - Authentic money system with $40 start
  - Ambulance fee ($10) on collision
  - Ski rental cost ($10) with insufficient funds check
  - 1000-point boundary bonuses ($10)
  - Money display in HUD
affects: [05-polish]

tech-stack:
  added: []
  patterns:
    - Threshold tracking for score-based bonuses
    - Resource gating for gameplay features

key-files:
  created: []
  modified:
    - main.js
    - index.html

key-decisions:
  - "Ski rental blocked when money < $10 (shows warning message)"
  - "Ambulance fee deducted even if money goes negative"
  - "Bonus threshold tracked separately from score for accurate boundary detection"

patterns-established:
  - "checkPointBonus() pattern for score-triggered rewards"

duration: 2min
completed: 2026-01-18
---

# Phase 04 Plan 02: Money System Summary

**Authentic ZX Spectrum economy: $40 start, $10 ambulance fees, $10 ski rental, $10 bonuses at 1000-point boundaries**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-18T17:12:30Z
- **Completed:** 2026-01-18T17:14:38Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Money state added with $40 starting amount and HUD display
- Ambulance fee ($10) deducted on every collision
- Ski rental costs $10 with insufficient funds protection
- $10 bonus awarded at every 1000-point boundary (1000, 2000, 3000...)
- All money mechanics reset properly on game restart

## Task Commits

Each task was committed atomically:

1. **Task 1: Add money state and HUD display** - `25aab52` (feat)
2. **Task 2: Implement money costs and bonuses** - `40bae31` (feat)

## Files Created/Modified
- `main.js` - Added money state, checkPointBonus function, cost/bonus logic
- `index.html` - Added money element to HUD

## Decisions Made
- **Ski rental blocked when insufficient funds:** Shows "Need $10 for skis!" message instead of silently failing
- **Ambulance fee always charged:** Even if money goes negative, this matches original game pressure
- **Separate threshold tracking:** Using `lastBonusThreshold` variable to accurately detect crossing 1000-point boundaries

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Money system complete and integrated with existing gameplay
- Economic pressure creates authentic gameplay tension
- Ready for Phase 4 Plan 03 (ski mechanics) or Phase 5 (Polish)

---
*Phase: 04-gameplay-timing*
*Completed: 2026-01-18*
