# Architecture Research: Authenticity Layer

**Researched:** 2026-01-18
**Domain:** ZX Spectrum game recreation, retro game authenticity
**Confidence:** HIGH

## Executive Summary

For a simple retro game recreation like Horace Goes Skiing, the authenticity layer should be added incrementally within the existing single-file architecture. The recommended approach is: palette first (foundation for all visuals), then sprites (define pixel-art rendering pipeline), then audio (independent system), and finally timing refinements. Avoid extracting to separate files unless a component exceeds approximately 100 lines of related code. The existing IIFE pattern with internal function organization is appropriate for this project's scope.

## Layering Approach

Add authenticity in this order, each layer building on the previous:

### Layer 1: Palette Constants (Foundation)

**What:** Define ZX Spectrum's 15-color palette as constants.

**Why first:** Every visual element references colors. Establishing the palette first means all subsequent work uses authentic colors.

**Implementation:**
```javascript
const ZX_PALETTE = {
  BLACK: '#000000',
  BLUE: '#0000D8',
  RED: '#D80000',
  MAGENTA: '#D800D8',
  GREEN: '#00D800',
  CYAN: '#00D8D8',
  YELLOW: '#D8D800',
  WHITE: '#D8D8D8',
  BRIGHT_BLUE: '#0000FF',
  BRIGHT_RED: '#FF0000',
  BRIGHT_MAGENTA: '#FF00FF',
  BRIGHT_GREEN: '#00FF00',
  BRIGHT_CYAN: '#00FFFF',
  BRIGHT_YELLOW: '#FFFF00',
  BRIGHT_WHITE: '#FFFFFF'
};
```

**Effort:** Small (10-15 lines). Keep inline in main.js near top.

### Layer 2: Pixel-Art Rendering Setup

**What:** Configure canvas for crisp pixel-art scaling.

**Why second:** Before adding sprites, the rendering pipeline must preserve hard pixel edges.

**Implementation:**
1. Add CSS property: `image-rendering: pixelated` (with vendor prefixes)
2. Consider rendering to smaller internal resolution, then CSS-scaling up
3. Use integer coordinates in all `drawImage` and `fillRect` calls

**Key technique from MDN:** Create canvas at original small resolution (e.g., 256x192 for Spectrum resolution), then CSS-scale to display size. This preserves pixel crispness automatically.

**Effort:** Small. CSS changes plus rounding coordinates in draw functions.

### Layer 3: Sprite Data

**What:** Define Horace and other sprites as pixel data arrays.

**Why third:** Once palette and rendering are ready, sprites become straightforward data-to-pixels mapping.

**Implementation pattern:**
```javascript
const SPRITES = {
  horace: {
    width: 16,
    height: 16,
    frames: {
      walk1: [/* 1D array of palette indices */],
      walk2: [/* ... */],
      ski: [/* ... */]
    }
  },
  car: { /* ... */ },
  tree: { /* ... */ }
};

function drawSprite(sprite, frame, x, y) {
  const data = sprite.frames[frame];
  const palette = Object.values(ZX_PALETTE);
  for (let py = 0; py < sprite.height; py++) {
    for (let px = 0; px < sprite.width; px++) {
      const colorIndex = data[py * sprite.width + px];
      if (colorIndex !== 0) { // 0 = transparent
        ctx.fillStyle = palette[colorIndex];
        ctx.fillRect(Math.floor(x + px), Math.floor(y + py), 1, 1);
      }
    }
  }
}
```

**Effort:** Medium. Sprite data extraction from original game requires research. Drawing function is straightforward.

### Layer 4: Audio Authenticity

**What:** Tune existing Web Audio oscillators to match ZX Spectrum beeper characteristics.

**Why fourth:** Audio is independent of visual pipeline. Can be refined in parallel or after visuals.

**ZX Spectrum beeper facts:**
- Single-channel square wave only
- Frequencies based on 3,500,000 T-states/second Z80 timing
- Musical notes follow equal temperament (middle C approximately 262 Hz)
- Sound produced by toggling bit 4 of port 0xFE

**Implementation adjustments:**
```javascript
function playBeep(freq, duration) {
  const osc = audioContext.createOscillator();
  osc.type = 'square'; // Already correct
  osc.frequency.value = freq;
  // ... rest of existing pattern
}

// Example authentic notes
const BEEP_NOTES = {
  C4: 262,   // Middle C
  D4: 294,
  E4: 330,
  F4: 349,
  G4: 392,
  A4: 440,
  B4: 494,
  C5: 523
};
```

**Effort:** Small. Current implementation already uses square waves. Main work is tuning frequencies and durations to match original.

### Layer 5: Timing Refinements (Optional)

**What:** Consider fixed timestep for more authentic feel.

**Why last:** Current variable timestep works. Fixed timestep only needed if physics/movement feels inconsistent.

**Pattern (if needed):**
```javascript
const TIMESTEP = 1000 / 50; // 50 Hz like PAL Spectrum
let accumulator = 0;

function loop(timestamp) {
  accumulator += timestamp - lastTime;
  lastTime = timestamp;

  while (accumulator >= TIMESTEP) {
    update(TIMESTEP / 1000);
    accumulator -= TIMESTEP;
  }

  draw();
  requestAnimationFrame(loop);
}
```

**Effort:** Small refactor if needed. Current approach is fine for this game's simplicity.

## Component Structure

### Recommended: Keep Single-File

Given the project constraint and complexity level, maintain single-file architecture with clear internal organization:

```javascript
(() => {
  // === CONSTANTS ===
  const ZX_PALETTE = { /* ... */ };
  const SPRITES = { /* ... */ };
  const BEEP_NOTES = { /* ... */ };
  const LOGICAL_W = 256; // Consider Spectrum resolution
  const LOGICAL_H = 192;

  // === STATE ===
  const state = { /* existing */ };
  const horace = { /* existing */ };

  // === AUDIO ===
  function initAudio() { /* existing */ }
  function playBeep() { /* existing, tuned */ }

  // === RENDERING ===
  function drawSprite() { /* new */ }
  function drawRoad() { /* existing, updated colors */ }
  function drawSki() { /* existing, updated colors */ }
  function drawHorace() { /* updated to use sprites */ }

  // === GAME LOGIC ===
  // ... existing update functions

  // === MAIN ===
  function loop() { /* existing */ }
  function start() { /* existing */ }

  start();
})();
```

### When to Split (Thresholds)

Only extract to separate files if:

| Component | Split Threshold | Likely? |
|-----------|-----------------|---------|
| Sprite data | >100 lines of pixel arrays | MAYBE - depends on sprite count |
| Audio | >50 lines of sound definitions | NO - current is simple |
| Palette | >20 lines | NO - it's 15 colors |
| Game logic | >300 lines per mode | NO - current is manageable |

**If sprite data becomes large:** Consider `sprites.js` that just exports a `SPRITES` object. Import via second `<script>` tag (no build step needed).

## Data Organization

### Palette: Object Constant

```javascript
const ZX_PALETTE = {
  // Named access for code clarity
  BLACK: '#000000',
  // ...
};

// Array version for sprite indexing
const ZX_COLORS = Object.values(ZX_PALETTE);
```

### Sprites: Nested Object with Arrays

```javascript
const SPRITES = {
  horace: {
    width: 16,
    height: 16,
    frames: {
      stand: [0,0,1,1,...], // Palette indices
      walk1: [...],
      walk2: [...],
      ski: [...]
    }
  }
};
```

**Why arrays over ImageData:** Simpler to hand-author, easier to see color mapping, no external files needed.

### Sounds: Frequency/Duration Pairs

```javascript
const SOUNDS = {
  move: { freq: 100, duration: 0.05 },
  hit: { freqStart: 200, freqEnd: 50, duration: 0.3, type: 'sweep' },
  gate: { freq: 880, duration: 0.08 },
  equip: [
    { freq: 440, duration: 0.1 },
    { freq: 660, duration: 0.1, delay: 100 },
    { freq: 880, duration: 0.15, delay: 200 }
  ]
};
```

## Build Order

Dependencies and suggested implementation sequence:

```
1. ZX_PALETTE constant
   ├── No dependencies
   └── Enables: All visual work

2. Canvas pixel-art setup (CSS + coordinate rounding)
   ├── No dependencies
   └── Enables: Crisp sprite rendering

3. Replace hardcoded colors with ZX_PALETTE references
   ├── Depends on: Step 1
   └── Enables: Authentic colors throughout

4. drawSprite() function
   ├── Depends on: Steps 1, 2
   └── Enables: Sprite-based rendering

5. SPRITES data (start with Horace)
   ├── Depends on: Step 4
   └── Enables: Authentic Horace appearance

6. Update drawHorace() to use SPRITES
   ├── Depends on: Steps 4, 5
   └── Enables: Animated authentic Horace

7. Add more sprites (cars, trees, gates)
   ├── Depends on: Step 4
   └── Parallel with step 6

8. Tune audio frequencies/durations
   ├── Independent of visual work
   └── Can be done in parallel with steps 3-7

9. (Optional) Fixed timestep if movement feels wrong
   ├── Independent
   └── Only if testing reveals issues
```

### Parallelization Opportunities

- Audio tuning (step 8) can happen alongside any visual work
- Multiple sprite definitions (step 7) can be done in parallel
- Color replacement (step 3) and sprite work (steps 4-7) are sequential

## Integration Points

### How Authenticity Components Connect to Existing Game Loop

```
requestAnimationFrame
        │
        ▼
    loop(timestamp)
        │
        ├──► update[Road|Ski](dt)
        │         │
        │         └── Uses same state objects
        │             No authenticity changes needed here
        │
        ├──► draw(dt)
        │         │
        │         ├── drawRoad() / drawSki()
        │         │       │
        │         │       └── ctx.fillStyle = ZX_PALETTE.xxx
        │         │           (Replace hardcoded colors)
        │         │
        │         └── drawHorace()
        │                 │
        │                 └── drawSprite(SPRITES.horace, frame, x, y)
        │                     (Replace manual pixel drawing)
        │
        └──► updateHUD()
                  │
                  └── Consider ZX Spectrum font styling (CSS)
```

### Existing Integration Points (No Changes Needed)

| System | Current State | Authenticity Impact |
|--------|---------------|---------------------|
| Input handling | Works | None - input is input |
| Game state | Works | None - state structure unchanged |
| Collision detection | Works | None - uses same coordinates |
| Mode transitions | Works | None - same logic |
| Audio trigger points | Work | Keep triggers, change frequencies |

### New Integration Points

| New Component | Integrates With | How |
|---------------|-----------------|-----|
| ZX_PALETTE | All draw functions | Replace color strings |
| SPRITES | drawHorace() | Replace manual drawing |
| drawSprite() | drawHorace(), drawRoad(), drawSki() | New draw calls |
| SOUNDS | playBeep(), playCarHit(), etc. | Use defined frequencies |

## Anti-Patterns to Avoid

### Over-Engineering

**Don't:**
- Create a "SpriteManager" class
- Build an "AssetLoader" system
- Implement an "AudioEngine" abstraction
- Add a "SceneGraph" or "EntityComponentSystem"

**Do:**
- Define data as constants
- Write functions that operate on that data
- Keep it flat and direct

### Premature Extraction

**Don't:**
- Split into multiple files "for organization"
- Create `utils.js`, `constants.js`, `renderer.js` upfront
- Build module system infrastructure

**Do:**
- Keep in single file until pain is real
- Extract only when a section exceeds ~100 lines
- Use comments/whitespace for organization

### Fake Authenticity

**Don't:**
- Add CRT scanline shader effects
- Implement "attribute clash" simulation
- Create loading screen with fake tape sounds

**Do:**
- Use authentic color palette
- Match sprite proportions to original
- Tune sounds to original frequencies

## Sources

### Primary (HIGH confidence)
- [MDN: Crisp pixel art look](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look) - Canvas rendering techniques
- [Lospec ZX Spectrum Palette](https://lospec.com/palette-list/zx-spectrum) - Hardware-accurate hex values
- [World of Spectrum - BEEP command](https://worldofspectrum.org/ZXBasicManual/zxmanchap19.html) - Audio frequency calculations
- [Isaac Sukin - JavaScript Game Loops](https://isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing) - Fixed timestep patterns

### Secondary (MEDIUM confidence)
- [Belen Albeza - Retro pixel art in HTML5](https://www.belenalbeza.com/articles/retro-crisp-pixel-art-in-html-5-games/) - Canvas setup patterns
- [JSSpeccy3 GitHub](https://github.com/gasman/jsspeccy3) - Reference ZX Spectrum emulator implementation
- [The Spriters Resource - Horace Goes Skiing](https://www.spriters-resource.com/zx_spectrum/horacegoesskiing/) - Original sprite references
- [Wikipedia - ZX Spectrum graphic modes](https://en.wikipedia.org/wiki/ZX_Spectrum_graphic_modes) - Technical specifications

### Tertiary (LOW confidence)
- [Retromash - Design of retro games](https://retromash.com/2021/02/07/the-design-and-re-design-of-retro-games/) - General retro recreation philosophy
- [Build New Games - JS Game Code Organization](http://buildnewgames.com/js-game-code-org/) - Code organization patterns

---

*Research conducted: 2026-01-18*
*Valid for: Project duration (stable domain, unlikely to change)*
