# Horace Goes Skiing

## What This Is

A faithful browser-based recreation of "Horace Goes Skiing" (1982 ZX Spectrum game by Psion/Melbourne House). The game captures the authentic look, feel, and sound of the original Spectrum version while allowing minor modernizations for web play (touch controls, responsive scaling).

## Core Value

Authentic ZX Spectrum experience — when someone plays this, it should feel like the original 1982 game.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

**v1.0 (2026-01-18):**
- ✓ Road crossing gameplay with traffic — existing
- ✓ Ski slalom gameplay with gates and obstacles — existing
- ✓ Score and lives system — existing
- ✓ Two game modes (ROAD → SKI → ROAD cycle) — existing
- ✓ Keyboard controls (arrows) — existing
- ✓ Touch/swipe controls for mobile — existing
- ✓ Responsive canvas rendering — existing
- ✓ Web Audio API sound effects — existing
- ✓ 256x192 native resolution with integer scaling — v1.0
- ✓ Authentic 15-color ZX Spectrum palette — v1.0
- ✓ 8x8 attribute block color clash simulation — v1.0
- ✓ Authentic Horace sprite (16x20 pixel blob with eyes) — v1.0
- ✓ Authentic road crossing visuals (blocky cars, shop) — v1.0
- ✓ Authentic ski slope visuals (flag gates, blocky trees) — v1.0
- ✓ Square wave beeper audio with single-channel enforcement — v1.0
- ✓ 50Hz fixed timestep with discrete road movement — v1.0
- ✓ Economic system ($40 start, $10 fees/bonuses) — v1.0
- ✓ ZX Spectrum ROM font for all text — v1.0
- ✓ Canvas-rendered HUD (score/money/lives) — v1.0
- ✓ Authentic title screen with game flow — v1.0

### Active

<!-- Current scope. Building toward these. -->

(None — awaiting next milestone planning)

### Out of Scope

- Pixel-perfect frame-by-frame recreation — faithful spirit, not exact clone
- ZX Spectrum emulation — native browser implementation
- Multiplayer features — single-player only like original
- High score persistence — may add later but not core to authenticity
- Original QZIP keyboard layout — arrows work fine, modern expectation

## Context

**Original Game (1982):**
- Developed by William Tang for Psion/Melbourne House
- Part of the "Horace" series (Hungry Horace, Horace Goes Skiing, Horace and the Spiders)
- ZX Spectrum had 256x192 resolution, 15 colors (8 colors × 2 brightness levels - 1 duplicate)
- Beeper audio only (single-channel square wave)
- Two phases: Frogger-style road crossing to rent skis, then slalom skiing

**Current State (v1.0 shipped):**
- Complete authentic Spectrum experience
- 1,700 LOC JavaScript/HTML/CSS
- All 25 v1 requirements validated
- See `.planning/milestones/v1.0-ROADMAP.md` for execution history

## Constraints

- **Tech stack**: Vanilla JavaScript, HTML5 Canvas, Web Audio API — no frameworks, keep it simple
- **Browser support**: Modern browsers with ES6, Canvas 2D, Web Audio API
- **Mobile**: Maintain touch control support alongside keyboard
- **File structure**: Keep single-file architecture (`main.js`) unless complexity demands splitting

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Faithful spirit over pixel-perfect | Allows minor modernizations (touch, scaling) while capturing essence | ✓ Good |
| Research original before implementing | Need accurate reference material for authentic recreation | ✓ Good |
| Keep vanilla JS stack | Matches simplicity of original, no build complexity | ✓ Good |
| Cyan for pavements (no gray) | ZX Spectrum had no gray color | ✓ Good |
| Red for tree trunks (no brown) | ZX Spectrum had no brown color | ✓ Good |
| 16x20 sprite size | Fits within 2x3 attribute blocks | ✓ Good |
| Single-channel audio | Beeper could only play one sound at a time | ✓ Good |
| 50Hz fixed timestep | Authentic PAL timing from original ZX Spectrum | ✓ Good |
| Discrete step road movement | Matches original game feel, not continuous | ✓ Good |
| 30/70 bounce/crash tree collision | Creates unpredictability matching original | ✓ Good |

---
*Last updated: 2026-01-18 after v1.0 milestone*
