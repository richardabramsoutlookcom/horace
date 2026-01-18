# External Integrations

**Analysis Date:** 2025-01-18

## APIs & External Services

**None** - This is a fully client-side game with no external API calls.

No instances of:
- `fetch()`
- `XMLHttpRequest`
- Third-party SDKs
- External service imports

## Data Storage

**Databases:**
- None - No persistent data storage

**File Storage:**
- None - No file uploads or downloads

**Caching:**
- None - No caching layer

**Local Storage:**
- Not used - Game state resets on page refresh
- No high score persistence

## Authentication & Identity

**Auth Provider:**
- None - No user authentication
- No login/signup flows
- Anonymous play only

## Monitoring & Observability

**Error Tracking:**
- None - No error reporting service

**Analytics:**
- None - No analytics tracking

**Logs:**
- Console only (browser dev tools)
- No logging statements in production code

## CI/CD & Deployment

**Hosting:**
- Not configured - Static files only
- Compatible with any static host

**CI Pipeline:**
- None detected
- No `.github/workflows/` or CI config files

## Environment Configuration

**Required env vars:**
- None

**Secrets location:**
- None - No secrets needed

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Browser APIs (Native Integrations)

While not external services, the game uses these browser-native APIs:

**Canvas 2D API:**
- Location: `main.js` lines 2-3
- Purpose: All game rendering
- Usage: `canvas.getContext("2d")`

**Web Audio API:**
- Location: `main.js` lines 87-136
- Purpose: Sound effects (beeps, collision sounds)
- Usage: `AudioContext`, `OscillatorNode`, `GainNode`
- Note: Initialized on first user interaction (click/touch)

**Touch Events API:**
- Location: `main.js` lines 739-775
- Purpose: Mobile swipe controls
- Events: `touchstart`, `touchmove`, `touchend`, `touchcancel`

**Keyboard Events:**
- Location: `main.js` lines 721-736
- Purpose: Desktop controls
- Events: `keydown`, `keyup`

**requestAnimationFrame:**
- Location: `main.js` lines 640-653
- Purpose: Game loop timing (~60fps)

**matchMedia:**
- Location: `main.js` line 670
- Purpose: Detect portrait/landscape orientation

---

*Integration audit: 2025-01-18*
