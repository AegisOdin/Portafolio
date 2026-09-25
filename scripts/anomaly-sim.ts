// Headless balance check for ANOMALY. A simple kiting bot plays full runs.
// Usage: node scripts/anomaly-sim.ts [runs=6] [skill=0.8]
import { createGame, update, choose, drainEvents, type Game } from "../src/lib/anomaly/engine.ts";

const runs = Number(process.argv[2] ?? 6);
const skill = Number(process.argv[3] ?? 0.8); // 0 = stands still, 1 = kites well
const STEP = 1 / 60;

function botMove(g: Game) {
  const p = g.player;
  let rx = 0, ry = 0;
  // Flee: closer enemies push much harder.
  for (const e of g.enemies) {
    const dx = p.x - e.x, dy = p.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const reach = e.kind === "sentinel" ? 220 : 130;
    if (d > reach) continue;
    const w = ((reach - d) / reach) ** 2 * (e.kind === "sentinel" ? 6 : 2.5);
    rx += (dx / d) * w; ry += (dy / d) * w;
  }
  // Greed: walk toward the nearest gem.
  let best = null as Game["gems"][number] | null, bd = 420 * 420;
  for (const gem of g.gems) {
    const d = (gem.x - p.x) ** 2 + (gem.y - p.y) ** 2;
    if (d < bd) { bd = d; best = gem; }
  }
  if (best) {
    const d = Math.sqrt(bd) || 1;
    rx += ((best.x - p.x) / d) * 0.8; ry += ((best.y - p.y) / d) * 0.8;
  }
  const m = Math.hypot(rx, ry);
  if (m < 0.01) return { x: 0, y: 0 };
  // Imperfect play: wobble so a bot at skill < 1 still takes hits.
  const wobble = (1 - skill) * 1.4;
  return { x: rx / m + (Math.random() - 0.5) * wobble, y: ry / m + (Math.random() - 0.5) * wobble };
}

for (let r = 0; r < runs; r++) {
  const g = createGame({ seed: 1000 + r, viewW: 960, viewH: 560 });
  const levelAt: Record<number, number> = {};
  let peak = 0, worstMs = 0;
  const started = performance.now();
  while (g.status !== "over" && g.status !== "won") {
    if (g.status === "levelup") { choose(g, 0); continue; }
    const t0 = performance.now();
    update(g, STEP, botMove(g));
    worstMs = Math.max(worstMs, performance.now() - t0);
    drainEvents(g);
    peak = Math.max(peak, g.enemies.length);
    const minute = Math.floor(g.time / 60);
    levelAt[minute] ??= g.player.level;
    for (const e of g.enemies) if (!Number.isFinite(e.x + e.y + e.hp)) throw new Error(`NaN enemy at ${g.time}`);
    if (!Number.isFinite(g.player.x + g.player.y + g.player.hp)) throw new Error(`NaN player at ${g.time}`);
  }
  const loadout = [...g.weapons, ...g.passives].map((i) => `${i.id}${i.level}`).join(" ");
  console.log(
    `run ${r}: ${g.status.padEnd(4)} at ${fmt(g.time)} · lv ${g.player.level} · kills ${g.kills} · peak ${peak} enemies · worst tick ${worstMs.toFixed(2)}ms · sim ${((performance.now() - started) / 1000).toFixed(1)}s`,
  );
  console.log(`        levels by minute: ${Object.entries(levelAt).map(([m, l]) => `${m}m:${l}`).join(" ")} · ${loadout}`);
}

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
