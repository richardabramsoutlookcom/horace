(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const modeEl = document.getElementById("mode");
  const messageEl = document.getElementById("message");
  const overlayEl = document.getElementById("overlay");
  const startBtn = document.getElementById("start");
  const rotateEl = document.getElementById("rotate");
  const touchControlsEl = document.getElementById("touch-controls");

  const LOGICAL_W = 360;
  const LOGICAL_H = 640;

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
    x: LOGICAL_W / 2,
    y: LOGICAL_H - 50,
    w: 18,
    h: 22,
    speed: 0,
    maxSpeed: 180,
    acceleration: 300,
    deceleration: 250,
  };

  let vehicles = [];
  let gates = [];
  let obstacles = [];
  let slopeLength = 2200;
  let cameraY = 0;
  let shopTimer = 0;
  let shopScored = false;

  const roadLayout = {
    top: 90,
    bottom: 560,
    lanes: 5,
  };

  const shopRect = {
    x: LOGICAL_W * 0.2,
    y: 16,
    w: LOGICAL_W * 0.6,
    h: 58,
  };

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
    horace.x = LOGICAL_W / 2;
    horace.y = LOGICAL_H - 40;
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
        const width = 38 + Math.random() * 30;
        const speedBase = 60 + Math.random() * 50;
        const speed = dir * speedBase * (1 + state.loopCount * 0.08);
        vehicles.push({
          x: Math.random() * LOGICAL_W,
          y: laneY - 10,
          w: width,
          h: 20,
          speed,
        });
      }
    }
    resetHoraceToRoad();
  }

  function resetSkiRun() {
    gates = [];
    obstacles = [];
    slopeLength = 2200 + state.loopCount * 120;
    const baseSpacing = Math.max(100, 180 - state.loopCount * 12);
    const gap = Math.max(60, 100 - state.loopCount * 6);
    let y = 200;
    while (y < slopeLength - 200) {
      const margin = 30;
      const left = margin + Math.random() * (LOGICAL_W - gap - margin * 2);
      gates.push({
        left,
        right: left + gap,
        y,
        passed: false,
      });
      y += baseSpacing + Math.random() * 40;
    }

    const obstacleCount = Math.min(16, 5 + state.loopCount * 2);
    for (let i = 0; i < obstacleCount; i += 1) {
      obstacles.push({
        x: 24 + Math.random() * (LOGICAL_W - 48),
        y: 240 + Math.random() * (slopeLength - 480),
        r: 12 + Math.random() * 8,
      });
    }

    horace.x = LOGICAL_W / 2;
    horace.y = 40;
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

    // Forward/back controls only with acceleration
    const isMoving = input.up || input.down;

    if (input.up) {
      horace.speed = Math.min(horace.speed + horace.acceleration * dt, horace.maxSpeed);
    } else if (input.down) {
      horace.speed = Math.min(horace.speed + horace.acceleration * dt, horace.maxSpeed);
    } else {
      // Decelerate when no input
      horace.speed = Math.max(horace.speed - horace.deceleration * dt, 0);
    }

    if (isMoving && horace.speed > 0) {
      const direction = input.up ? -1 : 1;
      horace.y += direction * horace.speed * dt;
      shopTimer = 0;

      // Play movement sound occasionally
      const now = performance.now();
      if (now - lastMoveSound > 100) {
        playMove();
        lastMoveSound = now;
      }
    } else if (isHoraceInShop()) {
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

    // Keep Horace centered horizontally, only limit vertical movement
    horace.x = LOGICAL_W / 2 - horace.w / 2;
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
    // Forward/back controls with acceleration
    if (input.up) {
      horace.speed = Math.min(horace.speed + horace.acceleration * dt, horace.maxSpeed);
    } else if (input.down) {
      horace.speed = Math.min(horace.speed + horace.acceleration * dt, horace.maxSpeed);
    } else {
      horace.speed = Math.max(horace.speed - horace.deceleration * dt, 0);
    }

    // Auto-scroll down the slope with player speed affecting it
    const baseSpeed = 110 + state.loopCount * 5;
    const direction = input.up ? -1 : (input.down ? 1 : 0);
    const speedModifier = direction * horace.speed * 0.3;
    horace.y += (baseSpeed + speedModifier) * dt;

    // Keep centered horizontally
    horace.x = LOGICAL_W / 2 - horace.w / 2;

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
    // Background - black like original
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // Top area with ski shop
    ctx.fillStyle = "#A0A0A0";
    ctx.fillRect(0, 0, LOGICAL_W, roadLayout.top);

    // Ski shop building
    ctx.fillStyle = "#0000FF";
    ctx.fillRect(shopRect.x, shopRect.y + 10, shopRect.w, shopRect.h - 20);

    // Shop roof
    ctx.fillStyle = "#FF0000";
    ctx.beginPath();
    ctx.moveTo(shopRect.x - 10, shopRect.y + 10);
    ctx.lineTo(shopRect.x + shopRect.w / 2, shopRect.y - 5);
    ctx.lineTo(shopRect.x + shopRect.w + 10, shopRect.y + 10);
    ctx.fill();

    // Shop sign
    ctx.fillStyle = "#FFFF00";
    ctx.font = "bold 12px monospace";
    ctx.fillText("SKIS", shopRect.x + shopRect.w / 2 - 20, shopRect.y + 40);

    // Road
    ctx.fillStyle = "#404040";
    ctx.fillRect(0, roadLayout.top, LOGICAL_W, roadLayout.bottom - roadLayout.top);

    // Lane markings - dashed white lines
    ctx.fillStyle = "#FFFFFF";
    const laneHeight = (roadLayout.bottom - roadLayout.top) / roadLayout.lanes;
    for (let i = 1; i < roadLayout.lanes; i += 1) {
      const y = roadLayout.top + laneHeight * i;
      for (let x = 0; x < LOGICAL_W; x += 20) {
        ctx.fillRect(x, y - 1, 10, 2);
      }
    }

    // Bottom pavement
    ctx.fillStyle = "#A0A0A0";
    ctx.fillRect(pavementRect.x, pavementRect.y, pavementRect.w, pavementRect.h);

    // Vehicles - colorful blocky cars
    vehicles.forEach((vehicle) => {
      const mainColor = vehicle.speed > 0 ? "#FFFF00" : "#FF0000";
      const accentColor = vehicle.speed > 0 ? "#FF00FF" : "#00FFFF";

      // Car body
      ctx.fillStyle = mainColor;
      ctx.fillRect(vehicle.x, vehicle.y, vehicle.w, vehicle.h);

      // Windows
      ctx.fillStyle = accentColor;
      ctx.fillRect(vehicle.x + vehicle.w * 0.2, vehicle.y + 2, vehicle.w * 0.3, vehicle.h - 4);
      ctx.fillRect(vehicle.x + vehicle.w * 0.6, vehicle.y + 2, vehicle.w * 0.25, vehicle.h - 4);

      // Wheels
      ctx.fillStyle = "#000000";
      ctx.fillRect(vehicle.x + 4, vehicle.y + vehicle.h - 2, 6, 2);
      ctx.fillRect(vehicle.x + vehicle.w - 10, vehicle.y + vehicle.h - 2, 6, 2);
    });
  }

  function drawSki() {
    // White snowy slope
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // Diagonal snow texture lines for movement effect
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i += 1) {
      const y = ((i * 100) - (cameraY * 0.5)) % LOGICAL_H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(LOGICAL_W, y + 30);
      ctx.stroke();
    }

    // Draw slalom gates - bright retro colors
    gates.forEach((gate) => {
      const y = gate.y - cameraY;
      if (y < -40 || y > LOGICAL_H + 40) return;

      const leftColor = gate.passed ? "#00FF00" : "#FF0000";
      const rightColor = gate.passed ? "#00FF00" : "#0000FF";

      // Left pole
      ctx.fillStyle = leftColor;
      ctx.fillRect(gate.left - 4, y, 8, 30);
      ctx.fillRect(gate.left - 8, y, 16, 8);

      // Right pole
      ctx.fillStyle = rightColor;
      ctx.fillRect(gate.right - 4, y, 8, 30);
      ctx.fillRect(gate.right - 8, y, 16, 8);
    });

    // Obstacles - trees/rocks
    obstacles.forEach((obstacle) => {
      const y = obstacle.y - cameraY;
      if (y < -30 || y > LOGICAL_H + 30) return;

      // Draw as simple trees in Spectrum style
      ctx.fillStyle = "#00AA00";
      ctx.beginPath();
      ctx.moveTo(obstacle.x, y - obstacle.r);
      ctx.lineTo(obstacle.x - obstacle.r, y + obstacle.r);
      ctx.lineTo(obstacle.x + obstacle.r, y + obstacle.r);
      ctx.closePath();
      ctx.fill();

      // Trunk
      ctx.fillStyle = "#804000";
      ctx.fillRect(obstacle.x - 3, y + obstacle.r, 6, obstacle.r * 0.5);
    });
  }

  function drawHorace() {
    const drawY = horace.y - (state.mode === MODE.SKI ? cameraY : 0);

    // Draw Horace sprite - blocky Spectrum style character
    const color = state.skiEquipped ? "#00FF00" : "#00FFFF";

    // Horace's body is made of blocks
    ctx.fillStyle = color;

    // Head
    ctx.fillRect(horace.x + 6, drawY + 2, 6, 6);

    // Eyes
    ctx.fillStyle = "#000000";
    ctx.fillRect(horace.x + 7, drawY + 4, 2, 2);
    ctx.fillRect(horace.x + 9, drawY + 4, 2, 2);

    // Body
    ctx.fillStyle = color;
    ctx.fillRect(horace.x + 4, drawY + 8, 10, 8);

    // Legs
    ctx.fillRect(horace.x + 5, drawY + 16, 3, 6);
    ctx.fillRect(horace.x + 10, drawY + 16, 3, 6);

    // If skiing, draw skis
    if (state.mode === MODE.SKI && state.skiEquipped) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(horace.x + 2, drawY + horace.h, 6, 2);
      ctx.fillRect(horace.x + horace.w - 8, drawY + horace.h, 6, 2);
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

    const dpr = window.devicePixelRatio || 1;
    const scale = Math.min(window.innerWidth / LOGICAL_W, window.innerHeight / LOGICAL_H);
    const offsetX = (window.innerWidth - LOGICAL_W * scale) / 2;
    const offsetY = (window.innerHeight - LOGICAL_H * scale) / 2;
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offsetX * dpr, offsetY * dpr);

    if (state.mode === MODE.ROAD) {
      drawRoad();
    } else if (state.mode === MODE.SKI) {
      drawSki();
    }

    drawHorace();

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

  function setTouchMode(enabled) {
    touchControlsEl.classList.toggle("hidden", !enabled);
  }

  function updateOrientationHint() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    rotateEl.classList.toggle("visible", isTouch && !isPortrait);
  }

  function setupResize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
  }

  function bindInput() {
    window.addEventListener("keydown", (event) => {
      initAudio();
      if (event.key === "ArrowUp" || event.key === "w") input.up = true;
      if (event.key === "ArrowDown" || event.key === "s") input.down = true;
      if (event.key === " ") {
        if (!overlayEl.classList.contains("hidden")) {
          overlayEl.classList.add("hidden");
          resetGame();
        }
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key === "ArrowUp" || event.key === "w") input.up = false;
      if (event.key === "ArrowDown" || event.key === "s") input.down = false;
    });

    const bindButton = (button) => {
      const dir = button.dataset.dir;
      const on = () => {
        initAudio();
        input[dir] = true;
      };
      const off = () => {
        input[dir] = false;
      };
      button.addEventListener("pointerdown", on);
      button.addEventListener("pointerup", off);
      button.addEventListener("pointerleave", off);
      button.addEventListener("pointercancel", off);
    };

    document.querySelectorAll("#touch-controls button[data-dir]").forEach(bindButton);

    startBtn.addEventListener("click", () => {
      initAudio();
      overlayEl.classList.add("hidden");
      resetGame();
    });
  }

  function tickTouchUI() {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setTouchMode(isTouch);
  }


  function start() {
    resetRoad();
    bindInput();
    setupResize();
    tickTouchUI();
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
