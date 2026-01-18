# Requirements: Horace Goes Skiing

**Defined:** 2026-01-18
**Core Value:** Authentic ZX Spectrum experience — when someone plays this, it should feel like the original 1982 game.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Visual Authenticity

- [ ] **VIS-01**: Game renders at 256x192 native resolution with integer scaling
- [ ] **VIS-02**: All colors use exact ZX Spectrum 15-color palette
- [ ] **VIS-03**: 8x8 attribute blocks enforce 2-color-per-block constraint (color clash)
- [ ] **VIS-04**: Horace sprite matches original (blue blob, big eyes, stumpy legs, tail/mullet)
- [ ] **VIS-05**: Road crossing visuals use authentic Spectrum colors and style
- [ ] **VIS-06**: Ski slope visuals use authentic red/blue flag gates, trees, snow

### Audio Authenticity

- [ ] **AUD-01**: All sounds use square wave oscillators only (no sawtooth/sine)
- [ ] **AUD-02**: Audio is single-channel (new sound interrupts previous)
- [ ] **AUD-03**: Gate pass sound matches original frequency/duration
- [ ] **AUD-04**: Gate miss warning sound matches original
- [ ] **AUD-05**: Collision/crash sounds match original beeper style
- [ ] **AUD-06**: Ski jump sound matches original "bizarre jumping sound"

### Gameplay Authenticity

- [ ] **GAME-01**: Player starts with $40
- [ ] **GAME-02**: Each collision costs $10 ambulance fee
- [ ] **GAME-03**: Ski rental costs $10
- [ ] **GAME-04**: Player receives $10 bonus at every 1000-point boundary
- [ ] **GAME-05**: Missing gates causes point loss and warning sound
- [ ] **GAME-06**: Passing between gates awards points
- [ ] **GAME-07**: Crossing finish line awards 100-point bonus
- [ ] **GAME-08**: Tree collisions have variable outcome (continue or break skis)
- [ ] **GAME-09**: Traffic moves in alternating directions per lane
- [ ] **GAME-10**: Traffic speeds vary between vehicles
- [ ] **GAME-11**: Traffic congestion increases over time

### Timing/Feel

- [ ] **TIME-01**: Game loop runs at 50 Hz fixed timestep
- [ ] **TIME-02**: Movement speeds calibrated to match original feel
- [ ] **TIME-03**: Road crossing uses discrete step movement (not continuous)

### Presentation

- [ ] **PRES-01**: Text uses ZX Spectrum ROM font (8x8 bitmap)
- [ ] **PRES-02**: HUD displays score and money in authentic layout/position
- [ ] **PRES-03**: Title screen matches original game presentation

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Visual Polish

- **VIS-07**: "Going up on skis" turning animation
- **VIS-08**: Shop door entry animation
- **VIS-09**: Border with 8-color support

### Audio Polish

- **AUD-07**: Game pause during sounds (authentic beeper behavior)

### Gameplay Polish

- **GAME-12**: Rocks cause random skidding
- **GAME-13**: "Hannekon run" course name displayed

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Pixel-perfect frame-by-frame recreation | Faithful spirit, not exact clone |
| ZX Spectrum emulation | Native browser implementation |
| Multiplayer | Single-player only like original |
| High score persistence | May add later but not core to authenticity |
| QZIP original controls | Arrow keys sufficient, modern expectation |

## Traceability

Which phases cover which requirements. Updated by create-roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIS-01 | Phase 1 | Pending |
| VIS-02 | Phase 1 | Pending |
| VIS-03 | Phase 1 | Pending |
| VIS-04 | Phase 2 | Pending |
| VIS-05 | Phase 2 | Pending |
| VIS-06 | Phase 2 | Pending |
| AUD-01 | Phase 3 | Pending |
| AUD-02 | Phase 3 | Pending |
| AUD-03 | Phase 3 | Pending |
| AUD-04 | Phase 3 | Pending |
| AUD-05 | Phase 3 | Pending |
| AUD-06 | Phase 3 | Pending |
| TIME-01 | Phase 4 | Pending |
| TIME-02 | Phase 4 | Pending |
| TIME-03 | Phase 4 | Pending |
| GAME-01 | Phase 4 | Pending |
| GAME-02 | Phase 4 | Pending |
| GAME-03 | Phase 4 | Pending |
| GAME-04 | Phase 4 | Pending |
| GAME-05 | Phase 4 | Pending |
| GAME-06 | Phase 4 | Pending |
| GAME-07 | Phase 4 | Pending |
| GAME-08 | Phase 4 | Pending |
| GAME-09 | Phase 4 | Pending |
| GAME-10 | Phase 4 | Pending |
| GAME-11 | Phase 4 | Pending |
| PRES-01 | Phase 5 | Pending |
| PRES-02 | Phase 5 | Pending |
| PRES-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-18*
*Last updated: 2026-01-18 after roadmap creation*
