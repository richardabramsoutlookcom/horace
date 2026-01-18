# Architecture

**Analysis Date:** 2026-01-18

## Pattern Overview

**Overall:** Single-Page Canvas Game with Game Loop Pattern

**Key Characteristics:**
- Immediate-mode rendering via HTML5 Canvas 2D API
- State-driven game logic with mode-based updates
- IIFE (Immediately Invoked Function Expression) module encapsulation
- No external dependencies - vanilla JavaScript

## Layers

**Presentation Layer:**
- Purpose: Renders game graphics and UI elements
- Location: `main.js` (functions: `drawRoad`, `drawSki`, `drawHorace`, `draw`)
- Contains: Canvas drawing routines, HUD updates
- Depends on: Game state, canvas context
- Used by: Main game loop

**Game Logic Layer:**
- Purpose: Handles game rules, physics, collision detection
- Location: `main.js` (functions: `updateRoad`, `updateSki`, `loseLife`)
- Contains: Movement logic, collision detection, scoring, mode transitions
- Depends on: Input state, game state
- Used by: Main game loop

**Input Layer:**
- Purpose: Captures and normalizes user input from keyboard and touch
- Location: `main.js` (functions: `bindInput`, `handleSwipe`)
- Contains: Event listeners, input state management, control mode handling
- Depends on: DOM events
- Used by: Game logic layer

**Audio Layer:**
- Purpose: Produces sound effects using Web Audio API
- Location: `main.js` (functions: `initAudio`, `playBeep`, `playCarHit`, `playGatePass`, `playSkiEquipped`, `playModeChange`, `playMove`)
- Contains: Oscillator-based sound generation
- Depends on: Web Audio API
- Used by: Game logic layer

**State Layer:**
- Purpose: Maintains all game state
- Location: `main.js` (objects: `state`, `horace`, `input`, `vehicles`, `gates`, `obstacles`)
- Contains: Player data, game mode, entities, layout constants
- Depends on: Nothing
- Used by: All other layers

## Data Flow

**Main Game Loop:**

1. `requestAnimationFrame` calls `loop(timestamp)`
2. Calculate delta time from last frame
3. If game active, call `updateRoad(dt)` or `updateSki(dt)` based on `state.mode`
4. Call `draw(dt)` to render current frame
5. Call `updateHUD()` to sync score/lives display
6. Schedule next frame via `requestAnimationFrame(loop)`

**Input Processing:**

1. DOM event fires (keydown/keyup or touch events)
2. Event handler updates `input` object flags (keyboard) or calls `handleSwipe` (touch)
3. Update functions read `input` state each frame
4. Movement applied based on `controlMode` ('keyboard' or 'swipe')

**Mode Transitions:**

1. ROAD mode: Player crosses road to ski shop
2. Reach shop with skis equipped, return to bottom pavement
3. Transition to SKI mode via `state.mode = MODE.SKI`
4. Complete ski run (reach `slopeLength`)
5. Transition back to ROAD mode, increment `loopCount`

**State Management:**
- Mutable global objects (`state`, `horace`, `vehicles`, `gates`, `obstacles`)
- Direct property mutation for updates
- No state immutability or event system

## Key Abstractions

**Game Mode (MODE):**
- Purpose: Defines distinct gameplay states
- Examples: `MODE.ROAD`, `MODE.SKI`, `MODE.GAME_OVER`
- Pattern: Enum-like object with string values

**Entity Objects:**
- Purpose: Represent game entities with position, size, velocity
- Examples: `horace` (player), `vehicles` array, `gates` array, `obstacles` array
- Pattern: Plain objects with x/y/w/h properties, stored in arrays

**Layout Constants:**
- Purpose: Define game world dimensions and boundaries
- Examples: `LOGICAL_W`, `LOGICAL_H`, `roadLayout`, `shopRect`, `pavementRect`
- Pattern: Constant objects defining screen regions

**Control Mode:**
- Purpose: Abstracts input handling for different devices
- Examples: `controlMode = 'keyboard'` or `controlMode = 'swipe'`
- Pattern: String flag checked in update functions

## Entry Points

**Application Entry:**
- Location: `main.js` line 805 - `start()` call at IIFE end
- Triggers: Page load (script execution)
- Responsibilities: Initialize game state, bind input handlers, start game loop

**Game Start:**
- Location: `main.js` - control option click handler
- Triggers: User clicks keyboard or swipe control option
- Responsibilities: Set control mode, hide overlay, reset game state

**Frame Entry:**
- Location: `main.js` function `loop(timestamp)`
- Triggers: `requestAnimationFrame` callback
- Responsibilities: Update game logic, render frame, schedule next frame

## Error Handling

**Strategy:** Minimal - relies on browser defaults

**Patterns:**
- No try/catch blocks in game code
- Audio initialization checks for existing context before creating
- Touch events check `controlMode` before processing
- Boundary clamping prevents out-of-bounds positions

## Cross-Cutting Concerns

**Logging:** None implemented - no console logging
**Validation:** Implicit through boundary clamping (`Math.max`, `Math.min`)
**Authentication:** Not applicable - single-player local game

---

*Architecture analysis: 2026-01-18*
