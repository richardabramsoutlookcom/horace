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
  const dpadEl = document.getElementById("dpad");
  const skiPadEl = document.getElementById("ski-pad");
  const actionBtn = document.getElementById("action");

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
    speed: 150,
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

  function playBeep(freq, duration) {
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
  }

  function setMessage(text, duration = 1.2) {
    messageEl.textContent = text;
    state.messageTime = duration;
  }

  function resetHoraceToRoad() {
    horace.x = LOGICAL_W / 2;
    horace.y = LOGICAL_H - 40;
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
    cameraY = 0;
  }

  function loseLife(reason) {
    state.lives -= 1;
    playBeep(140, 0.25);
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

  function updateRoad(dt) {
    const laneHeight = (roadLayout.bottom - roadLayout.top) / roadLayout.lanes;
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

    const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    if (dx !== 0 || dy !== 0) {
      horace.x += dx * horace.speed * dt;
      horace.y += dy * horace.speed * dt;
      shopTimer = 0;
    } else if (isHoraceInShop()) {
      shopTimer += dt;
      if (!state.skiEquipped && shopTimer > 0.4) {
        state.skiEquipped = true;
        playBeep(520, 0.12);
        if (!shopScored) {
          const elapsed = (performance.now() - state.crossingStart) / 1000;
          const bonus = Math.max(0, Math.floor(80 - elapsed * 10));
          state.score += 120 + bonus;
          shopScored = true;
        }
        setMessage("Skis equipped!");
      }
    }

    horace.x = Math.max(0, Math.min(LOGICAL_W - horace.w, horace.x));
    horace.y = Math.max(0, Math.min(LOGICAL_H - horace.h, horace.y));

    for (const vehicle of vehicles) {
      if (rectOverlap(horace, vehicle)) {
        loseLife("Hit by car!");
        return;
      }
    }

    if (horace.y <= 0) {
      if (!state.skiEquipped) {
        loseLife("Rent skis!");
        return;
      }
      state.mode = MODE.SKI;
      resetSkiRun();
      setMessage("Ski run!");
    }
  }

  function updateSki(dt) {
    const verticalSpeed = 110 + state.loopCount * 5;
    const horizontalSpeed = 150;
    horace.y += verticalSpeed * dt;
    const dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    horace.x += dx * horizontalSpeed * dt;
    horace.x = Math.max(0, Math.min(LOGICAL_W - horace.w, horace.x));

    cameraY = Math.max(0, Math.min(slopeLength - LOGICAL_H, horace.y - LOGICAL_H * 0.3));

    for (const gate of gates) {
      if (!gate.passed && horace.y >= gate.y) {
        const centerX = horace.x + horace.w / 2;
        if (centerX > gate.left && centerX < gate.right) {
          gate.passed = true;
          state.score += 30;
          playBeep(660, 0.08);
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
      state.score += 150;
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
    ctx.fillStyle = getCss("--road");
    ctx.fillRect(0, roadLayout.top, LOGICAL_W, roadLayout.bottom - roadLayout.top);

    ctx.fillStyle = getCss("--lane");
    const laneHeight = (roadLayout.bottom - roadLayout.top) / roadLayout.lanes;
    for (let i = 0; i < roadLayout.lanes; i += 1) {
      const y = roadLayout.top + laneHeight * i;
      ctx.fillRect(0, y + laneHeight / 2 - 1, LOGICAL_W, 2);
    }

    ctx.fillStyle = getCss("--shop");
    ctx.fillRect(shopRect.x, shopRect.y, shopRect.w, shopRect.h);

    ctx.fillStyle = "#f5f1df";
    ctx.fillRect(pavementRect.x, pavementRect.y, pavementRect.w, pavementRect.h);

    vehicles.forEach((vehicle) => {
      ctx.fillStyle = vehicle.speed > 0 ? "#2f7d8f" : "#b0574c";
      ctx.fillRect(vehicle.x, vehicle.y, vehicle.w, vehicle.h);
    });
  }

  function drawSki() {
    ctx.fillStyle = getCss("--slope");
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    ctx.fillStyle = "#d5e8ff";
    for (let i = 0; i < 6; i += 1) {
      const y = ((i * 220) - (cameraY * 0.2)) % LOGICAL_H;
      ctx.fillRect(0, y, LOGICAL_W, 8);
    }

    gates.forEach((gate) => {
      const y = gate.y - cameraY;
      if (y < -40 || y > LOGICAL_H + 40) return;
      ctx.strokeStyle = getCss("--gate");
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gate.left, y);
      ctx.lineTo(gate.left, y + 26);
      ctx.moveTo(gate.right, y);
      ctx.lineTo(gate.right, y + 26);
      ctx.stroke();

      ctx.fillStyle = gate.passed ? "#9dc88d" : getCss("--gate");
      ctx.fillRect(gate.left - 6, y, 6, 12);
      ctx.fillRect(gate.right, y, 6, 12);
    });

    obstacles.forEach((obstacle) => {
      const y = obstacle.y - cameraY;
      if (y < -30 || y > LOGICAL_H + 30) return;
      ctx.fillStyle = "#6a7f5c";
      ctx.beginPath();
      ctx.arc(obstacle.x, y, obstacle.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawHorace() {
    ctx.fillStyle = "#2b2b2b";
    ctx.fillRect(horace.x, horace.y - (state.mode === MODE.SKI ? cameraY : 0), horace.w, horace.h);
    ctx.fillStyle = state.skiEquipped ? "#ffb545" : "#6b88a4";
    ctx.fillRect(horace.x + 2, horace.y - (state.mode === MODE.SKI ? cameraY : 0) + 4, horace.w - 4, horace.h - 8);
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
      watchModeChange();
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
    state.mode = MODE.ROAD;
    document.getElementById("title").textContent = "HORACE GOES SKIING";
    document.getElementById("subtitle").textContent = "Cross the road, rent skis, slalom gates.";
    document.getElementById("controls-hint").textContent = "Keyboard: arrows + space. Touch: on-screen pad.";
    resetRoad();
  }

  function setTouchMode(enabled) {
    touchControlsEl.classList.toggle("hidden", !enabled);
    if (enabled) {
      if (state.mode === MODE.SKI) {
        dpadEl.classList.add("hidden");
        skiPadEl.classList.remove("hidden");
      } else {
        dpadEl.classList.remove("hidden");
        skiPadEl.classList.add("hidden");
      }
    }
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
      if (event.key === "ArrowLeft" || event.key === "a") input.left = true;
      if (event.key === "ArrowRight" || event.key === "d") input.right = true;
      if (event.key === " ") input.action = true;

      if (!overlayEl.classList.contains("hidden") && event.key === " ") {
        overlayEl.classList.add("hidden");
        resetGame();
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.key === "ArrowUp" || event.key === "w") input.up = false;
      if (event.key === "ArrowDown" || event.key === "s") input.down = false;
      if (event.key === "ArrowLeft" || event.key === "a") input.left = false;
      if (event.key === "ArrowRight" || event.key === "d") input.right = false;
      if (event.key === " ") input.action = false;
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

    actionBtn.addEventListener("pointerdown", () => {
      initAudio();
      if (!overlayEl.classList.contains("hidden")) {
        overlayEl.classList.add("hidden");
        resetGame();
      }
    });

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

  function watchModeChange() {
    if (state.mode === MODE.SKI) {
      dpadEl.classList.add("hidden");
      skiPadEl.classList.remove("hidden");
    } else {
      dpadEl.classList.remove("hidden");
      skiPadEl.classList.add("hidden");
    }
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
