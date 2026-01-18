# Testing Patterns

**Analysis Date:** 2026-01-18

## Test Framework

**Runner:**
- None configured

**Assertion Library:**
- None

**Run Commands:**
```bash
# No test commands available
# Project has no test infrastructure
```

## Test File Organization

**Location:**
- No test files exist in the codebase

**Naming:**
- N/A

**Structure:**
- N/A

## Test Structure

**Suite Organization:**
- Not applicable - no tests exist

**Patterns:**
- None established

## Mocking

**Framework:** None

**Patterns:**
- No mocking infrastructure

**What to Mock (if tests were added):**
- `window.AudioContext` / `window.webkitAudioContext`
- `requestAnimationFrame`
- `performance.now()`
- Canvas 2D context methods
- DOM element access (`document.getElementById`)
- Touch events and keyboard events

**What NOT to Mock:**
- Pure math functions (`rectOverlap`, `circleRectOverlap`)
- State calculations

## Fixtures and Factories

**Test Data:**
- None

**Location:**
- N/A

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
# No coverage tooling configured
```

## Test Types

**Unit Tests:**
- Not implemented
- Candidate functions for unit testing:
  - `rectOverlap(a, b)` - collision detection
  - `circleRectOverlap(c, r)` - collision detection
  - `isHoraceInShop()` - position checking
  - State reset functions

**Integration Tests:**
- Not implemented
- Could test game state transitions (ROAD -> SKI -> ROAD)

**E2E Tests:**
- Not implemented
- Could use Playwright/Puppeteer for browser automation

## Recommended Testing Approach

If tests were to be added to this project:

**Suggested Framework:**
- Vitest (modern, fast, no bundler needed)
- Or Jest with jsdom

**Suggested Structure:**
```
horace/
├── main.js
├── __tests__/
│   ├── collision.test.js
│   ├── state.test.js
│   └── game-loop.test.js
```

**Priority Test Candidates:**

1. **Collision Detection** (pure functions, easy to test):
```javascript
// Example test structure
describe('rectOverlap', () => {
  it('returns true when rectangles overlap', () => {
    const a = { x: 0, y: 0, w: 10, h: 10 };
    const b = { x: 5, y: 5, w: 10, h: 10 };
    expect(rectOverlap(a, b)).toBe(true);
  });

  it('returns false when rectangles do not overlap', () => {
    const a = { x: 0, y: 0, w: 10, h: 10 };
    const b = { x: 20, y: 20, w: 10, h: 10 };
    expect(rectOverlap(a, b)).toBe(false);
  });
});
```

2. **Circle-Rectangle Collision**:
```javascript
describe('circleRectOverlap', () => {
  it('detects circle inside rectangle', () => {
    const circle = { x: 50, y: 50, r: 5 };
    const rect = { x: 40, y: 40, w: 20, h: 20 };
    expect(circleRectOverlap(circle, rect)).toBe(true);
  });
});
```

3. **State Transitions**:
```javascript
describe('game state transitions', () => {
  it('transitions from ROAD to SKI when reaching bottom with skis', () => {
    // Setup state with skis equipped
    // Trigger transition condition
    // Assert mode changed to SKI
  });
});
```

## Blocking Issues for Testing

1. **IIFE Wrapper:** All code is wrapped in an IIFE, making functions inaccessible for testing
   - Would need to refactor to export testable functions
   - Or extract pure functions to separate module

2. **Global State:** Heavy reliance on module-level variables
   - Would need to inject state for testing
   - Or refactor to pass state as parameters

3. **DOM Dependencies:** Many functions directly access DOM elements
   - Would need jsdom or similar environment
   - Or mock DOM methods

4. **No Build System:** No package.json or build tooling
   - Would need to add npm/package.json first
   - Then add test runner as dev dependency

## Manual Testing

Current testing approach is manual:

1. Open `index.html` in browser
2. Select keyboard or swipe controls
3. Play through game scenarios:
   - Cross road successfully
   - Get hit by car
   - Rent skis from shop
   - Complete ski run
   - Miss gate during ski run
   - Hit obstacle during ski run
   - Lose all lives (game over)
4. Test both control modes (keyboard and swipe)
5. Test orientation change on mobile

---

*Testing analysis: 2026-01-18*
