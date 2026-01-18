(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const modeEl = document.getElementById("mode");
  const messageEl = document.getElementById("message");
  const overlayEl = document.getElementById("overlay");
  const rotateEl = document.getElementById("rotate");

  // ZX Spectrum native resolution
  const LOGICAL_W = 256;
  const LOGICAL_H = 192;

  // ZX Spectrum 15-color palette (8 colors x 2 brightness, minus duplicate black)
  const ZX_PALETTE = {
    // Normal brightness (BRIGHT 0)
    BLACK:    '#000000',
    BLUE:     '#0000CD',
    RED:      '#CD0000',
    MAGENTA:  '#CD00CD',
    GREEN:    '#00CD00',
    CYAN:     '#00CDCD',
    YELLOW:   '#CDCD00',
    WHITE:    '#CDCDCD',
    // Bright colors (BRIGHT 1)
    BRIGHT_BLACK:   '#000000',  // Same as BLACK
    BRIGHT_BLUE:    '#0000FF',
    BRIGHT_RED:     '#FF0000',
    BRIGHT_MAGENTA: '#FF00FF',
    BRIGHT_GREEN:   '#00FF00',
    BRIGHT_CYAN:    '#00FFFF',
    BRIGHT_YELLOW:  '#FFFF00',
    BRIGHT_WHITE:   '#FFFFFF',
  };

  // ZX Spectrum attribute system: 32x24 blocks of 8x8 pixels
  // Each block stores: { ink: colorName, paper: colorName }
  const ATTR_COLS = 32;  // 256 / 8
  const ATTR_ROWS = 24;  // 192 / 8
  let attrBuffer = [];

  function clearAttrs(paperColor = 'BLACK') {
    attrBuffer = [];
    for (let i = 0; i < ATTR_ROWS * ATTR_COLS; i++) {
      attrBuffer[i] = { ink: null, paper: paperColor };
    }
  }

  function getAttrIndex(x, y) {
    const col = Math.floor(x / 8);
    const row = Math.floor(y / 8);
    if (col < 0 || col >= ATTR_COLS || row < 0 || row >= ATTR_ROWS) return -1;
    return row * ATTR_COLS + col;
  }

  function setAttr(x, y, ink, paper = null) {
    const idx = getAttrIndex(x, y);
    if (idx < 0) return;
    if (ink) attrBuffer[idx].ink = ink;
    if (paper) attrBuffer[idx].paper = paper;
  }

  function getAttr(x, y) {
    const idx = getAttrIndex(x, y);
    if (idx < 0) return { ink: 'WHITE', paper: 'BLACK' };
    return attrBuffer[idx];
  }

  // Get valid color for a pixel position based on attribute
  function getValidColor(x, y, desiredColor) {
    const attr = getAttr(x, y);
    // If this color is already ink or paper, use it
    if (desiredColor === attr.ink || desiredColor === attr.paper) {
      return ZX_PALETTE[desiredColor];
    }
    // If ink is not set, set it
    if (!attr.ink) {
      setAttr(x, y, desiredColor);
      return ZX_PALETTE[desiredColor];
    }
    // If paper matches, return ink (color clash!)
    if (attr.paper === desiredColor) {
      return ZX_PALETTE[attr.ink];
    }
    // Otherwise return ink (color clash - can only have 2 colors)
    return ZX_PALETTE[attr.ink];
  }

  // Debug visualization toggle
  let showAttrGrid = false; // Toggle with 'G' key for debug

  function drawAttrGrid() {
    if (!showAttrGrid) return;
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 256; x += 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 192);
      ctx.stroke();
    }
    for (let y = 0; y <= 192; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
  }

  const MODE = {
    ROAD: "ROAD",
    SKI: "SKI",
    GAME_OVER: "GAME_OVER",
  };

  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
  };

  let controlMode = null; // 'keyboard' or 'swipe'
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let isTouching = false;

  let audioContext = null;

  const state = {
    lives: 3,
    score: 0,
    mode: MODE.ROAD,
    skiEquipped: false,
    hasReturnedWithSkis: false,
    loopCount: 0,
    lastTime: 0,
    messageTime: 0,
    crossingStart: 0,
  };

  const horace = {
    x: LOGICAL_W / 2 - 9,
    y: LOGICAL_H - 24,
    w: 18,
    h: 22,
    speed: 0,
    maxSpeed: 120,
    acceleration: 200,
    deceleration: 180,
  };

  let vehicles = [];
  let gates = [];
  let obstacles = [];
  let slopeLength = 2200;
  let cameraY = 0;
  let shopTimer = 0;
  let shopScored = false;

  // Road layout for 256x192 display (proportional from original portrait)
  const roadLayout = {
    top: 32,       // Top pavement/shop area
    bottom: 168,   // Bottom pavement starts here
    lanes: 4,      // 4 lanes for tighter spacing
  };

  // Ski shop area at top of screen
  const shopRect = {
    x: LOGICAL_W * 0.25,
    y: 4,
    w: LOGICAL_W * 0.5,
    h: 24,
  };

  // Bottom pavement where Horace starts
  const pavementRect = {
    x: 0,
    y: roadLayout.bottom,
    w: LOGICAL_W,
    h: LOGICAL_H - roadLayout.bottom,
  };

  function initAudio() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  function playBeep(freq, duration, volume = 0.08) {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
  }

  function playMove() {
    playBeep(100, 0.05, 0.03);
  }

  function playCarHit() {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.3);
  }

  function playGatePass() {
    playBeep(880, 0.08, 0.06);
  }

  function playSkiEquipped() {
    playBeep(440, 0.1, 0.08);
    setTimeout(() => playBeep(660, 0.1, 0.08), 100);
    setTimeout(() => playBeep(880, 0.15, 0.08), 200);
  }

  function playModeChange() {
    playBeep(523, 0.12, 0.08);
  }

  function setMessage(text, duration = 1.2) {
    messageEl.textContent = text;
    state.messageTime = duration;
  }

  function resetHoraceToRoad() {
    horace.x = LOGICAL_W / 2 - 9;
    horace.y = LOGICAL_H - 24;
    horace.speed = 0;
    shopTimer = 0;
    shopScored = false;
    state.crossingStart = performance.now();
  }

  function resetRoad() {
    vehicles = [];
    const laneHeight = (roadLayout.bottom - roadLayout.top) / roadLayout.lanes;
    for (let i = 0; i < roadLayout.lanes; i += 1) {
      const laneY = roadLayout.top + laneHeight * i + laneHeight / 2;
      const dir = i % 2 === 0 ? 1 : -1;
      const count = 2 + (i % 2);
      for (let v = 0; v < count; v += 1) {
        // Smaller vehicles for 256x192 display
        const width = 24 + Math.random() * 16;
        const speedBase = 40 + Math.random() * 30;
        const speed = dir * speedBase * (1 + state.loopCount * 0.08);
        vehicles.push({
          x: Math.random() * LOGICAL_W,
          y: laneY - 7,
          w: width,
          h: 14,
          speed,
        });
      }
    }
    resetHoraceToRoad();
  }

  function resetSkiRun() {
    gates = [];
    obstacles = [];
    // Proportional slope length for 256x192 display
    slopeLength = 800 + state.loopCount * 60;
    const baseSpacing = Math.max(50, 80 - state.loopCount * 6);
    const gap = Math.max(40, 60 - state.loopCount * 4);
    let y = 80;
    while (y < slopeLength - 80) {
      const margin = 20;
      const left = margin + Math.random() * (LOGICAL_W - gap - margin * 2);
      gates.push({
        left,
        right: left + gap,
        y,
        passed: false,
      });
      y += baseSpacing + Math.random() * 20;
    }

    const obstacleCount = Math.min(10, 3 + state.loopCount * 2);
    for (let i = 0; i < obstacleCount; i += 1) {
      obstacles.push({
        x: 16 + Math.random() * (LOGICAL_W - 32),
        y: 100 + Math.random() * (slopeLength - 200),
        r: 8 + Math.random() * 4,
      });
    }

    horace.x = LOGICAL_W / 2 - 9;
    horace.y = 24;
    horace.speed = 0;
    cameraY = 0;
  }

  function loseLife(reason) {
    state.lives -= 1;
    playCarHit();
    setMessage(reason || "Ouch!");
    if (state.lives <= 0) {
      state.mode = MODE.GAME_OVER;
      overlayEl.classList.remove("hidden");
      document.getElementById("title").textContent = "GAME OVER";
      document.getElementById("subtitle").textContent = `Final score: ${state.score}`;
      document.getElementById("controls-hint").textContent = "Press Start to play again.";
      return;
    }

    if (state.mode === MODE.ROAD) {
      resetHoraceToRoad();
    } else if (state.mode === MODE.SKI) {
      resetSkiRun();
    }
  }

  let lastMoveSound = 0;

  function updateRoad(dt) {
    vehicles.forEach((vehicle) => {
      vehicle.x += vehicle.speed * dt;
      const buffer = 40;
      if (vehicle.speed > 0 && vehicle.x > LOGICAL_W + buffer) {
        vehicle.x = -vehicle.w - buffer;
      }
      if (vehicle.speed < 0 && vehicle.x < -vehicle.w - buffer) {
        vehicle.x = LOGICAL_W + buffer;
      }
    });

    // Handle movement based on control mode
    if (controlMode === 'keyboard') {
      // Keyboard: All 4 directions with acceleration
      const isMoving = input.up || input.down || input.left || input.right;

      if (input.up) {
        horace.speed = Math.min(horace.speed + horace.acceleration * dt, horace.maxSpeed);
      } else if (input.down) {
        horace.speed = Math.min(horace.speed + horace.acceleration * dt, horace.maxSpeed);
      } else {
        horace.speed = Math.max(horace.speed - horace.deceleration * dt, 0);
      }

      if (isMoving && horace.speed > 0) {
        if (input.up) {
          horace.y -= horace.speed * dt;
        } else if (input.down) {
          horace.y += horace.speed * dt;
        }

        shopTimer = 0;

        const now = performance.now();
        if (now - lastMoveSound > 100) {
          playMove();
          lastMoveSound = now;
        }
      }

      // Left/right movement (proportional for 256 width)
      const moveSpeed = 100;
      if (input.left) {
        horace.x -= moveSpeed * dt;
      }
      if (input.right) {
        horace.x += moveSpeed * dt;
      }
    } else if (controlMode === 'swipe') {
      // Swipe: Step-based movement like Crossy Road
      // Movement handled by swipe gestures (implemented in bindInput)
      if (horace.speed > 0) {
        horace.speed = Math.max(horace.speed - horace.deceleration * 3 * dt, 0);
      }
    }

    if (isHoraceInShop()) {
      shopTimer += dt;
      if (!state.skiEquipped && shopTimer > 0.4) {
        state.skiEquipped = true;
        playSkiEquipped();
        if (!shopScored) {
          const elapsed = (performance.now() - state.crossingStart) / 1000;
          const bonus = Math.max(0, Math.floor(80 - elapsed * 10));
          state.score += 120 + bonus;
          shopScored = true;
        }
        setMessage("Skis equipped!");
      }
    }

    // Constrain position
    horace.x = Math.max(0, Math.min(LOGICAL_W - horace.w, horace.x));
    horace.y = Math.max(0, Math.min(LOGICAL_H - horace.h, horace.y));

    for (const vehicle of vehicles) {
      if (rectOverlap(horace, vehicle)) {
        loseLife("Hit by car!");
        return;
      }
    }

    // Check if reached top of screen
    if (horace.y <= 0) {
      if (!state.skiEquipped) {
        loseLife("Rent skis!");
        return;
      }
      // Don't start skiing yet - just reached the shop
      if (!state.hasReturnedWithSkis) {
        setMessage("Now return across the road!");
        return;
      }
    }

    // Check if returned to bottom with skis
    if (horace.y >= LOGICAL_H - horace.h - 10 && state.skiEquipped && !state.hasReturnedWithSkis) {
      state.hasReturnedWithSkis = true;
      state.mode = MODE.SKI;
      playModeChange();
      resetSkiRun();
      setMessage("Ski run!");
    }
  }

  function updateSki(dt) {
    if (controlMode === 'keyboard') {
      // Keyboard: Forward/back controls with acceleration, left/right for steering
      if (input.up) {
        horace.speed = Math.min(horace.speed + horace.acceleration * dt, horace.maxSpeed);
      } else if (input.down) {
        horace.speed = Math.min(horace.speed + horace.acceleration * dt, horace.maxSpeed);
      } else {
        horace.speed = Math.max(horace.speed - horace.deceleration * dt, 0);
      }

      // Auto-scroll down the slope (proportional for 192 height)
      const baseSpeed = 60 + state.loopCount * 3;
      const direction = input.up ? -1 : (input.down ? 1 : 0);
      const speedModifier = direction * horace.speed * 0.2;
      horace.y += (baseSpeed + speedModifier) * dt;

      // Left/right steering (proportional for 256 width)
      const steerSpeed = 120;
      if (input.left) {
        horace.x -= steerSpeed * dt;
      }
      if (input.right) {
        horace.x += steerSpeed * dt;
      }

      // Constrain horizontal position
      horace.x = Math.max(0, Math.min(LOGICAL_W - horace.w, horace.x));
    } else if (controlMode === 'swipe') {
      // Swipe mode: Tap to accelerate down, swipe left/right to move
      const baseSpeed = 60 + state.loopCount * 3;

      if (isTouching) {
        // Accelerate when touching
        horace.y += baseSpeed * 1.5 * dt;
      } else {
        // Normal speed when not touching
        horace.y += baseSpeed * dt;
      }

      // Handle left/right movement from swipes (applied as immediate steps)
      // Movement happens instantly when swipe is detected in handleSwipe function
    }

    cameraY = Math.max(0, Math.min(slopeLength - LOGICAL_H, horace.y - LOGICAL_H * 0.3));

    for (const gate of gates) {
      if (!gate.passed && horace.y >= gate.y) {
        const centerX = horace.x + horace.w / 2;
        if (centerX > gate.left && centerX < gate.right) {
          gate.passed = true;
          state.score += 30;
          playGatePass();
        } else {
          loseLife("Missed gate!");
          return;
        }
      }
    }

    for (const obstacle of obstacles) {
      if (circleRectOverlap(obstacle, horace)) {
        loseLife("Hit obstacle!");
        return;
      }
    }

    if (horace.y >= slopeLength) {
      state.loopCount += 1;
      state.mode = MODE.ROAD;
      state.skiEquipped = false;
      state.hasReturnedWithSkis = false;
      state.score += 150;
      playModeChange();
      resetRoad();
      setMessage("Back to the road!");
    }
  }

  function isHoraceInShop() {
    return (
      horace.x + horace.w > shopRect.x &&
      horace.x < shopRect.x + shopRect.w &&
      horace.y + horace.h > shopRect.y &&
      horace.y < shopRect.y + shopRect.h
    );
  }

  function rectOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function circleRectOverlap(c, r) {
    const closestX = Math.max(r.x, Math.min(c.x, r.x + r.w));
    const closestY = Math.max(r.y, Math.min(c.y, r.y + r.h));
    const dx = c.x - closestX;
    const dy = c.y - closestY;
    return dx * dx + dy * dy < c.r * c.r;
  }

  function drawRoad() {
    // Background - black like original ZX Spectrum
    ctx.fillStyle = ZX_PALETTE.BLACK;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    // Track road area in attribute system
    for (let y = roadLayout.top; y < roadLayout.bottom; y += 8) {
      for (let x = 0; x < LOGICAL_W; x += 8) {
        setAttr(x, y, null, 'BLACK');
      }
    }

    // Top area with ski shop - cyan pavement
    ctx.fillStyle = ZX_PALETTE.CYAN;
    ctx.fillRect(0, 0, LOGICAL_W, roadLayout.top);
    // Track top pavement in attribute system
    for (let y = 0; y < roadLayout.top; y += 8) {
      for (let x = 0; x < LOGICAL_W; x += 8) {
        setAttr(x, y, 'CYAN', 'CYAN');
      }
    }

    // Ski shop building (proportional for 256x192)
    ctx.fillStyle = ZX_PALETTE.BLUE;
    ctx.fillRect(shopRect.x, shopRect.y + 4, shopRect.w, shopRect.h - 8);
    // Track shop in attribute system
    for (let y = shopRect.y; y < shopRect.y + shopRect.h; y += 8) {
      for (let x = shopRect.x; x < shopRect.x + shopRect.w; x += 8) {
        setAttr(x, y, 'BLUE', 'CYAN');
      }
    }

    // Shop roof
    ctx.fillStyle = ZX_PALETTE.RED;
    ctx.beginPath();
    ctx.moveTo(shopRect.x - 6, shopRect.y + 4);
    ctx.lineTo(shopRect.x + shopRect.w / 2, shopRect.y);
    ctx.lineTo(shopRect.x + shopRect.w + 6, shopRect.y + 4);
    ctx.fill();

    // Shop sign
    ctx.fillStyle = ZX_PALETTE.BRIGHT_YELLOW;
    ctx.font = "bold 8px monospace";
    ctx.fillText("SKIS", shopRect.x + shopRect.w / 2 - 12, shopRect.y + 16);

    // Road - black surface (ZX Spectrum roads were black)
    ctx.fillStyle = ZX_PALETTE.BLACK;
    ctx.fillRect(0, roadLayout.top, LOGICAL_W, roadLayout.bottom - roadLayout.top);

    // Lane markings - dashed white lines
    ctx.fillStyle = ZX_PALETTE.WHITE;
    const laneHeight = (roadLayout.bottom - roadLayout.top) / roadLayout.lanes;
    for (let i = 1; i < roadLayout.lanes; i += 1) {
      const y = roadLayout.top + laneHeight * i;
      for (let x = 0; x < LOGICAL_W; x += 12) {
        ctx.fillRect(x, y - 1, 6, 2);
        // Track lane markings (white ink on black paper)
        setAttr(x, y, 'WHITE', 'BLACK');
      }
    }

    // Bottom pavement - cyan to match top
    ctx.fillStyle = ZX_PALETTE.CYAN;
    ctx.fillRect(pavementRect.x, pavementRect.y, pavementRect.w, pavementRect.h);
    // Track bottom pavement in attribute system
    for (let y = pavementRect.y; y < LOGICAL_H; y += 8) {
      for (let x = 0; x < LOGICAL_W; x += 8) {
        setAttr(x, y, 'CYAN', 'CYAN');
      }
    }

    // Vehicles - colorful blocky cars using ZX palette
    vehicles.forEach((vehicle) => {
      const mainColorName = vehicle.speed > 0 ? 'BRIGHT_YELLOW' : 'BRIGHT_RED';
      const mainColor = ZX_PALETTE[mainColorName];
      const accentColor = vehicle.speed > 0 ? ZX_PALETTE.BRIGHT_MAGENTA : ZX_PALETTE.BRIGHT_CYAN;

      // Car body
      ctx.fillStyle = mainColor;
      ctx.fillRect(vehicle.x, vehicle.y, vehicle.w, vehicle.h);
      // Track vehicle in attribute system
      for (let vy = vehicle.y; vy < vehicle.y + vehicle.h; vy += 8) {
        for (let vx = vehicle.x; vx < vehicle.x + vehicle.w; vx += 8) {
          setAttr(vx, vy, mainColorName, 'BLACK');
        }
      }

      // Windows (proportional for smaller cars)
      ctx.fillStyle = accentColor;
      ctx.fillRect(vehicle.x + vehicle.w * 0.2, vehicle.y + 2, vehicle.w * 0.3, vehicle.h - 4);
      ctx.fillRect(vehicle.x + vehicle.w * 0.55, vehicle.y + 2, vehicle.w * 0.25, vehicle.h - 4);

      // Wheels
      ctx.fillStyle = ZX_PALETTE.BLACK;
      ctx.fillRect(vehicle.x + 2, vehicle.y + vehicle.h - 2, 4, 2);
      ctx.fillRect(vehicle.x + vehicle.w - 6, vehicle.y + vehicle.h - 2, 4, 2);
    });
  }

  function drawSki() {
    // White snowy slope - bright white for ZX Spectrum
    ctx.fillStyle = ZX_PALETTE.BRIGHT_WHITE;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    // Attribute buffer already cleared with BRIGHT_WHITE paper in draw()

    // Diagonal snow texture lines for movement effect (cyan for ZX Spectrum look)
    ctx.strokeStyle = ZX_PALETTE.CYAN;
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i += 1) {
      const y = ((i * 40) - (cameraY * 0.5)) % LOGICAL_H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(LOGICAL_W, y + 16);
      ctx.stroke();
      // Track snow lines in attribute system
      for (let x = 0; x < LOGICAL_W; x += 8) {
        setAttr(x, y, 'CYAN', 'BRIGHT_WHITE');
      }
    }

    // Draw slalom gates - authentic ZX Spectrum colors
    gates.forEach((gate) => {
      const y = gate.y - cameraY;
      if (y < -20 || y > LOGICAL_H + 20) return;

      // Passed gates turn green, otherwise red/blue
      const leftColorName = gate.passed ? 'BRIGHT_GREEN' : 'BRIGHT_RED';
      const rightColorName = gate.passed ? 'BRIGHT_GREEN' : 'BRIGHT_BLUE';
      const leftColor = ZX_PALETTE[leftColorName];
      const rightColor = ZX_PALETTE[rightColorName];

      // Left pole (smaller for 192 height)
      ctx.fillStyle = leftColor;
      ctx.fillRect(gate.left - 2, y, 4, 16);
      ctx.fillRect(gate.left - 4, y, 8, 4);
      // Track left pole in attribute system
      setAttr(gate.left, y, leftColorName, 'BRIGHT_WHITE');

      // Right pole
      ctx.fillStyle = rightColor;
      ctx.fillRect(gate.right - 2, y, 4, 16);
      ctx.fillRect(gate.right - 4, y, 8, 4);
      // Track right pole in attribute system
      setAttr(gate.right, y, rightColorName, 'BRIGHT_WHITE');
    });

    // Obstacles - trees in ZX Spectrum colors
    obstacles.forEach((obstacle) => {
      const y = obstacle.y - cameraY;
      if (y < -16 || y > LOGICAL_H + 16) return;

      // Draw as simple trees in Spectrum style - green canopy
      ctx.fillStyle = ZX_PALETTE.GREEN;
      ctx.beginPath();
      ctx.moveTo(obstacle.x, y - obstacle.r);
      ctx.lineTo(obstacle.x - obstacle.r, y + obstacle.r);
      ctx.lineTo(obstacle.x + obstacle.r, y + obstacle.r);
      ctx.closePath();
      ctx.fill();
      // Track tree canopy in attribute system
      setAttr(obstacle.x, y, 'GREEN', 'BRIGHT_WHITE');

      // Trunk - red or yellow (ZX Spectrum didn't have brown)
      ctx.fillStyle = ZX_PALETTE.RED;
      ctx.fillRect(obstacle.x - 2, y + obstacle.r, 4, obstacle.r * 0.4);
    });
  }

  function drawHorace() {
    const drawY = horace.y - (state.mode === MODE.SKI ? cameraY : 0);
    const x = horace.x;
    const y = drawY;

    // Draw Horace in original ZX Spectrum style using palette colors
    // Blue normally, bright green when skiing
    const bodyColorName = state.skiEquipped ? 'BRIGHT_GREEN' : 'BRIGHT_BLUE';
    const bodyColor = ZX_PALETTE[bodyColorName];
    const paperColor = state.mode === MODE.SKI ? 'BRIGHT_WHITE' : 'BLACK';

    // Track Horace in attribute system (spans multiple 8x8 blocks)
    for (let hy = y; hy < y + horace.h; hy += 8) {
      for (let hx = x; hx < x + horace.w; hx += 8) {
        setAttr(hx, hy, bodyColorName, paperColor);
      }
    }

    ctx.fillStyle = bodyColor;

    // Characteristic rounded head shape
    ctx.fillRect(x + 5, y, 8, 2);      // Top of head
    ctx.fillRect(x + 3, y + 2, 12, 4); // Head middle/wide part
    ctx.fillRect(x + 5, y + 6, 8, 2);  // Head bottom

    // Eyes (bright white)
    ctx.fillStyle = ZX_PALETTE.BRIGHT_WHITE;
    ctx.fillRect(x + 5, y + 3, 2, 2);  // Left eye
    ctx.fillRect(x + 11, y + 3, 2, 2); // Right eye

    // Body
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x + 5, y + 8, 8, 6);  // Torso

    // Legs (distinctive tapered shape)
    ctx.fillRect(x + 6, y + 14, 3, 4); // Left leg
    ctx.fillRect(x + 9, y + 14, 3, 4); // Right leg

    // Feet (wider)
    ctx.fillRect(x + 5, y + 18, 3, 2); // Left foot
    ctx.fillRect(x + 10, y + 18, 3, 2);// Right foot

    // If skiing, draw skis (bright white)
    if (state.mode === MODE.SKI && state.skiEquipped) {
      ctx.fillStyle = ZX_PALETTE.BRIGHT_WHITE;
      // Longer skis
      ctx.fillRect(x + 3, y + 20, 2, 4);  // Left ski
      ctx.fillRect(x + 13, y + 20, 2, 4); // Right ski
    }
  }

  function updateHUD() {
    scoreEl.textContent = `Score: ${state.score}`;
    livesEl.textContent = `Lives: ${state.lives}`;
    modeEl.textContent = `Mode: ${state.mode}`;
  }

  function getCss(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  function draw(dt) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clear attribute buffer for new frame
    clearAttrs(state.mode === MODE.SKI ? 'BRIGHT_WHITE' : 'BLACK');

    const dpr = window.devicePixelRatio || 1;
    // Integer scaling for crisp pixels - no blur between pixels
    const maxScale = Math.min(window.innerWidth / LOGICAL_W, window.innerHeight / LOGICAL_H);
    const scale = Math.max(1, Math.floor(maxScale));
    const offsetX = (window.innerWidth - LOGICAL_W * scale) / 2;
    const offsetY = (window.innerHeight - LOGICAL_H * scale) / 2;
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offsetX * dpr, offsetY * dpr);
    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    if (state.mode === MODE.ROAD) {
      drawRoad();
    } else if (state.mode === MODE.SKI) {
      drawSki();
    }

    drawHorace();

    // Draw attribute grid overlay (debug visualization)
    drawAttrGrid();

    if (state.messageTime > 0) {
      state.messageTime -= dt;
      if (state.messageTime <= 0) {
        messageEl.textContent = "";
      }
    }
  }

  function loop(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const dt = Math.min(0.04, (timestamp - state.lastTime) / 1000);
    state.lastTime = timestamp;

    if (overlayEl.classList.contains("hidden")) {
      if (state.mode === MODE.ROAD) updateRoad(dt);
      if (state.mode === MODE.SKI) updateSki(dt);
    }

    draw(dt);
    updateHUD();
    requestAnimationFrame(loop);
  }

  function resetGame() {
    state.lives = 3;
    state.score = 0;
    state.loopCount = 0;
    state.skiEquipped = false;
    state.hasReturnedWithSkis = false;
    state.mode = MODE.ROAD;
    document.getElementById("title").textContent = "HORACE GOES SKIING";
    document.getElementById("subtitle").textContent = "Cross the road, rent skis, slalom gates.";
    document.getElementById("controls-hint").textContent = "Keyboard: arrows + space. Touch: on-screen pad.";
    resetRoad();
  }


  function updateOrientationHint() {
    // Game is now landscape (256x192), so we want landscape orientation
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    // Show rotate hint on touch devices that are in portrait mode
    rotateEl.classList.toggle("visible", isTouch && !isLandscape);
  }

  function setupResize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
  }

  function handleSwipe(startX, startY, endX, endY) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe (proportional for 256 width)
      if (Math.abs(deltaX) > minSwipeDistance) {
        const stepSize = 24;
        if (deltaX > 0) {
          // Swipe right
          horace.x += stepSize;
          playMove();
        } else {
          // Swipe left
          horace.x -= stepSize;
          playMove();
        }
        // Constrain position
        horace.x = Math.max(0, Math.min(LOGICAL_W - horace.w, horace.x));
      }
    } else {
      // Vertical swipe (proportional for 192 height)
      if (Math.abs(deltaY) > minSwipeDistance) {
        const stepSize = 16;
        if (deltaY < 0) {
          // Swipe up
          horace.y -= stepSize;
          playMove();
        } else {
          // Swipe down
          horace.y += stepSize;
          playMove();
        }
      }
    }
  }

  function bindInput() {
    // Keyboard controls
    window.addEventListener("keydown", (event) => {
      if (controlMode !== 'keyboard') return;
      initAudio();
      if (event.key === "ArrowUp" || event.key === "w") input.up = true;
      if (event.key === "ArrowDown" || event.key === "s") input.down = true;
      if (event.key === "ArrowLeft" || event.key === "a") input.left = true;
      if (event.key === "ArrowRight" || event.key === "d") input.right = true;
    });

    window.addEventListener("keyup", (event) => {
      if (controlMode !== 'keyboard') return;
      if (event.key === "ArrowUp" || event.key === "w") input.up = false;
      if (event.key === "ArrowDown" || event.key === "s") input.down = false;
      if (event.key === "ArrowLeft" || event.key === "a") input.left = false;
      if (event.key === "ArrowRight" || event.key === "d") input.right = false;
    });

    // Swipe controls
    canvas.addEventListener("touchstart", (event) => {
      if (controlMode !== 'swipe') return;
      initAudio();
      event.preventDefault();
      const touch = event.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = performance.now();
      isTouching = true;
    });

    canvas.addEventListener("touchmove", (event) => {
      if (controlMode !== 'swipe') return;
      event.preventDefault();
    });

    canvas.addEventListener("touchend", (event) => {
      if (controlMode !== 'swipe') return;
      event.preventDefault();
      const touch = event.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const touchDuration = performance.now() - touchStartTime;

      // Only treat as swipe if quick (< 300ms)
      if (touchDuration < 300) {
        handleSwipe(touchStartX, touchStartY, endX, endY);
      }

      isTouching = false;
    });

    canvas.addEventListener("touchcancel", (event) => {
      if (controlMode !== 'swipe') return;
      event.preventDefault();
      isTouching = false;
    });

    // Control mode selection
    document.querySelectorAll(".control-option").forEach(option => {
      option.addEventListener("click", () => {
        initAudio();
        controlMode = option.dataset.mode;
        overlayEl.classList.add("hidden");
        resetGame();
      });
    });

    // Debug controls (work regardless of control mode)
    window.addEventListener("keydown", (event) => {
      if (event.key === "g" || event.key === "G") {
        showAttrGrid = !showAttrGrid;
      }
    });
  }



  function start() {
    clearAttrs();  // Initialize attribute buffer
    resetRoad();
    bindInput();
    setupResize();
    updateOrientationHint();
    window.addEventListener("resize", () => {
      setupResize();
      updateOrientationHint();
    });
    state.lastTime = 0;

    state.mode = MODE.ROAD;
    requestAnimationFrame(loop);
  }

  start();
})();
