const c = document.getElementById("game");
const x = c.getContext("2d");
const finish = document.getElementById("finish");

const keys = {};

let started = false;
let dead = false;
let finished = false;

let particles = [];

onkeydown = (e) => {
  keys[e.key.toLowerCase()] = true;

  if (e.key === "Enter") {

    if (dead || finished) {
      location.reload();
      return;
    }

    started = true;
  }
};

onkeyup = (e) => {
  keys[e.key.toLowerCase()] = false;
};

let speed = 0;
let progress = 0;
let lane = 0;

const cpus = [
  { p: 80, l: -35 },
  { p: 180, l: 20 },
  { p: 280, l: -15 },
  { p: 380, l: 40 }
];

function clampCpuLane(cpu) {
  cpu.l = Math.max(-55, Math.min(55, cpu.l));
}

function drawCar(px, py, scale, color) {

  const w = 16 * scale;
  const h = 28 * scale;

  x.fillStyle = color;

  x.beginPath();
  x.moveTo(px, py - h / 2);
  x.lineTo(px + w / 2, py - h / 4);
  x.lineTo(px + w / 2, py + h / 2);
  x.lineTo(px - w / 2, py + h / 2);
  x.lineTo(px - w / 2, py - h / 4);
  x.closePath();
  x.fill();

  x.fillStyle = "#77aaff";
  x.fillRect(px - w * 0.25, py - h * 0.25, w * 0.5, h * 0.25);

  x.fillStyle = "#111";
  x.fillRect(px - w / 2 - 2, py - h / 4, 4, 6);
  x.fillRect(px + w / 2 - 2, py - h / 4, 4, 6);
  x.fillRect(px - w / 2 - 2, py + h / 4, 4, 6);
  x.fillRect(px + w / 2 - 2, py + h / 4, 4, 6);
}

function explode(px, py) {
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: px,
      y: py,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 60
    });
  }
}

function loop() {

  requestAnimationFrame(loop);

  // =========================
  // UPDATE (STOP WHEN DEAD OR FINISHED)
  // =========================
  if (started && !dead && !finished) {

    if (keys.w) speed = Math.min(speed + 0.05, 5);
    if (keys.s) speed = Math.max(speed - 0.08, 0);
    if (keys.a) lane -= 2;
    if (keys.d) lane += 2;

    lane = Math.max(-80, Math.min(80, lane));

    speed *= 0.99;
    progress += speed;

    for (const cpu of cpus) {
      cpu.p += 1.6 + Math.random() * 1.2;
      cpu.l += (Math.random() - 0.5) * 1.5;
      clampCpuLane(cpu);
    }

    // FINISH CHECK
    if (progress >= 1000) {
      finished = true;
      finish.classList.remove("hidden");
    }
  }

  // =========================
  // BACKGROUND
  // =========================
  x.fillStyle = "#7ec0ee";
  x.fillRect(0, 0, 320, 180);

  x.fillStyle = "#5ea54a";
  x.fillRect(0, 70, 320, 110);

  for (let y = 70; y < 180; y++) {
    let p = (y - 70) / 110;
    let rw = 40 + p * 180;
    let cx = 160 + Math.sin(progress * 0.01) * 20;

    x.fillStyle = "#666";
    x.fillRect(cx - rw / 2, y, rw, 1);
  }

  // =========================
  // CARS + RANK
  // =========================
  let all = [
    ...cpus.map((c, i) => ({ n: "CPU" + (i + 1), p: c.p })),
    { n: "YOU", p: progress }
  ];

  all.sort((a, b) => b.p - a.p);

  const rank = all.findIndex(v => v.n === "YOU") + 1;

  for (const cpu of cpus) {

    const rel = cpu.p - progress;

    if (rel > -40 && rel < 220) {

      const dy = 160 - rel;
      const scale = Math.max(0.5, (dy - 40) / 120);

      drawCar(160 + cpu.l, dy, scale, "#ffffff");

      if (
        Math.abs(rel) < 8 &&
        Math.abs(cpu.l - lane) < 12 &&
        !dead
      ) {
        dead = true;
        explode(160 + lane, 155);
      }
    }
  }

  drawCar(160 + lane, 155, 1, "#d22");

  // =========================
  // PARTICLES
  // =========================
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    x.fillStyle = p.life > 30 ? "orange" : "yellow";
    x.fillRect(p.x, p.y, 4, 4);
  });

  particles = particles.filter(p => p.life > 0);

  // =========================
  // UI
  // =========================
  x.fillStyle = "#fff";
  x.font = "bold 12px Arial";

  x.fillText("SPD: " + Math.floor(speed * 40), 8, 15);
  x.fillText("RANK: " + rank + "/" + (cpus.length + 1), 220, 15);

  // =========================
  // MINI MAP (ALWAYS ON)
  // =========================
  x.strokeStyle = "#fff";
  x.strokeRect(250, 130, 60, 40);

  x.fillStyle = "red";
  x.fillRect(
    278,
    130 + (progress % 1000) / 25,
    4,
    4
  );

  cpus.forEach((cpu, i) => {
    x.fillStyle = "#fff";
    x.fillRect(
      255 + i * 10,
      130 + (cpu.p % 1000) / 25,
      3,
      3
    );
  });

  // =========================
  // DEAD SCREEN
  // =========================
  if (dead) {

    x.fillStyle = "rgba(0,0,0,.85)";
    x.fillRect(0, 0, 320, 180);

    x.fillStyle = "#ff4444";
    x.textAlign = "center";
    x.font = "bold 28px Arial";
    x.fillText("YOU DIED", 160, 80);

    x.fillStyle = "#fff";
    x.font = "14px Arial";
    x.fillText("PRESS ENTER", 160, 110);

    x.textAlign = "left";
  }

  // =========================
  // FINISH SCREEN (FREEZE GAME)
  // =========================
  if (finished) {

    x.fillStyle = "rgba(0,0,0,.85)";
    x.fillRect(0, 0, 320, 180);

    x.fillStyle = "#00ff88";
    x.textAlign = "center";
    x.font = "bold 26px Arial";
    x.fillText("FINISH!", 160, 80);

    x.fillStyle = "#fff";
    x.font = "14px Arial";
    x.fillText("RACE COMPLETED", 160, 110);
    x.fillText("PRESS ENTER TO RESTART", 160, 130);

    x.textAlign = "left";

    return; // 🔥 완전 정지
  }

  // =========================
  // START SCREEN
  // =========================
  if (!started) {

    x.fillStyle = "rgba(0,0,0,.75)";
    x.fillRect(0, 0, 320, 180);

    x.fillStyle = "#fff";
    x.textAlign = "center";

    x.font = "bold 22px Arial";
    x.fillText("RETRO RACER", 160, 80);

    x.font = "14px Arial";
    x.fillText("PRESS ENTER", 160, 105);

    x.font = "12px Arial";
    x.fillText("W A S D TO DRIVE", 160, 125);

    x.textAlign = "left";
  }
}

loop();