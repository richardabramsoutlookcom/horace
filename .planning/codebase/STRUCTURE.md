# Codebase Structure

**Analysis Date:** 2026-01-18

## Directory Layout

```
horace/
├── .claude/            # Claude AI configuration
├── .git/               # Git repository data
├── .planning/          # Planning documents
│   └── codebase/       # Codebase analysis documents
├── index.html          # HTML entry point and DOM structure
├── main.js             # All game logic, rendering, and input handling
└── style.css           # UI styling and layout
```

## Directory Purposes

**.planning/codebase/:**
- Purpose: Stores codebase analysis documents for development planning
- Contains: Architecture, structure, conventions, testing documentation
- Key files: `ARCHITECTURE.md`, `STRUCTURE.md`

## Key File Locations

**Entry Points:**
- `index.html`: HTML document loaded by browser, contains canvas and UI elements
- `main.js`: JavaScript entry point, IIFE executes on script load

**Configuration:**
- `style.css`: CSS custom properties (`:root` variables) define color scheme

**Core Logic:**
- `main.js`: Contains all game code in a single 807-line file

**Testing:**
- None: No test files present in codebase

## File Contents Breakdown

**`index.html` (40 lines):**
- Document structure and meta tags
- Canvas element (`#game`) for rendering
- HUD container (`#hud`) with score, lives, mode displays
- Message overlay (`#message`) for notifications
- Start screen overlay (`#overlay`) with control selection
- Rotation warning (`#rotate`) for mobile landscape

**`main.js` (807 lines):**
- Lines 1-66: Constants, state objects, entity definitions
- Lines 87-137: Audio functions (Web Audio API sound effects)
- Lines 138-227: Game reset and life management functions
- Lines 231-335: Road mode update logic
- Lines 337-414: Ski mode update logic
- Lines 416-440: Collision detection utilities
- Lines 442-505: Road rendering
- Lines 507-560: Ski slope rendering
- Lines 562-602: Horace (player) sprite rendering
- Lines 604-638: HUD and main draw function
- Lines 640-653: Main game loop
- Lines 655-666: Game reset function
- Lines 669-679: Orientation and resize handlers
- Lines 681-717: Swipe gesture handling
- Lines 719-786: Input binding (keyboard and touch)
- Lines 790-806: Start function and initialization

**`style.css` (172 lines):**
- Lines 1-14: CSS custom properties (color theme)
- Lines 15-56: Base layout and canvas styling
- Lines 58-107: HUD, message, and overlay styling
- Lines 109-145: Control selection UI styling
- Lines 147-162: Rotation warning overlay
- Lines 166-171: Mobile responsive adjustments

## Naming Conventions

**Files:**
- Lowercase with extension: `main.js`, `style.css`, `index.html`
- No multi-word file names in current codebase

**Functions:**
- camelCase: `drawRoad`, `updateSki`, `handleSwipe`, `resetGame`
- Prefixes: `draw*` for rendering, `update*` for logic, `play*` for audio, `reset*` for initialization

**Variables:**
- camelCase for locals and globals: `controlMode`, `audioContext`, `touchStartX`
- UPPER_SNAKE_CASE for constants: `LOGICAL_W`, `LOGICAL_H`, `MODE`

**DOM Elements:**
- kebab-case IDs: `#game`, `#hud`, `#overlay`, `#control-select`
- kebab-case classes: `.control-option`, `.option-title`, `.option-desc`

## Where to Add New Code

**New Game Feature:**
- Primary code: Add to `main.js` within the IIFE
- Update functions: Add near existing `updateRoad`/`updateSki` functions (lines 231-414)
- Draw functions: Add near existing `drawRoad`/`drawSki` functions (lines 442-560)
- New entities: Define near existing entity objects (lines 48-66)

**New Game Mode:**
- Add to `MODE` object: `main.js` line 14-18
- Add update function: Similar to `updateRoad`/`updateSki`
- Add draw function: Similar to `drawRoad`/`drawSki`
- Add mode transition logic in existing update functions

**New UI Element:**
- HTML structure: `index.html` within `#app` container
- Styling: `style.css` following existing patterns
- JavaScript interaction: `main.js` within `bindInput` or new handler

**New Sound Effect:**
- Add function near existing audio functions: `main.js` lines 92-137
- Pattern: Use `playBeep` helper or create custom oscillator

**New Control Scheme:**
- Add option to `#control-select` in `index.html`
- Add handlers in `bindInput` function: `main.js` lines 719-786
- Add mode-specific logic in update functions

## Special Directories

**.git/:**
- Purpose: Git version control data
- Generated: Yes (by git)
- Committed: No (meta-directory)

**.planning/:**
- Purpose: Development planning and documentation
- Generated: No (manually created)
- Committed: Optional (project preference)

**.claude/:**
- Purpose: Claude AI assistant configuration
- Generated: No (manually created)
- Committed: Optional (project preference)

---

*Structure analysis: 2026-01-18*
