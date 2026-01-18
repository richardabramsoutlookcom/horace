# Research Summary: ZX Spectrum Authenticity for Horace Goes Skiing

**Researched:** 2026-01-18
**Domain:** Retro game recreation (ZX Spectrum)
**Overall Confidence:** HIGH

## Executive Summary

The existing Horace Goes Skiing browser game has working gameplay but lacks authentic ZX Spectrum feel. Research reveals three critical areas requiring work: (1) **Visual system** - current 360x640 resolution with arbitrary colors must become 256x192 with exact 15-color palette and 8x8 attribute blocks; (2) **Audio** - current mixed waveform sounds (including sawtooth) must become square-wave-only beeper sounds; (3) **Timing** - 60 Hz variable timestep should become 50 Hz fixed timestep matching original hardware.

The ZX Spectrum's constraints (color clash, limited palette, 1-bit audio) are the aesthetic - removing them destroys authenticity. The vanilla JS/Canvas/Web Audio stack is ideal for this recreation.

## Key Findings by Dimension

### Stack
- **No libraries needed** - Canvas 2D + Web Audio API provide everything required
- **Render at 256x192**, scale with CSS `image-rendering: pixelated`
- **Exact color values**: D7/D8 for non-BRIGHT (85%), FF for BRIGHT (100%)
- **Square wave oscillators only** for beeper audio

### Features
- **Horace character**: Blue blob, big vacant eyes, no arms, stumpy legs, tail/mullet
- **Two-phase gameplay**: Frogger-style road crossing + slalom skiing on "Hannekon run"
- **Economic system**: $40 start, $10 ambulance fee, $10 ski rental, $10 per 1000pts
- **Red/blue flag gates** in skiing, point loss for misses
- **Trees can break skis** (variable outcome)

### Architecture
- **Keep single-file** unless component exceeds ~100 lines
- **Layer order**: Palette -> Resolution -> Sprites -> Audio -> Timing
- **Sprites as data arrays** (palette indices), not image files
- **Fixed 50 Hz timestep** for authentic feel

### Pitfalls
- **V1: Wrong colors** - use exact 15-color palette, not approximations
- **V2: Missing attribute clash** - 8x8 blocks with 2 colors each
- **V3: Wrong resolution** - 256x192 native, integer scaling only
- **A2: Wrong waveform** - current code uses sawtooth (impossible on Spectrum)
- **T1: Wrong frame rate** - 60 Hz vs original's 50.08 Hz

## Current Codebase Issues

| Issue | Current | Required |
|-------|---------|----------|
| Resolution | 360x640 | 256x192 + border |
| Colors | Arbitrary (#A0A0A0 etc) | Exact 15-color palette |
| Attribute clash | None | 8x8 block enforcement |
| Car hit sound | Sawtooth oscillator | Square wave only |
| Frame rate | 60 Hz variable | 50 Hz fixed timestep |

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Visual Foundation
**Addresses:** V1 (colors), V3 (resolution)
- Define ZX_PALETTE constant with exact hex values
- Change canvas to 256x192 native resolution
- Add CSS `image-rendering: pixelated` with vendor prefixes
- Replace all hardcoded colors with palette references

**Rationale:** Every subsequent visual work depends on correct palette and resolution. Do this first.

### Phase 2: Authentic Sprites
**Addresses:** V2 (attribute clash), V4 (sprite fidelity)
- Implement `drawSprite()` function for palette-indexed arrays
- Source exact Horace sprite (blue blob, big eyes, tail)
- Implement 8x8 attribute block system
- Add road, ski, and obstacle sprites

**Rationale:** Sprites need palette in place. Attribute clash is core to Spectrum aesthetic.

### Phase 3: Authentic Audio
**Addresses:** A1 (too clean), A2 (wrong waveform), A4 (polyphony)
- Change all oscillators to square wave
- Implement single-channel audio (new sound interrupts previous)
- Tune frequencies to match original beeper sounds
- Add characteristic Spectrum audio harshness

**Rationale:** Audio is independent of visuals, can be done after sprites or in parallel.

### Phase 4: Timing and Feel
**Addresses:** T1 (frame rate), T2 (variable speed), T3 (movement)
- Implement 50 Hz fixed timestep game loop
- Calibrate movement speeds against original
- Tune collision responses
- Verify input handling matches original character

**Rationale:** Correct timing requires stable visual base to evaluate.

### Phase 5: Presentation
**Addresses:** P1 (font), P2 (layout), V5 (border)
- Implement ZX Spectrum ROM font (8x8 bitmap)
- Replicate original HUD layout (score, money, lives)
- Add border with authentic 8-color support
- Create title screen matching original

**Rationale:** Polish phase after core authenticity established.

### Phase ordering rationale:
- **Foundation first** - All visual work needs correct palette/resolution
- **Sprites before timing** - Need stable visuals to evaluate movement feel
- **Audio independent** - Can be tuned anytime after foundation
- **Presentation last** - Polish layer once core is authentic

### Research flags for phases:
- **Phase 2 (Sprites):** Needs exact sprite data from original game (medium research)
- **Phase 3 (Audio):** May need frequency analysis of original sounds (medium research)
- **Phase 4 (Timing):** Likely needs measurement from emulator (low research)
- **Phases 1 & 5:** Standard patterns, minimal research needed

## Confidence Assessment

| Area | Level | Notes |
|------|-------|-------|
| Color palette values | HIGH | Hardware voltage specifications verified |
| Resolution & scaling | HIGH | MDN documentation, well-established pattern |
| Attribute system | HIGH | Core ZX Spectrum architecture |
| Audio waveform (square) | HIGH | 1-bit beeper is hardware fact |
| Specific sprite pixels | MEDIUM | Need extraction from original |
| Specific sound frequencies | MEDIUM | Need analysis of original audio |
| Movement speeds | MEDIUM | Need measurement from emulator |

## Open Questions

1. **Exact Horace sprite data** - Spriters Resource has assets, need pixel-level extraction
2. **Original sound frequencies** - May need to analyze original game audio
3. **Movement calibration** - Requires side-by-side emulator comparison
4. **Lives vs money system** - Unclear if lives exist separately from economic system

## Sources

- MDN: Crisp pixel art rendering
- Lospec: ZX Spectrum hardware palette
- World of Spectrum: Horace Goes Skiing technical specs
- Spectrum Computing: Game metadata
- RetroTechLab: Attribute system documentation
- Wikipedia: ZX Spectrum graphic modes

---

**Next step:** `/gsd:define-requirements` or `/gsd:create-roadmap`
