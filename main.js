(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const moneyEl = document.getElementById("money");
  const modeEl = document.getElementById("mode");
  const messageEl = document.getElementById("message");
  const overlayEl = document.getElementById("overlay");
  const rotateEl = document.getElementById("rotate");

  // ZX Spectrum native resolution
  const LOGICAL_W = 256;
  const LOGICAL_H = 192;

  // Fixed timestep for authentic 50Hz PAL timing
  const FIXED_DT = 1 / 50; // 0.02 seconds per update
  let accumulator = 0;

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

  // Horace sprite data - authentic 16x20 pixel character
  // 0 = transparent, 1 = body (BRIGHT_BLUE), 2 = eyes (BRIGHT_WHITE), 3 = pupils (BLACK)
  const HORACE_SPRITE = {
    width: 16,
    height: 20,
    // Walking frame (facing forward)
    walking: [
      // Row 0-2: Top of head (rounded)
      [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      // Row 3-6: Head with eyes
      [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,1,1,2,2,1,1,2,2,1,1,0,0,0],
      [0,0,0,1,1,2,3,1,1,2,3,1,1,0,0,0],
      [0,0,0,1,1,2,2,1,1,2,2,1,1,0,0,0],
      // Row 7-12: Body (wider blob)
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      // Row 13-16: Legs (two stumpy legs)
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0],
      // Row 17-19: Feet (wider than legs)
      [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
      [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
      [0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
    ],
    colors: ['transparent', 'BRIGHT_BLUE', 'BRIGHT_WHITE', 'BLACK']
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
  let currentOscillator = null;

  const state = {
    lives: 3,
    score: 0,
    money: 40,  // GAME-01: Start with $40
    mode: MODE.ROAD,
    skiEquipped: false,
    hasReturnedWithSkis: false,
    loopCount: 0,
    lastTime: 0,
    messageTime: 0,
    crossingStart: 0,
  };

  const horace = {
    x: LOGICAL_W / 2 - 8,
    y: LOGICAL_H - 24,
    w: HORACE_SPRITE.width,  // 16
    h: HORACE_SPRITE.height, // 20
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

  function stopCurrentSound() {
    if (currentOscillator) {
      try {
        currentOscillator.stop(audioContext.currentTime);
      } catch (e) {
        // Oscillator may have already stopped
      }
      currentOscillator = null;
    }
  }

  function playBeep(freq, duration, volume = 0.08) {
    if (!audioContext) return;
    stopCurrentSound();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    currentOscillator = osc;
    osc.onended = () => {
      if (currentOscillator === osc) {
        currentOscillator = null;
      }
    };
    osc.start();
    osc.stop(audioContext.currentTime + duration);
  }

  function playMove() {
    playBeep(100, 0.05, 0.03);
  }

  function playCarHit() {
    if (!audioContext) return;
    stopCurrentSound();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(200, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.3);
    gain.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    currentOscillator = osc;
    osc.onended = () => {
      if (currentOscillator === osc) {
        currentOscillator = null;
      }
    };
    osc.start();
    osc.stop(audioContext.currentTime + 0.3);
  }

  function playGatePass() {
    playBeep(880, 0.08, 0.06);
  }

  function playSkiEquipped() {
    // Play ascending notes sequentially using single oscillator with frequency changes
    // ZX Spectrum beeper could only play one sound at a time
    if (!audioContext) return;
    stopCurrentSound();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    currentOscillator = osc;

    // Ascending notes: 440Hz -> 660Hz -> 880Hz
    const now = audioContext.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(660, now + 0.1);
    osc.frequency.setValueAtTime(880, now + 0.2);

    osc.onended = () => {
      if (currentOscillator === osc) {
        currentOscillator = null;
      }
    };
    osc.start();
    osc.stop(now + 0.35);
  }

  function playModeChange() {
    playBeep(523, 0.12, 0.08);
  }

  // ZX Spectrum beeper sounds - frequencies approximated from original
  // Gate pass: quick high beep (success) - playGatePass at 880Hz
  // Gate miss: lower warning buzz (penalty but continue) - playGateMiss descending
  // Crash: descending harsh buzz (car/tree collision) - playCarHit
  // Ski jump: ascending sweep (lift-off - wired in Phase 4) - playSkiJump

  function playGateMiss() {
    // Gate miss warning: descending "uh-oh" feel
    // Lower frequency than gate pass, longer duration for warning effect
    if (!audioContext) return;
    stopCurrentSound();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    currentOscillator = osc;

    // Two quick descending tones: 300Hz -> 200Hz
    const now = audioContext.currentTime;
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.setValueAtTime(200, now + 0.08);

    osc.onended = () => {
      if (currentOscillator === osc) {
        currentOscillator = null;
      }
    };
    osc.start();
    osc.stop(now + 0.18);
  }

  function playSkiJump() {
    // Ski jump: "bizarre ascending sound" from original game
    // Ascending frequency sweep like going up/lifting off
    // Will be wired to ski jump mechanic in Phase 4
    if (!audioContext) return;
    stopCurrentSound();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    currentOscillator = osc;

    // Ascending sweep: 200Hz -> 800Hz over 0.3s
    const now = audioContext.currentTime;
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

    // Fade out at end
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.onended = () => {
      if (currentOscillator === osc) {
        currentOscillator = null;
      }
    };
    osc.start();
    osc.stop(now + 0.3);
  }

  // playTreeCrash uses same sound as playCarHit
  // Original ZX Spectrum likely used same crash sound for all collisions
  // Keeping as alias for semantic clarity in code
  function playTreeCrash() {
    playCarHit();
  }

  function setMessage(text, duration = 1.2) {
    messageEl.textContent = text;
    state.messageTime = duration;
  }

  function resetHoraceToRoad() {
    horace.x = LOGICAL_W / 2 - HORACE_SPRITE.width / 2;
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

    horace.x = LOGICAL_W / 2 - HORACE_SPRITE.width / 2;
    horace.y = 24;
    horace.speed = 0;
    cameraY = 0;
  }

  function loseLife(reason, playSound = true) {
    state.lives -= 1;
    if (playSound) {
      playCarHit();
    }
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

  // Road crossing discrete step movement (authentic ZX Spectrum feel)
  const ROAD_STEP_SIZE = 16; // One cell height - discrete step
  let stepCooldown = 0;

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
          // Gate miss: play warning sound (different from crash)
          // NOTE: Original game may not have lost a life for gate miss
          // (just score penalty) - defer gameplay fix to Phase 4
          playGateMiss();
          loseLife("Missed gate!", false); // false = skip crash sound, we played warning
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

  function drawVehicle(vehicle) {
    const isMovingRight = vehicle.speed > 0;
    const bodyColorName = isMovingRight ? 'BRIGHT_YELLOW' : 'BRIGHT_RED';
    const windowColorName = isMovingRight ? 'BLACK' : 'BRIGHT_YELLOW';

    // Main body - full rectangle
    ctx.fillStyle = ZX_PALETTE[bodyColorName];
    ctx.fillRect(vehicle.x, vehicle.y, vehicle.w, vehicle.h);

    // Windows - simple rectangles (2 windows per car)
    ctx.fillStyle = ZX_PALETTE[windowColorName];
    const windowW = Math.floor(vehicle.w * 0.2);
    const windowH = vehicle.h - 4;
    const windowY = vehicle.y + 2;
    // Front window
    ctx.fillRect(vehicle.x + Math.floor(vehicle.w * 0.6), windowY, windowW, windowH);
    // Back window
    ctx.fillRect(vehicle.x + Math.floor(vehicle.w * 0.2), windowY, windowW, windowH);

    // Wheels - black rectangles at bottom
    ctx.fillStyle = ZX_PALETTE.BLACK;
    ctx.fillRect(vehicle.x + 2, vehicle.y + vehicle.h - 3, 4, 3);
    ctx.fillRect(vehicle.x + vehicle.w - 6, vehicle.y + vehicle.h - 3, 4, 3);

    // Track in attribute system
    for (let vy = vehicle.y; vy < vehicle.y + vehicle.h; vy += 8) {
      for (let vx = vehicle.x; vx < vehicle.x + vehicle.w; vx += 8) {
        setAttr(vx, vy, bodyColorName, 'BLACK');
      }
    }
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

    // Vehicles - authentic ZX Spectrum blocky cars
    vehicles.forEach((vehicle) => {
      drawVehicle(vehicle);
    });
  }

  // Draw authentic ZX Spectrum-style slalom gate with flag poles
  function drawGate(gate, cameraY) {
    const y = gate.y - cameraY;
    if (y < -20 || y > LOGICAL_H + 20) return;

    // Color selection - passed gates turn green
    const leftColorName = gate.passed ? 'BRIGHT_GREEN' : 'BRIGHT_RED';
    const rightColorName = gate.passed ? 'BRIGHT_GREEN' : 'BRIGHT_BLUE';

    // Left pole with flag
    ctx.fillStyle = ZX_PALETTE[leftColorName];
    // Pole (thin vertical)
    ctx.fillRect(gate.left - 1, y, 3, 18);
    // Flag at top (extends right from pole)
    ctx.fillRect(gate.left + 2, y, 6, 4);
    // Track attribute
    setAttr(gate.left, y, leftColorName, 'BRIGHT_WHITE');

    // Right pole with flag
    ctx.fillStyle = ZX_PALETTE[rightColorName];
    // Pole (thin vertical)
    ctx.fillRect(gate.right - 1, y, 3, 18);
    // Flag at top (extends left from pole)
    ctx.fillRect(gate.right - 7, y, 6, 4);
    // Track attribute
    setAttr(gate.right, y, rightColorName, 'BRIGHT_WHITE');
  }

  // Draw authentic ZX Spectrum-style tree obstacle
  function drawTree(obstacle, cameraY) {
    const y = obstacle.y - cameraY;
    if (y < -20 || y > LOGICAL_H + 20) return;

    const x = obstacle.x;
    const size = obstacle.r; // Use radius as size reference

    // Green triangular canopy - drawn as stacked rectangles for blocky look
    ctx.fillStyle = ZX_PALETTE.GREEN;
    const canopyHeight = size * 1.5;
    for (let row = 0; row < canopyHeight; row++) {
      const width = Math.floor((canopyHeight - row) * 1.2);
      ctx.fillRect(x - width / 2, y - canopyHeight + row, width, 1);
    }

    // Red trunk (ZX Spectrum had no brown)
    ctx.fillStyle = ZX_PALETTE.RED;
    const trunkW = Math.max(2, Math.floor(size * 0.3));
    const trunkH = Math.floor(size * 0.5);
    ctx.fillRect(x - trunkW / 2, y, trunkW, trunkH);

    // Track in attribute system
    setAttr(x, y - size, 'GREEN', 'BRIGHT_WHITE');
    setAttr(x, y, 'RED', 'BRIGHT_WHITE');
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

    // Draw slalom gates using helper
    gates.forEach((gate) => {
      drawGate(gate, cameraY);
    });

    // Draw tree obstacles using helper
    obstacles.forEach((obstacle) => {
      drawTree(obstacle, cameraY);
    });
  }

  function drawHorace() {
    const drawY = horace.y - (state.mode === MODE.SKI ? cameraY : 0);
    const x = horace.x;
    const y = drawY;

    // Get sprite data
    const sprite = HORACE_SPRITE.walking;
    const colors = HORACE_SPRITE.colors;

    // Determine body color - green when skiing, blue otherwise
    const bodyColorName = state.skiEquipped ? 'BRIGHT_GREEN' : 'BRIGHT_BLUE';
    const paperColor = state.mode === MODE.SKI ? 'BRIGHT_WHITE' : 'BLACK';

    // Track Horace in attribute system (spans multiple 8x8 blocks)
    for (let hy = y; hy < y + HORACE_SPRITE.height; hy += 8) {
      for (let hx = x; hx < x + HORACE_SPRITE.width; hx += 8) {
        setAttr(hx, hy, bodyColorName, paperColor);
      }
    }

    // Render sprite pixel by pixel
    for (let row = 0; row < HORACE_SPRITE.height; row++) {
      for (let col = 0; col < HORACE_SPRITE.width; col++) {
        const colorIndex = sprite[row][col];
        if (colorIndex === 0) continue; // transparent

        // Get color name, substituting body color for index 1
        let colorName = colors[colorIndex];
        if (colorIndex === 1) {
          colorName = bodyColorName;
        }

        ctx.fillStyle = ZX_PALETTE[colorName];
        ctx.fillRect(x + col, y + row, 1, 1);
      }
    }

    // If skiing, draw skis below the sprite (bright white)
    if (state.mode === MODE.SKI && state.skiEquipped) {
      ctx.fillStyle = ZX_PALETTE.BRIGHT_WHITE;
      // Skis positioned below feet
      ctx.fillRect(x + 4, y + HORACE_SPRITE.height, 2, 4);  // Left ski
      ctx.fillRect(x + 10, y + HORACE_SPRITE.height, 2, 4); // Right ski
    }
  }

  function updateHUD() {
    scoreEl.textContent = `Score: ${state.score}`;
    livesEl.textContent = `Lives: ${state.lives}`;
    moneyEl.textContent = `$${state.money}`;
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
    const frameDt = Math.min(0.04, (timestamp - state.lastTime) / 1000);
    state.lastTime = timestamp;

    accumulator += frameDt;

    // Fixed timestep update loop - runs at consistent 50Hz
    while (accumulator >= FIXED_DT) {
      if (overlayEl.classList.contains("hidden")) {
        if (state.mode === MODE.ROAD) updateRoad(FIXED_DT);
        if (state.mode === MODE.SKI) updateSki(FIXED_DT);
      }
      accumulator -= FIXED_DT;
    }

    draw(frameDt); // Drawing still uses frame time for smooth visuals
    updateHUD();
    requestAnimationFrame(loop);
  }

  function resetGame() {
    state.lives = 3;
    state.score = 0;
    state.money = 40;  // GAME-01: Reset to $40
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
