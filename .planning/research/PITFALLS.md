# Pitfalls Research: ZX Spectrum Recreation

**Researched:** 2026-01-18
**Domain:** ZX Spectrum game recreation (visual, audio, timing authenticity)
**Confidence:** HIGH (verified with official specifications and authoritative sources)

## Executive Summary

ZX Spectrum recreations most commonly fail in three areas: using incorrect color values (especially mixing BRIGHT and non-BRIGHT colors), ignoring the attribute system that created the iconic "color clash" effect, and producing audio that sounds too clean or uses wrong waveform types. The original Horace Goes Skiing ran on hardware with specific timing (50.08 Hz, not exactly 50 Hz), 15 distinct colors (not arbitrary RGB), and 1-bit beeper audio (square waves only). Authenticity requires respecting these technical constraints rather than "improving" them with modern capabilities.

**Critical insight:** The visual artifacts and limitations of the ZX Spectrum (attribute clash, limited colors, blocky audio) are features, not bugs. Removing them destroys authenticity.

---

## Visual Pitfalls

### Pitfall V1: Wrong Color Values

**What goes wrong:** Using approximated or arbitrary RGB values instead of the ZX Spectrum's exact 15-color palette. Common mistakes include using #AA0000 for red when the actual hardware value is #D70000, or using pure #FF values when non-BRIGHT colors should be at 85% brightness.

**Why it happens:** Developers grab "close enough" colors from memory or use generic retro palettes. Different sources cite different hex values, and developers don't verify against hardware specifications.

**Correct ZX Spectrum palette:**

| Color | Non-BRIGHT (85%) | BRIGHT (100%) |
|-------|------------------|---------------|
| Black | #000000 | #000000 |
| Blue | #0000D7 | #0000FF |
| Red | #D70000 | #FF0000 |
| Magenta | #D700D7 | #FF00FF |
| Green | #00D700 | #00FF00 |
| Cyan | #00D7D7 | #00FFFF |
| Yellow | #D7D700 | #FFFF00 |
| White | #D7D7D7 | #FFFFFF |

**Warning signs:**
- Colors look "too saturated" or "too dull" compared to original screenshots
- Using colors like #A0A0A0 (current codebase) instead of #D7D7D7
- Mixing BRIGHT and non-BRIGHT colors in same attribute block (impossible on real hardware)
- Using more than 15 distinct colors anywhere in the game

**Prevention strategy:**
- Define palette as constants at top of codebase
- Use only these 15 exact hex values
- Validate all fillStyle assignments against the palette
- For each 8x8 block, both INK and PAPER must share same BRIGHT value

**Phase to address:** Early - Color palette should be first authenticity fix

---

### Pitfall V2: Ignoring Attribute Clash

**What goes wrong:** Allowing unlimited colors per pixel region, which produces graphics that look "too clean" and lack the characteristic ZX Spectrum visual artifacts. The original hardware restricted each 8x8 pixel block to exactly 2 colors (foreground INK + background PAPER), both at the same brightness level.

**Why it happens:** Modern graphics APIs have no such limitation. It feels like an improvement to remove the constraint. Developers don't realize the attribute clash IS the aesthetic.

**The rule:** In any 8x8 pixel region, you may have:
- One INK color (foreground)
- One PAPER color (background)
- Both must be from same brightness set (either both BRIGHT or both non-BRIGHT)
- Flash bit optional (swaps INK/PAPER at intervals)

**Warning signs:**
- Sprites can move smoothly over any background without color "bleeding"
- More than 2 colors visible in any 8x8 pixel region
- Game looks like "generic pixel art" rather than specifically ZX Spectrum
- Screenshots don't match original game's visual artifacts

**Prevention strategy:**
- Implement attribute map overlay (768 bytes worth of 32x24 attribute blocks)
- When rendering sprites, determine which attribute blocks they touch
- Force sprite pixels in each block to use that block's INK/PAPER
- Optional: provide "clean" mode toggle, but default to authentic

**Phase to address:** Sprite work phase - Must be designed into rendering system

---

### Pitfall V3: Wrong Resolution and Scaling

**What goes wrong:** Using arbitrary resolutions, non-integer scaling, or bilinear interpolation that blurs pixels. The original was exactly 256x192 pixels in the play area, surrounded by a border.

**Why it happens:** Developers use responsive layouts without considering pixel integrity. Modern displays and scaling algorithms default to smoothing.

**The rule:**
- Native resolution: 256x192 pixels (play area)
- Border: Fills remaining screen in single color (8 basic colors only, no BRIGHT)
- Scaling: Integer multiples only (2x, 3x, 4x, 5x, 6x)
- Interpolation: Nearest neighbor only, never bilinear/bicubic

**Warning signs:**
- Pixels appear blurry or have visible "half-pixels"
- Game renders at 360x640 or other arbitrary resolution (current codebase)
- Using CSS scaling without image-rendering: pixelated
- Sprites appear at slightly different sizes depending on position

**Prevention strategy:**
- Render to exact 256x192 offscreen canvas
- Scale to display using integer multiple of base resolution
- Set `image-rendering: pixelated` (or `crisp-edges`) on canvas
- Calculate border dimensions to fill remaining screen space
- Never use fractional scale factors

**Phase to address:** Early - Foundation for all visual work

---

### Pitfall V4: Incorrect Sprite Fidelity

**What goes wrong:** Creating "inspired by" sprites rather than pixel-accurate recreations. Horace has a very specific silhouette and the original game's sprites are documented in sprite ripping resources.

**Why it happens:** Developers draw from memory or screenshots rather than extracting exact pixel data. They "improve" sprites with more detail.

**Warning signs:**
- Horace looks "off" but hard to pinpoint why
- Sprites have more detail/colors than originals
- Character proportions don't match original
- Animations have different frame counts than original

**Prevention strategy:**
- Source exact sprites from The Spriters Resource or sprite rips
- Verify each sprite against original at 1:1 pixel mapping
- Match exact frame counts for animations
- Don't add anti-aliasing or color gradients

**Phase to address:** Sprite work phase

---

### Pitfall V5: Missing Border Effects

**What goes wrong:** Ignoring the border area entirely or treating it as decoration. The ZX Spectrum border was integral to the display and changed during tape loading (the iconic striped patterns).

**Why it happens:** Modern games don't have borders. The border seems like wasted space.

**Warning signs:**
- No border visible around play area
- Border uses BRIGHT colors (impossible - border has no brightness flag)
- Border is static when it should reflect game state
- No loading stripe effect on game start

**Prevention strategy:**
- Implement visible border (8 basic colors only)
- Change border color on game events (as original did)
- Consider optional loading stripe animation on startup
- Use border for authentic error/status indication

**Phase to address:** Presentation phase - After core visuals working

---

## Audio Pitfalls

### Pitfall A1: Too-Clean Square Waves

**What goes wrong:** Using Web Audio oscillators that produce mathematically perfect waveforms. The ZX Spectrum beeper was crude hardware that produced distinctly rough, buzzy sounds.

**Why it happens:** Web Audio's `type: "square"` produces clean digital squares. Real beeper output had analog character, timing jitter, and hardware artifacts.

**Warning signs:**
- Sound effects feel "too video game" or "too chiptune"
- Audio sounds like modern 8-bit aesthetic rather than actual 1982 hardware
- Beeps are too pure/clear
- No characteristic "buzz" or "grit"

**Prevention strategy:**
- Add slight pitch instability (subtle random frequency modulation)
- Consider very light distortion or bitcrushing
- Study actual beeper recordings for reference
- Test against recordings of original Horace Goes Skiing sounds

**Phase to address:** Audio phase

---

### Pitfall A2: Wrong Waveform Types

**What goes wrong:** Using sawtooth, triangle, or sine waves for sound effects. The ZX Spectrum beeper could ONLY produce 1-bit output - the speaker was either on or off, producing only square waves.

**Why it happens:** Developers reach for variety in sound design. Sawtooth "sounds retro." (The current codebase uses sawtooth for car hit sound.)

**The rule:** Square waves ONLY. The beeper was literally 1-bit - it could only be high or low, on or off. No other waveform is possible.

**Warning signs:**
- Any oscillator type other than "square" in code
- Sounds that have smooth timbral characteristics
- Audio that sounds "warmer" than harsh square buzz

**Prevention strategy:**
- Audit all oscillator types - must all be "square"
- Remove sawtooth/triangle/sine usage entirely
- Achieve variety through frequency, duration, and envelope only
- Study 1-bit audio composition techniques

**Phase to address:** Audio phase - Early fix before detailed sound design

---

### Pitfall A3: Incorrect Frequencies and Timing

**What goes wrong:** Using arbitrary frequencies rather than the notes/effects from the original game. The original Horace Goes Skiing had specific sounds that players remember.

**Why it happens:** Developers create "sounds like it might fit" rather than matching originals. Original frequencies aren't documented, so they guess.

**Warning signs:**
- Sound effects feel "close but not quite right"
- Players who remember original say "that's not the sound"
- No reference to original game audio in development

**Prevention strategy:**
- Record audio from emulated original game
- Analyze frequencies with spectrum analyzer
- Match duration and envelope characteristics
- Test with players familiar with original

**Phase to address:** Audio phase - After waveform fixes

---

### Pitfall A4: Simultaneous Sounds

**What goes wrong:** Playing multiple sound effects at once. The ZX Spectrum beeper was single-channel - only one sound could play at a time (without extraordinary programming tricks).

**Why it happens:** Web Audio makes polyphony trivial. It feels wrong to cut off sounds.

**The rule:** Original beeper was 1 channel. Playing a new sound should interrupt the previous sound.

**Warning signs:**
- Multiple beeps playing simultaneously
- Sound effects layer on top of each other
- Audio feels "busy" or "modern"

**Prevention strategy:**
- Implement single-channel audio manager
- New sounds stop previous sounds
- Queue sounds if needed, don't overlap
- Exception: Some later games achieved pseudo-polyphony with rapid alternation

**Phase to address:** Audio phase - Architecture decision

---

## Timing/Feel Pitfalls

### Pitfall T1: Wrong Frame Rate

**What goes wrong:** Running at 60 Hz (typical modern display) instead of the ZX Spectrum's 50.08 Hz. This makes the game 20% faster than original.

**Why it happens:** requestAnimationFrame syncs to display, which is usually 60 Hz. Developers don't know the original ran at 50 Hz (PAL timing).

**Technical detail:** The ZX Spectrum produced 312 lines per frame at exactly 224 CPU cycles per line, yielding 69,888 T-states per frame. At 3.5 MHz, this gives 50.08 frames per second - slightly faster than true 50 Hz PAL.

**Warning signs:**
- Game feels "twitchy" or "too fast"
- Music/sound timing drifts from original
- Players familiar with original say "it's different"

**Prevention strategy:**
- Decouple game logic from render loop
- Run game simulation at fixed 50 Hz timestep
- Accumulate delta time and step in 20ms increments
- Allow rendering at any rate, but logic at 50 Hz

**Phase to address:** Timing phase - Foundation for feel

---

### Pitfall T2: Uncapped or Variable Speed

**What goes wrong:** Game speed varies with frame rate or device performance. The original ran at exactly the same speed on every ZX Spectrum.

**Why it happens:** Using dt (delta time) scaling allows variable frame rates but can feel inconsistent. Different devices may produce different experiences.

**Warning signs:**
- Game feels different on different devices
- Gameplay slightly faster/slower than original
- Physics "floaty" or "snappy" compared to original

**Prevention strategy:**
- Fixed timestep game loop (50 Hz / 20ms)
- Interpolation for smooth rendering between logic frames
- Cap maximum delta to prevent spiral of death
- Test on multiple devices for consistency

**Phase to address:** Timing phase

---

### Pitfall T3: Wrong Movement Speed/Physics

**What goes wrong:** Movement speeds, acceleration, and collision responses don't match original. Even if visuals and audio are perfect, wrong "feel" breaks authenticity.

**Why it happens:** Developers guess at speeds. Original values aren't documented. Testing against original requires careful comparison.

**Warning signs:**
- Horace moves faster/slower than in original
- Vehicles feel different to dodge
- Skiing momentum doesn't match memory
- Collision responses too abrupt or too soft

**Prevention strategy:**
- Play original extensively (via emulator)
- Measure movement: pixels per frame, not pixels per second
- Calibrate against original using side-by-side comparison
- Values should be integers (original used integer math)

**Phase to address:** Timing/feel phase - After frame rate fixed

---

### Pitfall T4: Modern Input Latency Assumptions

**What goes wrong:** Input handling assumes modern low-latency expectations. Original games had specific input polling and response characteristics.

**Why it happens:** Modern input is immediate and continuous. Original had keyboard matrix scanning at specific intervals.

**Warning signs:**
- Controls feel "too responsive" compared to original
- Missing the characteristic slight "heaviness" of original input
- Diagonal movement too smooth (if original was 4-direction only)

**Prevention strategy:**
- Study original control scheme (was it 4-direction or 8-direction?)
- Implement input polling at game tick rate, not every frame
- Consider slight input smoothing if original had it
- Verify keyboard controls match original (Q/Z/I/P were original keys)

**Phase to address:** Controls/timing phase

---

## Presentation Pitfalls

### Pitfall P1: Wrong Font

**What goes wrong:** Using a generic pixel font or system font instead of the exact ZX Spectrum character set. The Spectrum had a distinctive 8x8 font in ROM.

**Why it happens:** Developers use convenient pixel fonts. They don't realize the exact font matters for authenticity.

**Warning signs:**
- Text looks "retro" but not "Spectrum"
- Characters have wrong proportions
- Missing special characters (pound sign, copyright, block graphics)

**Prevention strategy:**
- Use exact ZX Spectrum ROM font (available as TTF: "ZX Spectrum" by various authors)
- Alternatively, render text as bitmap using original 8x8 character definitions
- Verify against screenshots of original game text

**Phase to address:** Presentation phase

---

### Pitfall P2: Wrong Screen Layout

**What goes wrong:** UI elements in wrong positions, wrong information displayed, or modern UI conventions applied. Original had specific layouts for score, lives, and messages.

**Why it happens:** Developers design UI from scratch rather than replicating original. They add "improvements."

**Warning signs:**
- HUD elements in different positions than original
- Information displayed that original didn't show
- Using icons instead of text (original was text-based)
- Rounded corners, gradients, or modern UI elements

**Prevention strategy:**
- Screenshot original game at various states
- Replicate exact HUD layout and content
- Use FLASH attribute for blinking if original did
- Keep UI strictly within ZX Spectrum capabilities

**Phase to address:** Presentation phase

---

### Pitfall P3: Missing Loading Experience

**What goes wrong:** Game starts instantly. Original games had lengthy tape loading with characteristic striped border patterns and loading screens.

**Why it happens:** Instant loading is "better" from modern UX perspective. Loading screens seem pointless.

**Warning signs:**
- No loading screen or title screen
- No characteristic border stripes
- Missing the anticipation/ritual of loading

**Prevention strategy:**
- Implement optional "authentic loading" mode
- Show border stripe animation (blue/red/cyan/yellow rapid cycling)
- Display loading screen with progressive reveal (optional)
- Play loading sound (the iconic screech, if desired)

**Phase to address:** Polish phase - Optional but authentic

---

## Prevention Strategies Summary

| Pitfall Category | Key Prevention | Phase |
|------------------|----------------|-------|
| Colors | Use exact 15-color palette with correct hex values | Early |
| Attribute clash | Implement 8x8 block color restriction | Sprites |
| Resolution | Render at 256x192, integer scaling only | Early |
| Sprites | Extract/verify exact pixel data from original | Sprites |
| Border | Implement border with 8 basic colors only | Presentation |
| Audio waveform | Square waves only, no sawtooth/sine/triangle | Audio |
| Audio character | Add subtle imperfection to match beeper | Audio |
| Audio channels | Single channel, new sounds interrupt | Audio |
| Frame rate | 50 Hz fixed timestep for game logic | Timing |
| Movement | Calibrate against original with measurement | Timing |
| Font | Use exact ZX Spectrum ROM font | Presentation |
| Layout | Replicate original HUD exactly | Presentation |

---

## Phase Ordering Based on Pitfalls

Based on pitfall severity and dependencies:

1. **Foundation Phase** (addresses V1, V3, T1)
   - Implement correct color palette as constants
   - Set up 256x192 render target with integer scaling
   - Implement 50 Hz fixed timestep

2. **Sprite Phase** (addresses V2, V4)
   - Source exact sprites from original
   - Implement attribute system for color constraints
   - Test attribute clash rendering

3. **Audio Phase** (addresses A1, A2, A3, A4)
   - Fix all oscillators to square wave
   - Implement single-channel audio
   - Match original frequencies

4. **Timing Phase** (addresses T2, T3, T4)
   - Calibrate movement speeds against original
   - Verify input handling characteristics

5. **Presentation Phase** (addresses P1, P2, V5)
   - Implement ZX Spectrum font
   - Replicate exact HUD layout
   - Add border effects

6. **Polish Phase** (addresses P3)
   - Optional loading experience
   - Final authenticity testing

---

## Current Codebase Issues (Quick Audit)

Based on review of `main.js`:

| Issue | Current | Should Be | Pitfall |
|-------|---------|-----------|---------|
| Resolution | 360x640 | 256x192 with border | V3 |
| Colors | Mixed arbitrary (#A0A0A0, etc) | Exact 15-color palette | V1 |
| Attribute clash | None | 8x8 block enforcement | V2 |
| Car hit sound | Sawtooth oscillator | Square only | A2 |
| Frame rate | requestAnimationFrame (60Hz) | 50 Hz fixed timestep | T1 |
| Font | System monospace | ZX Spectrum ROM font | P1 |
| Border | None | 8 basic colors | V5 |

---

## Sources

### Primary (HIGH confidence)
- [RetroTechLab - ZX Spectrum Color Palette](https://www.retrotechlab.com/the-zx-spectrum-color-palette-resolution-and-attributes/) - Hardware-accurate RGB values
- [Wikipedia - ZX Spectrum graphic modes](https://en.wikipedia.org/wiki/ZX_Spectrum_graphic_modes) - Resolution, timing, attribute system
- [Lemmings.info - ZX Spectrum Colour Clash](https://lemmings.info/zx-spectrum-colour-clash-on-modern-hardware/) - Attribute clash implementation
- [World of Spectrum - Horace Goes Skiing](https://worldofspectrum.org/archive/software/games/horace-goes-skiing-sinclair-research-ltd) - Original game specifications

### Secondary (MEDIUM confidence)
- [PixelatedArcade - When Colors Clash](https://www.pixelatedarcade.com/news/when-colors-clash) - Developer workarounds
- [Spectrum Computing - Horace Goes Skiing](https://spectrumcomputing.co.uk/entry/2351/ZX-Spectrum/Horace_Goes_Skiing) - Game metadata
- [The Spriters Resource - Horace Goes Skiing](https://www.spriters-resource.com/zx_spectrum/horacegoesskiing/page-1/) - Sprite extraction

### Audio Sources (MEDIUM confidence)
- [Break Into Program - ZX Spectrum Sound](http://www.breakintoprogram.co.uk/hardware/computers/zx-spectrum/sound) - Beeper technical details
- [Softspectrum48 - Timing and the beeper](https://softspectrum48.weebly.com/notes/timing-and-the-beeper) - Audio timing

### Typography Sources (HIGH confidence)
- [Wikipedia - ZX Spectrum character set](https://en.wikipedia.org/wiki/ZX_Spectrum_character_set) - Font specifications
- [DamienG - ZX Origins](https://damieng.com/typography/zx-origins/) - Font files

---

## Metadata

**Confidence breakdown:**
- Color palette: HIGH - Hardware specifications verified
- Attribute system: HIGH - Well-documented hardware limitation
- Audio constraints: HIGH - 1-bit beeper is definitive
- Timing values: MEDIUM - Exact game speeds need empirical verification
- Sprite data: MEDIUM - Depends on quality of extraction source

**Research date:** 2026-01-18
**Valid until:** 60 days (stable topic, hardware doesn't change)
