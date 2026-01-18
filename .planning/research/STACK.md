# Stack Research: ZX Spectrum Authenticity

**Researched:** 2026-01-18
**Domain:** ZX Spectrum visual and audio recreation for browser games
**Confidence:** HIGH for core techniques, MEDIUM for optional enhancements

## Executive Summary

Authentic ZX Spectrum recreation in the browser requires three key techniques: (1) rendering at native 256x192 resolution with integer scaling using `image-rendering: pixelated`, (2) implementing the 8x8 attribute block color system that creates the characteristic "color clash" effect, and (3) using Web Audio API square wave oscillators for beeper-style audio. No external libraries are needed - vanilla Canvas 2D and Web Audio API provide everything required, which aligns perfectly with the project's constraint of keeping the stack simple.

**Primary recommendation:** Implement a virtual 256x192 framebuffer with 8x8 attribute blocks, scale with CSS `image-rendering: pixelated`, and use square wave oscillators at authentic ZX Spectrum frequencies.

## Rendering Techniques

### Native Resolution Approach

The ZX Spectrum's display is 256x192 pixels surrounded by a colored border. For authentic recreation:

**Canvas Setup:**
```javascript
// Create at native Spectrum resolution
const SPEC_WIDTH = 256;
const SPEC_HEIGHT = 192;
const canvas = document.getElementById('game');
canvas.width = SPEC_WIDTH;
canvas.height = SPEC_HEIGHT;
```

**CSS Scaling (critical for crisp pixels):**
```css
canvas {
  /* Scale to desired display size */
  width: 768px;   /* 3x native */
  height: 576px;  /* 3x native */

  /* Prevent blurry upscaling - USE ALL for browser compat */
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

**JavaScript Context Settings:**
```javascript
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
```

**Rationale:** CSS handles scaling while canvas stays at native resolution. This produces sharp, blocky pixels identical to the original hardware. Integer scale factors (2x, 3x, 4x) work best; non-integer scaling can cause uneven pixel sizes.

**Confidence:** HIGH - Verified via [MDN documentation](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look)

### 8x8 Attribute Block System (Color Clash)

This is THE defining visual characteristic of ZX Spectrum graphics. Each 8x8 pixel block can only contain TWO colors (foreground + background) from the palette.

**Attribute Grid:**
- Screen: 256x192 pixels = 32x24 attribute blocks
- Each block: 8x8 pixels
- Each block stores: INK (foreground), PAPER (background), BRIGHT flag, FLASH flag

**Implementation Pattern:**
```javascript
// Attribute storage: 32 columns x 24 rows
const attributes = new Array(24).fill(null).map(() =>
  new Array(32).fill(null).map(() => ({
    ink: 0,      // foreground color (0-7)
    paper: 7,    // background color (0-7)
    bright: false,
    flash: false
  }))
);

// When drawing, determine which attribute block the pixel falls in
function getAttributeForPixel(x, y) {
  const blockX = Math.floor(x / 8);
  const blockY = Math.floor(y / 8);
  return attributes[blockY][blockX];
}

// Drawing respects the attribute constraint
function setPixel(x, y, isInk) {
  const attr = getAttributeForPixel(x, y);
  const colorIndex = isInk ? attr.ink : attr.paper;
  const color = attr.bright ? BRIGHT_COLORS[colorIndex] : NORMAL_COLORS[colorIndex];
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}
```

**FLASH Effect (optional but authentic):**
```javascript
let flashState = false;
setInterval(() => { flashState = !flashState; }, 640); // 0.64 second toggle

function drawWithFlash(x, y, isInk) {
  const attr = getAttributeForPixel(x, y);
  if (attr.flash) {
    // Swap ink and paper when flash is active
    isInk = flashState ? !isInk : isInk;
  }
  // ... rest of drawing
}
```

**Rationale:** Color clash wasn't a bug - it was a memory-saving design that became the Spectrum's signature look. Recreating it produces instant visual authenticity.

**Confidence:** HIGH - Verified via [Wikipedia](https://en.wikipedia.org/wiki/Attribute_clash) and [RetroTechLab](https://www.retrotechlab.com/the-zx-spectrum-color-palette-resolution-and-attributes/)

### ZX Spectrum Color Palette

The palette has 15 colors: 8 base colors with normal and bright variants (black has no bright variant).

**Exact Hex Values (hardware-accurate):**
```javascript
// Normal colors (85% voltage = D8)
const NORMAL_COLORS = [
  '#000000', // 0: Black
  '#0000D8', // 1: Blue
  '#D80000', // 2: Red
  '#D800D8', // 3: Magenta
  '#00D800', // 4: Green
  '#00D8D8', // 5: Cyan
  '#D8D800', // 6: Yellow
  '#D8D8D8'  // 7: White
];

// Bright colors (100% voltage = FF)
const BRIGHT_COLORS = [
  '#000000', // 0: Black (same)
  '#0000FF', // 1: Blue
  '#FF0000', // 2: Red
  '#FF00FF', // 3: Magenta
  '#00FF00', // 4: Green
  '#00FFFF', // 5: Cyan
  '#FFFF00', // 6: Yellow
  '#FFFFFF'  // 7: White
];
```

**Rationale:** D8 (not CD or other values) represents the actual voltage output of ZX Spectrum hardware. Many emulators use incorrect/oversaturated colors.

**Confidence:** HIGH - Verified via [Lospec palette](https://lospec.com/palette-list/zx-spectrum) and hardware documentation

### Border Area

The Spectrum had a colored border surrounding the 256x192 play area. This can be simulated with:

```javascript
// Draw border color behind main canvas area
function drawBorder(borderColorIndex, isBright) {
  const color = isBright ? BRIGHT_COLORS[borderColorIndex] : NORMAL_COLORS[borderColorIndex];
  // Fill entire viewport with border color, then draw 256x192 area on top
}
```

**Confidence:** MEDIUM - Implementation straightforward but less critical for game authenticity

## Audio Techniques

### ZX Spectrum Beeper Characteristics

The Spectrum had a single-channel beeper controlled by the CPU - not a sound chip. It produced:
- **Square waves only** (1-bit output = on/off)
- Single channel (no polyphony without CPU tricks)
- Characteristic harsh, clicky sound

### Web Audio API Implementation

**Basic Beeper Sound:**
```javascript
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playBeep(frequency, durationMs, volume = 0.1) {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // Square wave is essential for Spectrum authenticity
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Keep volume low - Spectrum beeper wasn't loud
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + durationMs / 1000);
}
```

**Avoiding Click Artifacts:**
```javascript
function playBeepSmooth(frequency, durationMs, volume = 0.1) {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const endTime = audioCtx.currentTime + durationMs / 1000;

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  // Ramp down at end to avoid click
  gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(endTime);
}
```

**Rationale:** The Web Audio API's square wave oscillator directly matches the Spectrum's 1-bit beeper output. No external libraries needed.

**Confidence:** HIGH - Verified via [MDN OscillatorNode docs](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode) and [ZX Spectrum beeper recreation articles](https://remysharp.com/drafts/recreating-the-zx-spectrum-loader)

### Authentic Sound Frequencies

Horace Goes Skiing used simple beeper effects. Common ZX Spectrum frequency ranges:

```javascript
const SPECTRUM_SOUNDS = {
  // Movement sounds - short, low frequency
  step: { freq: 100, duration: 50 },

  // Success sounds - ascending tones
  collect: { freq: 880, duration: 80 },

  // Failure/hit sounds - descending sweep
  crash: { freqStart: 200, freqEnd: 50, duration: 300 },

  // UI sounds
  menuSelect: { freq: 440, duration: 100 }
};

// Frequency sweep for crash/explosion effects
function playSweep(startFreq, endFreq, durationMs) {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    endFreq,
    audioCtx.currentTime + durationMs / 1000
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + durationMs / 1000);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + durationMs / 1000);
}
```

**Confidence:** MEDIUM - Patterns are correct; exact frequencies for Horace need reference to original game

## Recommended Approach

### Phase 1: Resolution and Scaling

1. Change canvas to 256x192 native resolution
2. Add CSS `image-rendering: pixelated` with vendor prefixes
3. Set `imageSmoothingEnabled = false` on context
4. Scale display via CSS (recommend 3x or 4x for modern screens)

### Phase 2: Color System

1. Implement the 15-color palette with correct hex values
2. Create attribute grid (32x24 blocks)
3. Constrain all drawing to respect 2-colors-per-block rule
4. Add BRIGHT flag support

### Phase 3: Graphics Adaptation

1. Redraw Horace sprite as 1-bit bitmap data (like original)
2. Assign attributes to game areas (road=dark, shop=colored, etc.)
3. Design with color clash in mind - large sprites spanning whole blocks

### Phase 4: Audio Polish

1. Replace existing sounds with square-wave-only beeps
2. Use frequency sweeps for crashes/impacts
3. Keep volume low and harsh (authentic beeper sound)

### What NOT to Implement (Diminishing Returns)

- Full emulator accuracy (T-state timing, ULA simulation)
- Loading border stripes (nice nostalgia but not gameplay-relevant)
- CRT shader effects (adds complexity, debatable authenticity value)

## What NOT to Use

### Avoid: Sine/Triangle/Sawtooth Waves for Sound
**Why:** The ZX Spectrum beeper was 1-bit only - it could not produce anything other than square waves. Using sine waves will sound "too clean" and modern.

### Avoid: Anti-Aliasing / Bilinear Filtering
**Why:** Blurs the pixels, destroys the blocky aesthetic. Always use nearest-neighbor/pixelated scaling.

### Avoid: More Than 2 Colors Per 8x8 Block
**Why:** The attribute system's limitation IS the Spectrum look. Violating it makes graphics look "too good" and inauthentic.

### Avoid: Complex Audio Libraries (Tone.js, Howler.js)
**Why:** Overkill for beeper sounds. The raw Web Audio API oscillator is exactly what's needed - anything more adds dependencies without authenticity benefit.

### Avoid: WebGL/Three.js for 2D Rendering
**Why:** Unnecessary complexity. Canvas 2D handles everything needed for Spectrum recreation.

### Avoid: Full Emulator Integration (JSSpeccy3)
**Why:** JSSpeccy3 is tightly coupled - you can't extract just the audio or video components. Running a full emulator adds massive overhead for a simple game recreation.

### Avoid: CRT Shader Effects (Unless Explicitly Requested)
**Why:** Adds WebGL dependency and visual complexity. The original Spectrum on a modern display had crisp pixels - CRT effects are nostalgia for the TV, not the computer. Keep it optional.

## Confidence Assessment

| Recommendation | Confidence | Rationale |
|----------------|------------|-----------|
| 256x192 resolution | HIGH | Hardware specification, documented |
| CSS `image-rendering: pixelated` | HIGH | MDN documentation, browser support ~95% |
| D8/FF color hex values | HIGH | Hardware voltage analysis, Lospec palette |
| 8x8 attribute blocks | HIGH | Core Spectrum architecture, well documented |
| Square wave audio | HIGH | 1-bit beeper hardware limitation |
| Web Audio API patterns | HIGH | MDN documentation, working examples |
| Specific Horace sound frequencies | MEDIUM | General patterns known, exact values need original reference |
| Border implementation | MEDIUM | Straightforward but lower priority |
| FLASH attribute timing (0.64s) | MEDIUM | Documented but optional feature |

## Sources

### Primary (HIGH confidence)
- [MDN: Crisp pixel art look](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look) - Canvas rendering techniques
- [MDN: OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode) - Web Audio API
- [Lospec: ZX Spectrum Palette](https://lospec.com/palette-list/zx-spectrum) - Accurate color hex values
- [Wikipedia: ZX Spectrum graphic modes](https://en.wikipedia.org/wiki/ZX_Spectrum_graphic_modes) - Technical specifications
- [Wikipedia: Attribute clash](https://en.wikipedia.org/wiki/Attribute_clash) - Color system explanation

### Secondary (MEDIUM confidence)
- [RetroTechLab: ZX Spectrum Color Palette](https://www.retrotechlab.com/the-zx-spectrum-color-palette-resolution-and-attributes/) - Detailed attribute explanation
- [Recreating the ZX Spectrum loader](https://remysharp.com/drafts/recreating-the-zx-spectrum-loader) - Web Audio beeper patterns
- [Belen Albeza: Retro crisp pixel art](https://www.belenalbeza.com/articles/retro-crisp-pixel-art-in-html-5-games/) - Canvas scaling patterns

### Reference (for original game details)
- [Spectrum Computing: Horace Goes Skiing](https://spectrumcomputing.co.uk/entry/2351/ZX-Spectrum/Horace_Goes_Skiing) - Original game screenshots and info
- [World of Spectrum: Horace Goes Skiing](https://worldofspectrum.org/archive/software/games/horace-goes-skiing-sinclair-research-ltd) - Game archive

---

## Metadata

**Research type:** Stack/Implementation
**Valid until:** 2026-07-18 (6 months - stable browser APIs)
**Downstream consumer:** /gsd:create-roadmap
