# Features Research: Horace Goes Skiing Authenticity

**Researched:** 2026-01-18
**Domain:** ZX Spectrum game recreation (1982 original)
**Confidence:** MEDIUM - Based on multiple secondary sources; no direct emulator verification

## Executive Summary

Horace Goes Skiing (1982, Psion/Melbourne House, designed by William Tang) is a two-phase arcade game: Frogger-style road crossing to rent skis, then downhill slalom skiing. The game's authenticity comes from: the distinctive blue blob Horace character with large vacant eyes, the economic system ($40 starting money, $10 ambulance fees, $10 ski rental), the "Hannekon run" ski course with red/blue flag gates, and the ZX Spectrum's characteristic beeper audio that pauses gameplay during sound effects. The original received 100% for graphics from Home Computing Weekly in 1983.

## Road Crossing Phase

### Visual Details

**Screen Layout:**
- Horace starts at bottom of screen (pavement area)
- Busy two-lane road with 5 traffic lanes fills middle of screen
- Ski shop/hut at top of screen (destination)
- Traffic moves in alternating directions per lane

**Vehicle Types:**
- Cars/sedans - standard hazards
- Motorcycles/bikes - smaller, faster
- Trucks/semis - "dangerously large"
- Ambulances - ironically can also hit Horace

**Traffic Behavior:**
- Traffic becomes progressively more congested over time
- Vehicles move at varying speeds
- Multiple vehicles per lane

### Gameplay Feel

**Movement:**
- 4-direction movement: Q (up), Z (down), I (left), P (right)
- Horace moves in discrete steps (not continuous)
- Must not linger - traffic congestion increases

**Economic System:**
- Start with $40
- Each collision costs $10 ambulance fee
- Ski rental costs $10
- Respawn on last reached side of road after hit
- At every 1000-point boundary, receive $10 bonus
- Game over when unable to afford skis (can recover by earning points crossing road)

**Objective Cycle:**
1. Cross road to ski shop
2. Enter shop door (costs $10 for ski rental)
3. Cross road back to slopes with skis equipped
4. Begin skiing phase

### Original Specifics

- Road described as "Frogger-like" but called "Frogger on speed" due to traffic density
- Ambulance fee mechanic creates dark humor - even ambulances can hit Horace
- Shop entry triggers ski equipping - visual change to Horace carrying skis

## Skiing Phase

### Visual Details

**Screen Layout:**
- Top-down/pseudo-3D view ("roving camera mounted above the course")
- Scrolling backdrop creates impression of descent
- Course named "Hannekon run"

**Gates/Flags:**
- Red and blue flag pairs mark slalom gates
- Must pass BETWEEN the red and blue flags
- Gates placed with increasing difficulty (tighter gaps, near trees)

**Obstacles:**
- Trees - primary hazard, can break skis
- Rocks - cause skidding in random directions
- Jumps/bumps - send player in unexpected directions

**Finish Line:**
- Finish barrier at end of course
- Visual indication of course completion

### Gameplay Feel

**Movement:**
- Left/right controls for lateral movement
- Continuous downward scrolling
- "Skiing controls are fairly smooth"
- Can "weave through tight spaces"
- Holding left/right causes Horace to go up on skis (turning posture)

**Scoring:**
- Points for passing between flags correctly
- Warning sound for missing flags
- Point LOSS for missing flags
- 100-point bonus for crossing finish barrier
- $10 bonus at every 1000-point boundary

**Collision Outcomes:**
- Light tree contact: can continue
- Heavy tree contact: skis break, return to road crossing
- Variable outcome creates tension

**Ski Breakage:**
- When skis break, must cross road again
- Need $10 to rent new skis
- Returns to road phase

### Original Specifics

- "Bizarre jumping sound" on jumps - characteristic Spectrum quirk
- Difficulty increases each loop (more trees, tighter gates, faster)
- Gate placement near trees creates challenging scenarios

## Horace Character

### Appearance

**Shape:**
- Blue blob/amorphous shape
- No visible arms
- Two stumpy legs
- "Appendage flopping out the back of his head" (narrow rodent tail mullet hairdo)
- "Face is in his chest"

**Eyes:**
- Two huge, vacant eyes
- Large empty eye sockets
- Distinctive and memorable feature

**Color:**
- Body: Blue (ZX Spectrum blue, color index 1)
- Eyes: Light blue/cyan (contrast against blue body)
- Described as "cute blue blob with eyes, arms, and legs"

**Design Context:**
- Created by William Tang with Alfred Milgrom contributing
- Designed using "minimum grid available" (ZX Spectrum constraints)
- Not designed as Spectrum mascot but became one through popularity
- "Instantly recognizable character"

### Animation States (Inferred)

**Road Crossing:**
- Walking/standing sprite
- Post-shop: carrying skis

**Skiing:**
- Skiing posture sprite
- Possible turning animation (going "up on skis" when turning)
- Crash animation when hitting tree

## Audio

### ZX Spectrum Beeper Characteristics

**Technical Constraints:**
- Single-channel beeper (piezoelectric buzzer)
- Controlled by toggling bit 4 of port &FE
- Game PAUSES during sound effects (processor tied up generating audio)
- Simple square wave tones

**Sound Design Philosophy:**
- "Simple bleeps" - minimal but complements gameplay
- Sound effects enhance without being elaborate
- "Out of place noise" characteristic of Spectrum charm

### Specific Sound Effects

| Event | Description | Confidence |
|-------|-------------|------------|
| Gate pass | Success beep (likely high pitched) | MEDIUM |
| Gate miss | Warning note/beep | HIGH - explicitly documented |
| Car hit | Crash sound (likely descending tone or noise) | MEDIUM |
| Ski equipped | Ascending melody (pick up item feel) | LOW |
| Jump | "Bizarre jumping sound" | HIGH - specifically noted |
| Mode change | Transition beep | LOW |
| Finish line | Bonus fanfare | LOW |

### Audio Timing

- Sound effects cause brief game pause
- White noise generation common for crashes
- Simple tones for pickups and success

## UI/Presentation

### Title Screen

**Elements (Inferred from era conventions):**
- Game title: "Horace Goes Skiing"
- Publisher: Sinclair Research Ltd / Psion
- Loading screen exists (documented in sprite resources)
- Likely simple text-based with Horace graphic

### In-Game HUD

**Display Elements:**
- Score display
- Money/purse amount ($40 starting)
- Lives indicator (if applicable)
- Current mode indicator

**Score Format:**
- Numeric score
- Updates on gate passes, completions
- 1000-point boundaries trigger $10 bonus

### Messages

**Documented Messages:**
- Warning when missing flags (sound, possible text)
- Likely "GAME OVER" screen
- Possible ski rental prompt at shop

### ZX Spectrum Text Style

- 8x8 pixel bitmap font (system font)
- Character resolution: 32 columns x 24 rows
- Attribute-based coloring (8x8 blocks share colors)
- Typical combinations: white on black, green on black, yellow on blue

## Authenticity Categories

### Table Stakes

These elements are essential - without them, it does not feel like Horace Goes Skiing:

| Feature | Why Essential | Implementation Notes |
|---------|---------------|---------------------|
| Blue Horace with big eyes | Defines the character identity | Must be recognizable blob shape |
| Two-phase gameplay (road + ski) | Core game structure | Cycle between modes |
| Economic system ($40, $10 fees) | Unique risk/reward mechanic | Track money, enforce costs |
| Red/blue flag gates | Defines slalom gameplay | Must pass between pairs |
| Trees that can break skis | Creates tension and stakes | Variable outcome on collision |
| Point loss for missing gates | Rewards skillful play | Warning sound + penalty |
| Traffic in alternating directions | Frogger heritage | Multiple lanes, varied speeds |
| Ambulance fee on hit | Dark humor element | $10 deduction mechanic |
| 100pt finish bonus | Completion reward | End of ski run |
| 1000pt = $10 bonus | Recovery mechanic | Allows earning money back |

### Distinctive Details

These elements make it feel authentic vs a generic retro game:

| Feature | What It Adds | Priority |
|---------|--------------|----------|
| Hannekon run name | Original flavor | LOW |
| Bizarre jumping sound | Spectrum character | MEDIUM |
| Game pause during sounds | Authentic beeper behavior | LOW |
| Traffic congestion over time | Increasing challenge | MEDIUM |
| Horace's tail/mullet | Character design accuracy | HIGH |
| "Going up on skis" animation | Turning posture feedback | MEDIUM |
| Rocks cause random skidding | Obstacle variety | MEDIUM |
| Variable ski breakage | Tension on tree hits | MEDIUM |
| Shop door entry animation | Polish element | LOW |
| 8x8 pixel font style | Period accuracy | MEDIUM |
| Attribute-based color blocks | ZX Spectrum feel | MEDIUM |

### Acceptable Modern Adaptations

These changes are acceptable for web without losing authenticity:

| Adaptation | Why Acceptable | Guidance |
|------------|----------------|----------|
| Touch/swipe controls | Platform necessity | Keep responsive, not sluggish |
| Arrow keys instead of QZIP | Modern expectation | Optional original mode |
| Higher resolution sprites | Display clarity | Maintain proportions and colors |
| Continuous audio (no pause) | Modern expectation | Still use beeper-style sounds |
| Responsive canvas scaling | Display on any device | Maintain aspect ratio |
| Smoother scrolling | Modern performance | Don't lose challenge |
| Visual polish on sprites | Modern standards | Keep recognizable |
| Optional high score persistence | Quality of life | Not in original |
| Fade transitions | Polish | Keep brief |

## Open Questions

Items that could not be fully resolved from secondary sources:

1. **Exact Horace sprite dimensions**
   - What we know: "Minimum grid available" design, sprite sheet exists (348x60 PNG)
   - What's unclear: Exact pixel dimensions of character, animation frames
   - Recommendation: Reference emulator screenshots or sprite sheet directly

2. **Precise ski run length and gate spacing**
   - What we know: Increases with difficulty
   - What's unclear: Starting values, progression formula
   - Recommendation: Tune through playtesting to feel right

3. **Sound effect frequencies**
   - What we know: Square wave, simple beeps
   - What's unclear: Exact Hz values for each sound
   - Recommendation: Reference BeepFX resources or tune by ear

4. **Game over conditions**
   - What we know: Can continue if break skis (if have money)
   - What's unclear: Is there a lives system or only economic?
   - Recommendation: Verify through emulator play

5. **Score display format**
   - What we know: Score exists, 1000pt triggers bonus
   - What's unclear: Position, font, color on original
   - Recommendation: Reference screenshots

## Sources

### Primary (HIGH confidence)
- [Spectrum Computing Entry](https://spectrumcomputing.co.uk/entry/2351/ZX-Spectrum/Horace_Goes_Skiing) - Game metadata, technical specs
- [Games Database Manual](https://www.gamesdatabase.org/Media/SYSTEM/Sinclair_ZX_Spectrum/Manual/formated/Horace_Goes_Skiing_-_1982_-_Sinclair_Research_Ltd..htm) - Original manual with controls, scoring, mechanics
- [World of Spectrum Archive](https://worldofspectrum.org/archive/software/games/horace-goes-skiing-sinclair-research-ltd) - Technical details, downloads

### Secondary (MEDIUM confidence)
- [The Spriters Resource](https://www.spriters-resource.com/zx_spectrum/horacegoesskiing/) - Sprite assets (not viewed directly)
- [Retro Arcadia Blog](https://retroarcadia.blog/2017/05/04/my-life-with-horace-goes-skiing/) - Gameplay descriptions, personal experience
- [RAM Retro Arcade Memories](https://retroarcadememories.wordpress.com/zx-spectrum/horace-goes-skiing/) - Visual descriptions
- [The Game Hoard Review](https://thegamehoard.com/2024/09/12/horace-goes-skiing-zx-spectrum/) - Gameplay analysis
- [Archive.org](https://archive.org/details/zx_Horace_Goes_Skiing_1982_Sinclair_Research) - Game availability, descriptions

### Tertiary (LOW confidence)
- [Wikipedia - Horace series](https://en.wikipedia.org/wiki/Horace_(video_game_series)) - General information
- Various WebSearch results - Character design descriptions

## Metadata

**Confidence breakdown:**
- Game mechanics: HIGH - Manual explicitly documents rules
- Horace appearance: MEDIUM - Multiple consistent descriptions
- Sound effects: LOW - General beeper info, specific sounds need verification
- UI presentation: LOW - Standard Spectrum conventions assumed

**Research date:** 2026-01-18
**Valid until:** Indefinite (historical game, information stable)
**Gaps requiring validation:** Exact sprite graphics, sound frequencies, UI layout
