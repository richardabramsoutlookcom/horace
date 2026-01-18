# Codebase Concerns

**Analysis Date:** 2026-01-18

## Tech Debt

**Single-File Architecture:**
- Issue: All game logic (807 lines) in one file with no modules
- Files: `main.js`
- Impact: Difficult to maintain, test, or extend as complexity grows
- Fix approach: Split into modules (game state, rendering, input, audio, physics)

**Global Mutable State:**
- Issue: Game state scattered across multiple global-scope objects (`state`, `horace`, `vehicles`, `gates`, `obstacles`, etc.)
- Files: `main.js` (lines 36-66)
- Impact: Hard to reason about state changes, no encapsulation, difficult to implement save/load or multiplayer
- Fix approach: Consolidate into a single state manager or use a state machine pattern

**Magic Numbers Throughout:**
- Issue: Hard-coded values scattered throughout (e.g., `LOGICAL_W = 360`, `LOGICAL_H = 640`, speeds, sizes, timings)
- Files: `main.js` (lines 11-12, 54-57, 62, 68-78, 179-180, etc.)
- Impact: Difficult to tune gameplay, no centralized configuration
- Fix approach: Create a `CONFIG` object with all tunable parameters

**No Build System:**
- Issue: No bundler, transpiler, or minification
- Files: Root directory (missing `package.json`, build configs)
- Impact: No ES6+ module support, no TypeScript, no minification for production, no dependency management
- Fix approach: Add Vite or similar lightweight bundler

## Known Bugs

**Swipe Movement Bypasses Constraints During Ski Mode:**
- Symptoms: Swipe left/right movement in ski mode doesn't apply position constraints properly
- Files: `main.js` (lines 365-379)
- Trigger: Swipe left/right while skiing - handled by `handleSwipe()` but constraints not applied in `updateSki()`
- Workaround: Constraints applied in `handleSwipe()` function (line 700) but ski mode has separate logic

**Controls Hint Text Never Updates:**
- Symptoms: The `controls-hint` element is referenced in `resetGame()` but element doesn't exist in HTML
- Files: `main.js` (line 664), `index.html` (no matching element)
- Trigger: Game reset after game over
- Workaround: No functional impact - element is missing so nothing happens

**Audio Context May Not Initialize on iOS Safari:**
- Symptoms: Sound may not play on first interaction
- Files: `main.js` (lines 87-90)
- Trigger: iOS Safari requires user gesture to initialize AudioContext
- Workaround: `initAudio()` is called on control option click, but may fail silently

## Security Considerations

**No Input Sanitization:**
- Risk: While minimal for this game, any future text input would need sanitization
- Files: `main.js`
- Current mitigation: No user text input currently
- Recommendations: Add sanitization if chat/leaderboard features are added

**No Content Security Policy:**
- Risk: Vulnerable to XSS if hosted without proper headers
- Files: `index.html`
- Current mitigation: None
- Recommendations: Add CSP meta tag or server headers

## Performance Bottlenecks

**Rendering Every Frame Regardless of Changes:**
- Problem: Full canvas redraw every frame even when nothing changes
- Files: `main.js` (lines 614-638, 640-653)
- Cause: No dirty-checking or layered rendering
- Improvement path: Implement dirty rectangles or separate static/dynamic layers

**Linear Search for Collision Detection:**
- Problem: Every frame iterates all vehicles, gates, and obstacles for collision checks
- Files: `main.js` (lines 307-312, 383-402)
- Cause: No spatial partitioning
- Improvement path: For current scope (< 20 entities) this is acceptable; add spatial hashing if entity count grows

**No Object Pooling:**
- Problem: Vehicle and gate arrays recreated on each level reset
- Files: `main.js` (lines 152-173, 175-207)
- Cause: Arrays created fresh each reset
- Improvement path: Pool and reuse objects to reduce GC pressure

## Fragile Areas

**Game Mode Transitions:**
- Files: `main.js` (lines 321-334, 404-413)
- Why fragile: Complex state transitions between ROAD and SKI modes with multiple boolean flags (`skiEquipped`, `hasReturnedWithSkis`)
- Safe modification: Test all mode transitions after any change to update functions
- Test coverage: None - no automated tests exist

**Control Mode Handling:**
- Files: `main.js` (lines 244-286, 338-379, 719-786)
- Why fragile: Duplicated movement logic for keyboard vs swipe across multiple functions
- Safe modification: Changes must be made in both `updateRoad()` and `updateSki()` for each control mode
- Test coverage: None

**Canvas Coordinate System:**
- Files: `main.js` (lines 614-622)
- Why fragile: Complex transform calculations with DPR scaling, affects all drawing
- Safe modification: Any changes to scaling logic requires testing on multiple devices
- Test coverage: None

## Scaling Limits

**Entity Count:**
- Current capacity: ~12 vehicles, ~30 gates, ~16 obstacles
- Limit: Performance will degrade with hundreds of entities due to linear collision detection
- Scaling path: Add spatial partitioning if more entities needed

**Slope Length:**
- Current capacity: ~2200-3000 pixels
- Limit: Very long slopes would create many gates (memory) and require careful camera handling
- Scaling path: Current implementation handles well; chunk loading if much longer slopes needed

## Dependencies at Risk

**No External Dependencies:**
- This codebase has zero npm dependencies
- Uses only browser APIs: Canvas 2D, Web Audio API
- Risk: Low - no supply chain vulnerabilities
- Note: Also means no benefit from battle-tested libraries

## Missing Critical Features

**No Persistence:**
- Problem: High scores not saved
- Blocks: No leaderboard, no session continuity

**No Pause Functionality:**
- Problem: Game cannot be paused
- Blocks: Users cannot pause mid-game

**No Sound Toggle:**
- Problem: No way to mute audio
- Blocks: Accessibility, user preference

**No Accessibility:**
- Problem: No keyboard focus management, no ARIA labels, no screen reader support
- Blocks: Cannot be played by users with disabilities

## Test Coverage Gaps

**No Test Suite:**
- What's not tested: Everything - no test framework or tests exist
- Files: Entire codebase
- Risk: Any change could introduce regressions undetected
- Priority: High - should add at minimum: collision detection tests, state transition tests, input handling tests

**Critical Untested Paths:**
- Game over flow
- Mode transitions (ROAD -> SKI -> ROAD)
- Collision detection edge cases
- Audio initialization failures
- Resize handling
- Touch vs keyboard input switching

---

*Concerns audit: 2026-01-18*
