# Coding Conventions

**Analysis Date:** 2026-01-18

## Naming Patterns

**Files:**
- Lowercase with extension: `main.js`, `style.css`, `index.html`
- Single-file architecture: all game logic in one JavaScript file

**Functions:**
- camelCase for all functions: `resetRoad()`, `updateSki()`, `drawHorace()`
- Verbs as prefixes: `init*`, `play*`, `reset*`, `update*`, `draw*`, `bind*`, `setup*`, `handle*`
- Boolean-returning functions: `is*` prefix: `isHoraceInShop()`

**Variables:**
- camelCase for variables: `touchStartX`, `slopeLength`, `shopScored`
- SCREAMING_SNAKE_CASE for constants: `LOGICAL_W`, `LOGICAL_H`, `MODE`
- Single-letter variables acceptable in small scopes: `x`, `y`, `dt`, `i`, `v`

**DOM Elements:**
- Suffix with `El`: `scoreEl`, `livesEl`, `modeEl`, `messageEl`, `overlayEl`, `rotateEl`

**Objects/State:**
- Descriptive nouns: `horace`, `state`, `input`, `roadLayout`, `shopRect`, `pavementRect`

## Code Style

**Formatting:**
- No automated formatter detected
- 2-space indentation
- Semicolons used consistently
- Double quotes for strings

**Linting:**
- No ESLint or other linter configured
- Code follows consistent manual style

**Line Length:**
- Generally under 100 characters
- Longer lines for complex expressions

## Import Organization

**No imports:** This is a vanilla JavaScript codebase with no module system.
- All code wrapped in IIFE: `(() => { ... })()`
- No external dependencies
- All code in single file

## Error Handling

**Patterns:**
- Guard clauses for early returns: `if (!audioContext) return;`
- Null checks before operations
- No try/catch blocks (simple game logic)
- Defensive bounds checking: `Math.max()`, `Math.min()` for clamping values

**Examples:**
```javascript
// Guard clause pattern
function playBeep(freq, duration, volume = 0.08) {
  if (!audioContext) return;
  // ... rest of function
}

// Bounds clamping
horace.x = Math.max(0, Math.min(LOGICAL_W - horace.w, horace.x));
```

## Logging

**Framework:** None (browser console only)

**Patterns:**
- No console.log statements in codebase
- Silent operation in production

## Comments

**When to Comment:**
- Inline comments for non-obvious logic
- Section dividers within large blocks

**Examples:**
```javascript
// Handle movement based on control mode
if (controlMode === 'keyboard') {
  // Keyboard: All 4 directions with acceleration
  ...
}

// Car body
ctx.fillStyle = mainColor;

// Eyes (white)
ctx.fillStyle = whiteColor;
```

**JSDoc/TSDoc:**
- Not used (vanilla JS without documentation comments)

## Function Design

**Size:**
- Functions range from 3-80 lines
- Larger functions for complex drawing (`drawRoad`: ~60 lines) and game update loops
- Helper functions kept small (5-15 lines)

**Parameters:**
- Positional parameters preferred
- Default parameters used: `function playBeep(freq, duration, volume = 0.08)`
- `dt` (delta time) passed to update functions

**Return Values:**
- Most functions return void (side effects)
- Boolean returns for collision detection functions
- Early returns for guard clauses

## Module Design

**Exports:**
- None (IIFE pattern, no exports)
- All state and functions private to IIFE scope

**Structure:**
- Constants and state declarations at top
- Audio functions grouped together
- Update functions grouped (updateRoad, updateSki)
- Draw functions grouped (drawRoad, drawSki, drawHorace)
- Input binding at end
- Single `start()` entry point

## Game-Specific Conventions

**State Management:**
- Global `state` object for game state
- Global `horace` object for player state
- Global `input` object for input state
- Module-level arrays for entities: `vehicles`, `gates`, `obstacles`

**Game Loop Pattern:**
```javascript
function loop(timestamp) {
  // Calculate delta time
  const dt = Math.min(0.04, (timestamp - state.lastTime) / 1000);
  state.lastTime = timestamp;

  // Update game state
  if (state.mode === MODE.ROAD) updateRoad(dt);
  if (state.mode === MODE.SKI) updateSki(dt);

  // Render
  draw(dt);
  updateHUD();

  // Continue loop
  requestAnimationFrame(loop);
}
```

**Collision Detection:**
- Rectangle overlap: `rectOverlap(a, b)` function
- Circle-rectangle overlap: `circleRectOverlap(c, r)` function

**Sound Effects:**
- Web Audio API oscillators
- `play*` functions for each sound type

**Canvas Drawing:**
- Context transforms for scaling
- Immediate mode drawing (no retained graphics)
- Pixel-perfect retro style coordinates

## CSS Conventions

**Custom Properties:**
- CSS variables for theming in `:root`
- Descriptive names: `--bg-1`, `--road`, `--accent`, `--danger`

**Selectors:**
- ID selectors for unique elements: `#game`, `#hud`, `#overlay`
- Class selectors for reusable components: `.control-option`

**Responsive Design:**
- Media query for mobile: `@media (max-width: 600px)`
- Viewport units: `vw`, `vh`
- Flexible sizing with percentages

---

*Convention analysis: 2026-01-18*
