---
phase: 04-gameplay-timing
plan: 03
subsystem: gameplay
tags: [scoring, collision, ski-mechanics, jump]

requires:
  - phase: 04-gameplay-timing/02
    provides: Money system for economic pressure
provides:
  - Authentic gate miss scoring (penalty not death)
  - Variable tree collision outcomes
  - Ski jump mechanic for obstacle avoidance
  - Correct finish line bonus (100 points)
affects: [05-polish]

tech-stack:
  added: []
  patterns:
    - Variable outcome collision (probability-based)
    - Jump state with timer for invulnerability window

key-files:
  created: []
  modified:
    - main.js

key-decisions:
  - "Gate miss deducts 10 points, doesn't lose life"
  - "30% bounce / 70% crash probability on tree collision"
  - "Jump lasts 0.3 seconds, skips tree collision"
  - "Finish bonus 100 points (not 150)"

patterns-established:
  - "Hit tracking on obstacles to prevent repeat collision"

duration: 1min
completed: 2026-01-18
---

# Phase 04 Plan 03: Scoring & Collision Fix Summary

**Authentic gate/tree behavior: gate miss is point penalty only, tree collision has 30% bounce chance, jump mechanic for skillful avoidance**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-18T17:15:49Z
- **Completed:** 2026-01-18T17:17:09Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Gate miss now deducts 10 points instead of losing a life (GAME-05)
- Finish line bonus corrected from 150 to 100 points (GAME-07)
- Tree collision has variable outcome: 30% lucky bounce, 70% crash (GAME-08)
- Ski jump mechanic added with space bar trigger
- Jump duration 0.3s allows jumping over trees

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix gate miss and finish bonus scoring** - `3c251b1` (feat)
2. **Task 2: Implement variable tree collision outcome** - `4eb60bd` (feat)

## Files Created/Modified
- `main.js` - Gate scoring fix, jump state/mechanic, variable tree collision

## Decisions Made
- **Gate miss = point penalty only:** Original game didn't lose life for missing gates
- **30/70 bounce/crash split:** Creates unpredictability matching original game feel
- **Jump duration 0.3s:** Long enough to clear obstacles, short enough to require timing
- **Finish bonus 100 (not 150):** Matches authentic original game values

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 4 (Gameplay & Timing) complete
- All core gameplay mechanics now match original ZX Spectrum behavior
- Ready for Phase 5 (Polish)

---
*Phase: 04-gameplay-timing*
*Completed: 2026-01-18*
