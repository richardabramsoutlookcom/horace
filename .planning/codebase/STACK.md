# Technology Stack

**Analysis Date:** 2025-01-18

## Languages

**Primary:**
- JavaScript (ES6+) - Game logic, rendering, input handling (`main.js`)

**Secondary:**
- HTML5 - Page structure and canvas element (`index.html`)
- CSS3 - Styling, layout, responsive design (`style.css`)

## Runtime

**Environment:**
- Browser (modern browsers with ES6 support)
- No server-side runtime required

**Package Manager:**
- None - No package.json or dependency management
- Static files served directly

## Frameworks

**Core:**
- None - Vanilla JavaScript, no frameworks

**Testing:**
- None detected

**Build/Dev:**
- None - No build step, no bundler, no transpilation
- Files run directly in browser

## Key Dependencies

**Critical:**
- None - Zero external dependencies
- Uses only browser-native APIs

**Browser APIs Used:**
- Canvas 2D API - All game rendering via `ctx.getContext("2d")`
- Web Audio API - Sound effects via `AudioContext`
- Touch Events API - Mobile swipe controls
- requestAnimationFrame - Game loop timing

## Configuration

**Environment:**
- No environment variables
- No configuration files
- All settings hardcoded in `main.js`

**Build:**
- No build configuration
- No transpilation needed

**Game Constants (in `main.js`):**
```javascript
const LOGICAL_W = 360;
const LOGICAL_H = 640;
```

## Platform Requirements

**Development:**
- Any static file server (or open `index.html` directly)
- Modern browser for testing
- No Node.js required

**Production:**
- Any static hosting (GitHub Pages, Netlify, S3, etc.)
- No server-side requirements
- Files: `index.html`, `main.js`, `style.css`

**Browser Compatibility:**
- Requires ES6 support (const, let, arrow functions, template literals)
- Requires Canvas 2D API
- Requires Web Audio API (optional, for sound)
- Touch events for mobile support

---

*Stack analysis: 2025-01-18*
