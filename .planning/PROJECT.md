# Horace Goes Skiing

## What This Is

A faithful browser-based recreation of "Horace Goes Skiing" (1982 ZX Spectrum game by Psion/Melbourne House). The game should capture the authentic look, feel, and sound of the original Spectrum version while allowing minor modernizations for web play (touch controls, responsive scaling).

## Core Value

Authentic ZX Spectrum experience — when someone plays this, it should feel like the original 1982 game.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Road crossing gameplay with traffic — existing
- ✓ Ski slalom gameplay with gates and obstacles — existing
- ✓ Score and lives system — existing
- ✓ Two game modes (ROAD → SKI → ROAD cycle) — existing
- ✓ Keyboard controls (arrows) — existing
- ✓ Touch/swipe controls for mobile — existing
- ✓ Responsive canvas rendering — existing
- ✓ Web Audio API sound effects — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Authentic Horace sprite matching original Spectrum graphics
- [ ] Authentic color palette (ZX Spectrum's 15-color palette)
- [ ] Authentic road crossing visuals (cars, road layout, shop)
- [ ] Authentic ski slope visuals (gates, trees, snow)
- [ ] Authentic gameplay feel (movement speed, physics, timing)
- [ ] Authentic beeper-style sound effects matching original
- [ ] Authentic UI/HUD presentation (Spectrum-style text, layout)
- [ ] Title screen matching original game presentation

### Out of Scope

- Pixel-perfect frame-by-frame recreation — faithful spirit, not exact clone
- ZX Spectrum emulation — native browser implementation
- Multiplayer features — single-player only like original
- High score persistence — may add later but not core to authenticity

## Context

**Original Game (1982):**
- Developed by William Tang for Psion/Melbourne House
- Part of the "Horace" series (Hungry Horace, Horace Goes Skiing, Horace and the Spiders)
- ZX Spectrum had 256x192 resolution, 15 colors (8 colors × 2 brightness levels - 1 duplicate)
- Beeper audio only (single-channel square wave)
- Two phases: Frogger-style road crossing to rent skis, then slalom skiing

**Current State:**
- Working game with both road and ski modes
- Modern web implementation (Canvas 2D, Web Audio API)
- Graphics, sounds, and feel don't match original Spectrum aesthetic
- See `.planning/codebase/` for detailed technical analysis

**Research Needed:**
- Original Spectrum graphics (sprites, colors, screen layout)
- Original gameplay mechanics (speeds, collision boxes, scoring)
- Original sound effects (frequencies, durations)
- Original UI/presentation (title screen, game over, messages)

## Constraints

- **Tech stack**: Vanilla JavaScript, HTML5 Canvas, Web Audio API — no frameworks, keep it simple
- **Browser support**: Modern browsers with ES6, Canvas 2D, Web Audio API
- **Mobile**: Maintain touch control support alongside keyboard
- **File structure**: Keep single-file architecture (`main.js`) unless complexity demands splitting

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Faithful spirit over pixel-perfect | Allows minor modernizations (touch, scaling) while capturing essence | — Pending |
| Research original before implementing | Need accurate reference material for authentic recreation | — Pending |
| Keep vanilla JS stack | Matches simplicity of original, no build complexity | — Pending |

---
*Last updated: 2026-01-18 after initialization*
