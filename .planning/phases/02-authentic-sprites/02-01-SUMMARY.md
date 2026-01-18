---
phase: 02-authentic-sprites
plan: 01
subsystem: rendering
tags: [sprites, pixel-art, horace, zx-spectrum, character]

# Dependency graph
requires:
  - phase: 01-01
    provides: ZX_PALETTE constant and palette-based rendering
  - phase: 01-02
    provides: Attribute buffer system for color tracking
provides:
  - HORACE_SPRITE pixel data constant (16x20 sprite)
  - Pixel-based sprite rendering in drawHorace()
  - Authentic Horace character appearance (blue blob, white eyes, stumpy legs)
affects: [02-02, 02-03, 05-presentation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Sprite data as 2D array with color indices
    - Pixel-by-pixel rendering loop
    - Color substitution for body color variations

key-files:
  created: []
  modified:
    - main.js

key-decisions:
  - "16x20 pixel sprite size fits within 2x3 attribute blocks"
  - "Color indices: 0=transparent, 1=body, 2=eyes, 3=pupils"
  - "Body color dynamically switches: BRIGHT_BLUE normally, BRIGHT_GREEN when skiing"

patterns-established:
  - "Sprite data stored as const with width, height, pixel array, colors array"
  - "Render loop iterates row-by-row, column-by-column, skipping transparent pixels"
  - "Entity dimensions reference sprite constants (horace.w = HORACE_SPRITE.width)"

# Metrics
duration: 5min
completed: 2026-01-18
---

# Phase 2 Plan 1: Horace Sprite Summary

**Authentic 16x20 pixel Horace character sprite with big white eyes, blue blob body, and stumpy legs rendered via pixel data**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-18T13:53:11Z
- **Completed:** 2026-01-18T13:57:54Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Created HORACE_SPRITE constant with authentic 16x20 pixel character design
- Implemented pixel-by-pixel sprite rendering replacing procedural rectangle drawing
- Horace now displays with iconic appearance: rounded head, large white eyes with black pupils, blob body, stumpy legs and feet
- Sprite dynamically changes color: blue normally, green when skiing

## Task Commits

Each task was committed atomically:

1. **Task 1: Define Horace sprite pixel data** - `6b25bac` (feat)
2. **Task 2: Update drawHorace() to render from pixel data** - `ec04247` (feat)

## Files Created/Modified

- `main.js` - Added HORACE_SPRITE constant, updated horace object dimensions, replaced drawHorace() with pixel rendering loop, updated reset functions to use sprite dimensions

## Decisions Made

1. **16x20 sprite dimensions** - Fits within 2x3 attribute blocks while providing enough detail for the iconic Horace appearance
2. **Color index mapping** - 0=transparent, 1=body (dynamic), 2=white eyes, 3=black pupils allows body color to change contextually
3. **Dynamic body color** - BRIGHT_BLUE for normal gameplay, BRIGHT_GREEN when skiing, matching original game behavior

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Horace sprite foundation complete with authentic pixel appearance
- Ready for additional animation frames (walking animation)
- Vehicle and tree sprite upgrades can follow same pixel data pattern
- Color substitution pattern established for dynamic coloring

---
*Phase: 02-authentic-sprites*
*Completed: 2026-01-18*
