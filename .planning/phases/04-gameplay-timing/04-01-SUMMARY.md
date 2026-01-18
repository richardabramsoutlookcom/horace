---
phase: 04-gameplay-timing
plan: 01
subsystem: gameplay
tags: [timing, fixed-timestep, movement, 50hz, discrete-steps]

# Dependency graph
requires:
  - phase: 03-authentic-audio
    provides: Sound effects and beeper audio system
provides:
  - 50Hz fixed timestep game loop (authentic PAL timing)
  - Discrete step-based road crossing movement
  - Accumulator pattern for consistent updates
affects: [04-02, 04-03, all-future-gameplay]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Fixed timestep accumulator pattern for consistent 50Hz updates
    - Discrete step movement with cooldown for key-held behavior

key-files:
  created: []
  modified:
    - main.js

key-decisions:
  - "FIXED_DT = 1/50 (0.02s) for authentic 50Hz PAL timing"
  - "ROAD_STEP_SIZE = 16px (one cell height) for discrete movement"
  - "stepCooldown = 0.12s (8 steps per second when holding key)"
  - "Ski mode keeps continuous movement (downhill skiing is smooth, not steppy)"

patterns-established:
  - "Fixed timestep: accumulator += frameDt; while (accumulator >= FIXED_DT) { update(); accumulator -= FIXED_DT; }"
  - "Discrete step: cooldown check before movement, immediate position change, reset cooldown on move"

# Metrics
duration: 2min
completed: 2026-01-18
---

# Phase 4 Plan 1: Fixed Timestep & Discrete Movement Summary

**50Hz fixed timestep game loop with discrete 16px step-based road crossing movement for authentic ZX Spectrum feel**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-18T17:12:27Z
- **Completed:** 2026-01-18T17:13:57Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Implemented 50Hz fixed timestep game loop using accumulator pattern
- Converted road crossing to discrete 16px step movement
- Maintained smooth continuous movement for ski mode
- Game now feels snappy and predictable like original ZX Spectrum

## Task Commits

Each task was committed atomically:

1. **Task 1: Convert to 50Hz fixed timestep** - `fe2cc9a` (feat)
2. **Task 2: Implement discrete step movement for road crossing** - `a745dbd` (feat)

**Plan metadata:** (see below)

## Files Created/Modified

- `main.js` - Added FIXED_DT constant, accumulator variable, fixed timestep loop pattern, ROAD_STEP_SIZE constant, stepCooldown variable, discrete step movement logic

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| FIXED_DT = 1/50 | Authentic 50Hz PAL timing from original ZX Spectrum |
| ROAD_STEP_SIZE = 16px | One attribute cell height for discrete, predictable movement |
| stepCooldown = 0.12s | 8 steps per second when holding key feels responsive but not too fast |
| Ski mode stays continuous | Downhill skiing should feel smooth, not steppy |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation was straightforward.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Fixed timestep foundation ready for all timing-dependent gameplay
- Discrete movement system ready for other game mechanics
- Ready for 04-02 (Ski Rental Economy) and 04-03 (Gates & Scoring)

---
*Phase: 04-gameplay-timing*
*Completed: 2026-01-18*
