# Roadmap: Horace Goes Skiing

## Overview

Transform the existing browser game into an authentic ZX Spectrum experience. Starting with visual foundation (resolution, palette, attribute blocks), then sprites, audio, gameplay tuning, and finally presentation polish. Each phase builds on the previous, with the final result feeling like the original 1982 game.

## Phases

- [ ] **Phase 1: Visual Foundation** - Resolution, palette, attribute blocks
- [ ] **Phase 2: Authentic Sprites** - Horace, road, ski visuals
- [ ] **Phase 3: Authentic Audio** - Square wave beeper sounds
- [ ] **Phase 4: Gameplay & Timing** - 50Hz loop, gameplay mechanics tuning
- [ ] **Phase 5: Presentation** - Font, HUD, title screen

## Phase Details

### Phase 1: Visual Foundation
**Goal**: Establish authentic ZX Spectrum visual rendering
**Depends on**: Nothing (first phase)
**Requirements**: VIS-01, VIS-02, VIS-03
**Success Criteria** (what must be TRUE):
  1. Canvas renders at 256x192 native resolution
  2. All on-screen colors match exact ZX Spectrum palette
  3. Color areas show visible attribute block constraints (8x8)
**Research**: Unlikely (established patterns from research)
**Plans**: TBD

### Phase 2: Authentic Sprites
**Goal**: Replace placeholder graphics with authentic Spectrum-style sprites
**Depends on**: Phase 1
**Requirements**: VIS-04, VIS-05, VIS-06
**Success Criteria** (what must be TRUE):
  1. Horace is recognizable as blue blob with big eyes and tail
  2. Road scene uses authentic Spectrum colors and style
  3. Ski slope has red/blue flag gates and authentic trees
**Research**: Likely (need exact sprite data)
**Research topics**: Original Horace sprite pixels, car/tree sprites, flag gate graphics
**Plans**: TBD

### Phase 3: Authentic Audio
**Goal**: Replace modern sounds with authentic beeper audio
**Depends on**: Phase 1 (can run parallel to Phase 2)
**Requirements**: AUD-01, AUD-02, AUD-03, AUD-04, AUD-05, AUD-06
**Success Criteria** (what must be TRUE):
  1. All sounds use square wave (no smooth waveforms)
  2. Only one sound plays at a time
  3. Gate pass/miss, crash, and jump sounds feel authentic
**Research**: Likely (need frequency analysis)
**Research topics**: Original sound frequencies, beeper timing patterns
**Plans**: TBD

### Phase 4: Gameplay & Timing
**Goal**: Tune gameplay to match original feel
**Depends on**: Phase 1, Phase 2
**Requirements**: TIME-01, TIME-02, TIME-03, GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06, GAME-07, GAME-08, GAME-09, GAME-10, GAME-11
**Success Criteria** (what must be TRUE):
  1. Game runs at consistent 50 Hz
  2. Economic system works ($40 start, $10 fees/bonuses)
  3. Gate scoring works (points for pass, penalty for miss)
  4. Tree collisions have variable outcome
  5. Traffic behaves authentically
**Research**: Unlikely (tuning existing code, research provides guidance)
**Plans**: TBD

### Phase 5: Presentation
**Goal**: Complete authentic UI presentation
**Depends on**: Phase 1, Phase 4
**Requirements**: PRES-01, PRES-02, PRES-03
**Success Criteria** (what must be TRUE):
  1. Text displays in 8x8 bitmap Spectrum font
  2. Score and money display in authentic positions
  3. Title screen matches original presentation
**Research**: Likely (need original UI reference)
**Research topics**: Original title screen layout, HUD positions, ROM font data
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Visual Foundation | 0/TBD | Not started | - |
| 2. Authentic Sprites | 0/TBD | Not started | - |
| 3. Authentic Audio | 0/TBD | Not started | - |
| 4. Gameplay & Timing | 0/TBD | Not started | - |
| 5. Presentation | 0/TBD | Not started | - |
