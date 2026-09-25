/**
 * ANOMALY — a survivors-style run for the /dev/arcade cabinet.
 *
 * Pure simulation: no DOM, no canvas. The Astro component feeds it input and
 * a fixed timestep, the renderer only reads it, and a headless bot can play it
 * for tuning (see scripts in the PR notes). World units are CSS pixels at zoom 1.
 */

export type WeaponId = "ping" | "fork" | "firewall" | "grep" | "rmrf" | "pipe";
export type PassiveId = "overclock" | "sudo" | "ram" | "cache" | "nice" | "patch" | "threads";
export type BonusId = "reboot";
export type ItemId = WeaponId | PassiveId;
export type EnemyKind = "fragment" | "glitch" | "daemon" | "agent" | "sentinel";
export type GameStatus = "running" | "levelup" | "over" | "won";
export type Tone = "accent" | "ink" | "amber" | "cyan" | "magenta" | "danger";
export type WarningKey = "agents" | "swarm" | "storm" | "sentinel" | "purge";

export const RUN_SECONDS = 600;
export const MAX_WEAPONS = 4;
export const MAX_PASSIVES = 4;
export const WEAPON_MAX_LEVEL = 6;
export const WEAPON_IDS: readonly WeaponId[] = ["ping", "fork", "firewall", "grep", "rmrf", "pipe"];
export const PASSIVE_IDS: readonly PassiveId[] = ["overclock", "sudo", "ram", "cache", "nice", "patch", "threads"];
export const PASSIVE_MAX_LEVEL: Record<PassiveId, number> = {
  overclock: 5, sudo: 5, ram: 5, cache: 4, nice: 4, patch: 5, threads: 2,
};

// Weapon tables; index = level - 1.
const PING = {
  cooldown: [1.0, 0.92, 0.85, 0.78, 0.68, 0.6],
  count: [1, 1, 2, 2, 3, 3],
  damage: [10, 13, 13, 16, 18, 22],
  pierce: [0, 0, 0, 1, 1, 2],
};
const FORK = {
  count: [2, 2, 3, 3, 4, 5],
  radius: [48, 54, 56, 60, 66, 72],
  damage: [7, 9, 10, 12, 14, 16],
  spin: [3.0, 3.2, 3.3, 3.7, 3.9, 4.2],
};
const FIREWALL = {
  radius: [46, 56, 58, 70, 72, 88],
  damage: [4, 4, 6, 6, 8, 10],
  tick: [0.5, 0.5, 0.48, 0.42, 0.42, 0.4],
};
const GREP = {
  cooldown: [2.4, 2.25, 2.1, 2.0, 1.8, 1.4],
  length: [240, 270, 280, 290, 340, 360],
  width: [12, 13, 14, 15, 17, 19],
  damage: [20, 25, 30, 32, 38, 46],
  count: [1, 1, 1, 2, 2, 2],
};
const RMRF = {
  cooldown: [3.2, 3.1, 3.0, 2.5, 2.4, 2.0],
  count: [1, 1, 2, 2, 3, 3],
  radius: [58, 58, 62, 74, 76, 92],
  damage: [30, 40, 42, 46, 50, 66],
};
const PIPE = {
  cooldown: [1.7, 1.6, 1.5, 1.4, 1.3, 1.0],
  chains: [2, 3, 3, 4, 5, 6],
  damage: [14, 14, 19, 19, 24, 26],
};

interface EnemySpec {
  hp: number; speed: number; radius: number; damage: number; xp: number; mass: number;
}
const ENEMIES: Record<EnemyKind, EnemySpec> = {
  fragment: { hp: 8, speed: 50, radius: 8, damage: 7, xp: 1, mass: 1 },
  glitch: { hp: 6, speed: 68, radius: 7, damage: 6, xp: 1, mass: 0.8 },
  daemon: { hp: 42, speed: 36, radius: 13, damage: 12, xp: 3, mass: 3 },
  agent: { hp: 150, speed: 104, radius: 10, damage: 16, xp: 12, mass: 2.5 },
  sentinel: { hp: 1500, speed: 44, radius: 30, damage: 24, xp: 60, mass: 30 },
};

export interface Player {
  x: number; y: number;
  fx: number; fy: number; // last facing
  hp: number; maxHp: number;
  radius: number;
  iframes: number;
  level: number; xp: number; xpNext: number;
  moving: boolean;
}

export interface Enemy {
  kind: EnemyKind;
  x: number; y: number;
  kx: number; ky: number; // knockback velocity, decays
  hp: number; maxHp: number;
  speed: number; radius: number; damage: number; xp: number; mass: number;
  flash: number; // hit flash, seconds
  variant: number; // sprite variant chosen at spawn
  timer: number; // behaviour clock: blink, dodge, dash
  phase: number; // sentinel: 0 chase · 1 telegraph · 2 dash
  dx: number; dy: number; // dash direction
  lastFork: number;
  slow: number;
  mark: number; // query stamp; dedupes spatial-hash hits
  dead: boolean;
}

export interface Shot { x: number; y: number; vx: number; vy: number; damage: number; pierce: number; life: number; hit: Enemy[] }
export interface Beam { x1: number; y1: number; x2: number; y2: number; width: number; t: number; life: number }
export interface Bolt { points: number[]; t: number; life: number }
export interface Blast { x: number; y: number; radius: number; damage: number; fuse: number; t: number; life: number; exploded: boolean }
export interface Particle { x: number; y: number; vx: number; vy: number; t: number; life: number; variant: number; tone: Tone }
export interface Ring { x: number; y: number; from: number; to: number; t: number; life: number; tone: Tone }
export interface Ghost { x: number; y: number; t: number; life: number; kind: EnemyKind }
export interface Gem { x: number; y: number; value: number; pulled: boolean }
export interface Pickup { x: number; y: number; kind: "chest" | "heal"; t: number }
export interface Owned<T extends string> { id: T; level: number; timer: number }
export interface Choice { id: ItemId | BonusId; level: number; isNew: boolean }

export type GameEvent =
  | { type: "levelup"; level: number }
  | { type: "warning"; key: WarningKey }
  | { type: "boss"; active: boolean }
  | { type: "hurt" }
  | { type: "chest" }
  | { type: "over" }
  | { type: "won" };

export interface Stats {
  damage: number; cooldown: number; magnet: number; speed: number; regen: number; extra: number; maxHp: number;
}

export interface Game {
  rng: () => number;
  time: number;
  status: GameStatus;
  viewW: number; viewH: number;
  maxEnemies: number;
  player: Player;
  enemies: Enemy[];
  shots: Shot[];
  gems: Gem[];
  pickups: Pickup[];
  beams: Beam[];
  bolts: Bolt[];
  blasts: Blast[];
  particles: Particle[];
  rings: Ring[];
  ghosts: Ghost[];
  weapons: Owned<WeaponId>[];
  passives: Owned<PassiveId>[];
  stats: Stats;
  pending: number;
  choices: Choice[];
  kills: number;
  spawnTimer: number;
  script: number; // index of the next scripted event
  orbit: number; // fork() angle
  shake: number;
  hurt: number;
  boss: Enemy | null;
  events: GameEvent[];
  head: Int32Array;
  next: Int32Array;
  stamp: number;
}

export interface GameOptions { seed?: number; viewW?: number; viewH?: number; maxEnemies?: number }

const CELL = 40;
const HASH_MASK = 1023;
const MAX_PARTICLES = 420;
const MAX_GEMS = 320;
const MAX_REACH = 34; // largest enemy radius + margin, for neighbourhood queries

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function xpForLevel(level: number) {
  return Math.round(5 + (level - 1) * 4.2 + Math.pow(level - 1, 1.55) * 0.55);
}

export function createGame(options: GameOptions = {}): Game {
  const maxEnemies = options.maxEnemies ?? 260;
  const game: Game = {
    rng: mulberry32(options.seed ?? Date.now()),
    time: 0,
    status: "running",
    viewW: options.viewW ?? 900,
    viewH: options.viewH ?? 560,
    maxEnemies,
    player: {
      x: 0, y: 0, fx: 1, fy: 0, hp: 100, maxHp: 100, radius: 9, iframes: 1.2,
      level: 1, xp: 0, xpNext: xpForLevel(1), moving: false,
    },
    enemies: [], shots: [], gems: [], pickups: [],
    beams: [], bolts: [], blasts: [], particles: [], rings: [], ghosts: [],
    weapons: [{ id: "ping", level: 1, timer: 0.4 }],
    passives: [],
    stats: { damage: 1, cooldown: 1, magnet: 64, speed: 150, regen: 0, extra: 0, maxHp: 100 },
    pending: 0,
    choices: [],
    kills: 0,
    spawnTimer: 0.6,
    script: 0,
    orbit: 0,
    shake: 0,
    hurt: 0,
    boss: null,
    events: [],
    head: new Int32Array(HASH_MASK + 1).fill(-1),
    next: new Int32Array(Math.max(64, maxEnemies + 64)),
    stamp: 0,
  };
  game.stats = computeStats(game);
  return game;
}

export function setView(game: Game, viewW: number, viewH: number) {
  game.viewW = Math.max(200, viewW);
  game.viewH = Math.max(200, viewH);
}

export function levelOf(game: Game, id: ItemId): number {
  return game.weapons.find((w) => w.id === id)?.level ?? game.passives.find((p) => p.id === id)?.level ?? 0;
}

function computeStats(game: Game): Stats {
  const lv = (id: PassiveId) => game.passives.find((p) => p.id === id)?.level ?? 0;
  return {
    damage: 1 + 0.1 * lv("sudo"),
    cooldown: 1 - 0.08 * lv("overclock"),
    magnet: 64 * (1 + 0.35 * lv("cache")),
    speed: 150 * (1 + 0.08 * lv("nice")),
    regen: 0.3 * lv("patch"),
    extra: lv("threads"),
    maxHp: 100 + 20 * lv("ram"),
  };
}

// ---------------------------------------------------------------- helpers

const viewRadius = (g: Game) => Math.hypot(g.viewW, g.viewH) / 2;

function hashKey(cx: number, cy: number) {
  return (Math.imul(cx, 73856093) ^ Math.imul(cy, 19349663)) & HASH_MASK;
}

function buildHash(g: Game) {
  g.head.fill(-1);
  if (g.next.length < g.enemies.length) g.next = new Int32Array(g.enemies.length * 2);
  for (let i = 0; i < g.enemies.length; i++) {
    const e = g.enemies[i];
    const k = hashKey(Math.floor(e.x / CELL), Math.floor(e.y / CELL));
    g.next[i] = g.head[k];
    g.head[k] = i;
  }
}

/** Calls visit once per live enemy whose cell overlaps the circle (x, y, r). */
function query(g: Game, x: number, y: number, r: number, visit: (e: Enemy, index: number) => void) {
  const stamp = ++g.stamp;
  const x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL);
  const y0 = Math.floor((y - r) / CELL), y1 = Math.floor((y + r) / CELL);
  for (let cx = x0; cx <= x1; cx++) {
    for (let cy = y0; cy <= y1; cy++) {
      for (let j = g.head[hashKey(cx, cy)]; j !== -1; j = g.next[j]) {
        const e = g.enemies[j];
        if (e.mark === stamp || e.dead) continue;
        e.mark = stamp;
        visit(e, j);
      }
    }
  }
}

function nearest(g: Game, count: number, reach: number, from = g.player): Enemy[] {
  const best: Enemy[] = [];
  const dist: number[] = [];
  const limit = reach * reach;
  for (const e of g.enemies) {
    if (e.dead) continue;
    const d = (e.x - from.x) ** 2 + (e.y - from.y) ** 2;
    if (d > limit) continue;
    let i = best.length;
    while (i > 0 && dist[i - 1] > d) i--;
    if (i >= count) continue;
    best.splice(i, 0, e);
    dist.splice(i, 0, d);
    if (best.length > count) { best.pop(); dist.pop(); }
  }
  return best;
}

function burst(g: Game, x: number, y: number, count: number, tone: Tone, speed = 90) {
  for (let i = 0; i < count && g.particles.length < MAX_PARTICLES; i++) {
    const a = g.rng() * Math.PI * 2;
    const s = speed * (0.4 + g.rng());
    g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, life: 0.35 + g.rng() * 0.35, variant: g.rng() < 0.5 ? 0 : 1, tone });
  }
}

function hit(g: Game, e: Enemy, amount: number, fromX: number, fromY: number, knock: number) {
  if (e.dead) return;
  e.hp -= amount;
  e.flash = 0.09;
  if (knock > 0) {
    const dx = e.x - fromX, dy = e.y - fromY;
    const d = Math.hypot(dx, dy) || 1;
    e.kx += (dx / d) * knock / e.mass;
    e.ky += (dy / d) * knock / e.mass;
  }
  if (e.hp <= 0) kill(g, e);
}

function dropGem(g: Game, x: number, y: number, value: number) {
  if (g.gems.length >= MAX_GEMS) {
    g.gems[0].value += value; // fold into the oldest gem instead of growing forever
    return;
  }
  g.gems.push({ x, y, value, pulled: false });
}

function kill(g: Game, e: Enemy) {
  e.dead = true;
  g.kills++;
  const tone: Tone = e.kind === "daemon" ? "amber" : e.kind === "glitch" ? "cyan" : e.kind === "fragment" ? "accent" : "ink";
  if (e.kind === "sentinel") {
    for (let i = 0; i < 6; i++) dropGem(g, e.x + (g.rng() - 0.5) * 60, e.y + (g.rng() - 0.5) * 60, 10);
    g.pickups.push({ x: e.x, y: e.y, kind: "chest", t: 0 });
    g.rings.push({ x: e.x, y: e.y, from: 10, to: 220, t: 0, life: 0.7, tone: "danger" });
    burst(g, e.x, e.y, 48, "danger", 220);
    g.shake = Math.max(g.shake, 14);
  } else if (e.kind === "agent") {
    dropGem(g, e.x, e.y, e.xp);
    g.pickups.push({ x: e.x + 12, y: e.y, kind: "chest", t: 0 });
    burst(g, e.x, e.y, 18, "ink", 160);
  } else {
    dropGem(g, e.x, e.y, e.xp);
    if (e.kind === "daemon" && g.rng() < 0.05) g.pickups.push({ x: e.x, y: e.y, kind: "heal", t: 0 });
    burst(g, e.x, e.y, e.kind === "daemon" ? 8 : 4, tone);
  }
  if (g.boss === e) {
    g.boss = null;
    g.events.push({ type: "boss", active: false });
  }
}

// ---------------------------------------------------------------- spawning

function makeEnemy(g: Game, kind: EnemyKind, x: number, y: number): Enemy {
  const spec = ENEMIES[kind];
  const hpScale = 1 + g.time / 140;
  const jitter = kind === "fragment" ? 0.85 + g.rng() * 0.3 : 1;
  const hp = spec.hp * hpScale;
  return {
    kind, x, y, kx: 0, ky: 0, hp, maxHp: hp,
    speed: spec.speed * jitter * (1 + g.time / 1500),
    radius: spec.radius,
    damage: spec.damage * (1 + g.time / 320),
    xp: spec.xp, mass: spec.mass,
    flash: 0, variant: Math.floor(g.rng() * 64),
    timer: kind === "sentinel" ? 3.5 : 0.6 + g.rng(), phase: 0, dx: 0, dy: 0,
    lastFork: -1, slow: 0, mark: 0, dead: false,
  };
}

function edgePoint(g: Game, angle?: number) {
  const a = angle ?? g.rng() * Math.PI * 2;
  const d = viewRadius(g) + 30 + g.rng() * 40;
  return { x: g.player.x + Math.cos(a) * d, y: g.player.y + Math.sin(a) * d };
}

function spawn(g: Game, kind: EnemyKind, angle?: number) {
  if (g.enemies.length >= g.maxEnemies && kind !== "sentinel" && kind !== "agent") return;
  const p = edgePoint(g, angle);
  const e = makeEnemy(g, kind, p.x, p.y);
  g.enemies.push(e);
  return e;
}

function spawnRing(g: Game, kind: EnemyKind, count: number) {
  const room = Math.max(0, g.maxEnemies + 40 - g.enemies.length);
  const n = Math.min(count, room);
  const r = viewRadius(g) * 0.92;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    g.enemies.push(makeEnemy(g, kind, g.player.x + Math.cos(a) * r, g.player.y + Math.sin(a) * r));
  }
}

function spawnBoss(g: Game) {
  const e = spawn(g, "sentinel");
  if (!e) return;
  g.boss = e;
  g.events.push({ type: "boss", active: true });
}

const SCRIPT: Array<{ at: number; warn: WarningKey; run: (g: Game) => void }> = [
  { at: 60, warn: "agents", run: (g) => { spawn(g, "agent"); } },
  { at: 150, warn: "swarm", run: (g) => spawnRing(g, "fragment", 26) },
  { at: 180, warn: "agents", run: (g) => { for (let i = 0; i < 2; i++) spawn(g, "agent"); } },
  { at: 270, warn: "storm", run: (g) => spawnRing(g, "glitch", 30) },
  { at: 300, warn: "sentinel", run: spawnBoss },
  { at: 390, warn: "swarm", run: (g) => spawnRing(g, "daemon", 16) },
  { at: 420, warn: "agents", run: (g) => { for (let i = 0; i < 3; i++) spawn(g, "agent"); } },
  { at: 480, warn: "sentinel", run: (g) => { spawnBoss(g); for (let i = 0; i < 2; i++) spawn(g, "agent"); } },
  { at: 540, warn: "agents", run: (g) => { for (let i = 0; i < 4; i++) spawn(g, "agent"); } },
  { at: 570, warn: "purge", run: (g) => spawnRing(g, "daemon", 28) },
];

function pickKind(g: Game): EnemyKind {
  const t = g.time;
  const glitch = t > 40 ? Math.min(0.8, (t - 40) / 150) : 0;
  const daemon = t > 110 ? Math.min(0.6, (t - 110) / 220) : 0;
  const roll = g.rng() * (1 + glitch + daemon);
  if (roll < 1) return "fragment";
  return roll < 1 + glitch ? "glitch" : "daemon";
}

function runSpawner(g: Game, dt: number) {
  while (g.script < SCRIPT.length && g.time >= SCRIPT[g.script].at) {
    const step = SCRIPT[g.script++];
    g.events.push({ type: "warning", key: step.warn });
    step.run(g);
  }
  g.spawnTimer -= dt;
  if (g.spawnTimer > 0) return;
  const progress = Math.min(1, g.time / RUN_SECONDS);
  g.spawnTimer = 0.9 - 0.76 * progress;
  const minPop = Math.min(g.maxEnemies, 10 + g.time * 0.36);
  const batch = g.enemies.length < minPop ? 3 : 1;
  for (let i = 0; i < batch; i++) spawn(g, pickKind(g));
}

// ---------------------------------------------------------------- level-ups

function slotsFree(g: Game, kind: "weapon" | "passive") {
  return kind === "weapon" ? g.weapons.length < MAX_WEAPONS : g.passives.length < MAX_PASSIVES;
}

export function rollChoices(g: Game, count = 3): Choice[] {
  const pool: Array<{ choice: Choice; weight: number }> = [];
  for (const id of WEAPON_IDS) {
    const level = levelOf(g, id);
    if (level >= WEAPON_MAX_LEVEL || (level === 0 && !slotsFree(g, "weapon"))) continue;
    pool.push({ choice: { id, level: level + 1, isNew: level === 0 }, weight: level ? 1.4 : 1 });
  }
  for (const id of PASSIVE_IDS) {
    const level = levelOf(g, id);
    if (level >= PASSIVE_MAX_LEVEL[id] || (level === 0 && !slotsFree(g, "passive"))) continue;
    pool.push({ choice: { id, level: level + 1, isNew: level === 0 }, weight: level ? 1.1 : 0.8 });
  }
  const picked: Choice[] = [];
  while (picked.length < count && pool.length) {
    const total = pool.reduce((sum, item) => sum + item.weight, 0);
    let roll = g.rng() * total;
    let index = 0;
    while (index < pool.length - 1 && roll >= pool[index].weight) roll -= pool[index++].weight;
    picked.push(pool.splice(index, 1)[0].choice);
  }
  if (!picked.length) picked.push({ id: "reboot", level: 1, isNew: false });
  return picked;
}

function queueLevel(g: Game) {
  g.pending++;
  if (g.status === "running") {
    g.status = "levelup";
    g.choices = rollChoices(g);
  }
}

/** Applies choice `index`; resumes the run when no level-ups are pending. */
export function choose(g: Game, index: number) {
  if (g.status !== "levelup") return;
  const choice = g.choices[index];
  if (!choice) return;
  if (choice.id === "reboot") {
    g.player.hp = Math.min(g.player.maxHp, g.player.hp + g.player.maxHp * 0.35);
  } else if ((WEAPON_IDS as readonly string[]).includes(choice.id)) {
    const owned = g.weapons.find((w) => w.id === choice.id);
    if (owned) owned.level++;
    else g.weapons.push({ id: choice.id as WeaponId, level: 1, timer: 0.2 });
  } else {
    const id = choice.id as PassiveId;
    const owned = g.passives.find((p) => p.id === id);
    if (owned) owned.level++;
    else g.passives.push({ id, level: 1, timer: 0 });
    const before = g.stats.maxHp;
    g.stats = computeStats(g);
    g.player.maxHp = g.stats.maxHp;
    if (id === "ram") g.player.hp = Math.min(g.player.maxHp, g.player.hp + (g.stats.maxHp - before) + 20);
  }
  g.pending = Math.max(0, g.pending - 1);
  if (g.pending > 0) g.choices = rollChoices(g);
  else {
    g.choices = [];
    g.status = "running";
  }
}

// ---------------------------------------------------------------- weapons

function fireWeapons(g: Game, dt: number) {
  const p = g.player;
  const s = g.stats;
  const reach = viewRadius(g) * 1.05;
  for (const w of g.weapons) {
    const i = w.level - 1;
    if (w.id === "fork") {
      const count = FORK.count[i];
      const radius = FORK.radius[i];
      g.orbit += dt * FORK.spin[i];
      for (let k = 0; k < count; k++) {
        const a = g.orbit + (k / count) * Math.PI * 2;
        const ox = p.x + Math.cos(a) * radius, oy = p.y + Math.sin(a) * radius;
        query(g, ox, oy, 9 + MAX_REACH, (e) => {
          if (g.time - e.lastFork < 0.4) return;
          if (Math.hypot(e.x - ox, e.y - oy) > 9 + e.radius) return;
          e.lastFork = g.time;
          hit(g, e, FORK.damage[i] * s.damage, p.x, p.y, 140);
        });
      }
      continue;
    }
    w.timer -= dt;
    if (w.timer > 0) continue;
    if (w.id === "firewall") {
      const radius = FIREWALL.radius[i];
      query(g, p.x, p.y, radius + MAX_REACH, (e) => {
        if (Math.hypot(e.x - p.x, e.y - p.y) > radius + e.radius) return;
        e.slow = 0.6;
        hit(g, e, FIREWALL.damage[i] * s.damage, p.x, p.y, 40);
      });
      g.rings.push({ x: p.x, y: p.y, from: radius * 0.7, to: radius, t: 0, life: 0.3, tone: "amber" });
      w.timer += FIREWALL.tick[i];
    } else if (w.id === "ping") {
      const count = PING.count[i] + s.extra;
      const targets = nearest(g, count, reach);
      if (!targets.length) { w.timer = 0.1; continue; }
      for (let k = 0; k < count; k++) {
        const t = targets[k % targets.length];
        const spread = k < targets.length ? 0 : (Math.ceil((k - targets.length + 1) / 2) * 0.2) * (k % 2 ? 1 : -1);
        const a = Math.atan2(t.y - p.y, t.x - p.x) + spread;
        g.shots.push({ x: p.x, y: p.y, vx: Math.cos(a) * 470, vy: Math.sin(a) * 470, damage: PING.damage[i] * s.damage, pierce: PING.pierce[i], life: 1.15, hit: [] });
      }
      w.timer += PING.cooldown[i] * s.cooldown;
    } else if (w.id === "grep") {
      const target = nearest(g, 1, reach)[0];
      let ax = p.fx, ay = p.fy;
      if (target) {
        const d = Math.hypot(target.x - p.x, target.y - p.y) || 1;
        ax = (target.x - p.x) / d; ay = (target.y - p.y) / d;
      }
      for (let b = 0; b < GREP.count[i]; b++) {
        const dir = b === 0 ? 1 : -1;
        const x2 = p.x + ax * dir * GREP.length[i], y2 = p.y + ay * dir * GREP.length[i];
        const half = GREP.width[i] / 2;
        for (const e of g.enemies) {
          if (e.dead) continue;
          if (segmentDistance(e.x, e.y, p.x, p.y, x2, y2) <= half + e.radius) hit(g, e, GREP.damage[i] * s.damage, p.x, p.y, 90);
        }
        g.beams.push({ x1: p.x, y1: p.y, x2, y2, width: GREP.width[i], t: 0, life: 0.22 });
      }
      w.timer += GREP.cooldown[i] * s.cooldown;
    } else if (w.id === "rmrf") {
      const count = RMRF.count[i] + s.extra;
      const inView = g.enemies.filter((e) => !e.dead && Math.abs(e.x - p.x) < g.viewW * 0.45 && Math.abs(e.y - p.y) < g.viewH * 0.45);
      for (let k = 0; k < count; k++) {
        let x: number, y: number;
        if (inView.length) {
          const e = inView[Math.floor(g.rng() * inView.length)];
          x = e.x; y = e.y;
        } else {
          const a = g.rng() * Math.PI * 2, d = 80 + g.rng() * 80;
          x = p.x + Math.cos(a) * d; y = p.y + Math.sin(a) * d;
        }
        g.blasts.push({ x, y, radius: RMRF.radius[i], damage: RMRF.damage[i] * s.damage, fuse: 0.55, t: 0, life: 0.4, exploded: false });
      }
      w.timer += RMRF.cooldown[i] * s.cooldown;
    } else if (w.id === "pipe") {
      const first = nearest(g, 1, reach * 0.8)[0];
      if (!first) { w.timer = 0.15; continue; }
      const chained = new Set<Enemy>();
      const points = [p.x, p.y];
      let current: Enemy | undefined = first;
      const damage = PIPE.damage[i] * s.damage;
      for (let c = 0; current && c <= PIPE.chains[i] + s.extra; c++) {
        chained.add(current);
        points.push(current.x, current.y);
        const from: Enemy = current;
        hit(g, from, damage, from.x, from.y, 0);
        current = undefined;
        let best = 130 * 130;
        query(g, from.x, from.y, 130, (e) => {
          if (chained.has(e)) return;
          const d = (e.x - from.x) ** 2 + (e.y - from.y) ** 2;
          if (d < best) { best = d; current = e; }
        });
      }
      g.bolts.push({ points, t: 0, life: 0.2 });
      w.timer += PIPE.cooldown[i] * s.cooldown;
    }
  }
}

/** Geometry the renderer needs to draw always-on weapons. */
export function forkLayout(level: number) {
  return { count: FORK.count[level - 1], radius: FORK.radius[level - 1] };
}
export function firewallRadius(level: number) {
  return FIREWALL.radius[level - 1];
}

function segmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const vx = x2 - x1, vy = y2 - y1;
  const len = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((px - x1) * vx + (py - y1) * vy) / len));
  return Math.hypot(px - (x1 + vx * t), py - (y1 + vy * t));
}

// ---------------------------------------------------------------- update

export interface MoveInput { x: number; y: number }

export function update(g: Game, dt: number, move: MoveInput) {
  if (g.status !== "running") return;
  const p = g.player;
  g.time += dt;
  if (g.time >= RUN_SECONDS) {
    g.status = "won";
    g.events.push({ type: "won" });
    return;
  }

  // Player
  const m = Math.hypot(move.x, move.y);
  const mx = m > 1 ? move.x / m : move.x, my = m > 1 ? move.y / m : move.y;
  p.moving = m > 0.1;
  if (p.moving) {
    const d = Math.hypot(mx, my);
    p.fx = mx / d;
    p.fy = my / d;
  }
  p.x += mx * g.stats.speed * dt;
  p.y += my * g.stats.speed * dt;
  p.iframes = Math.max(0, p.iframes - dt);
  p.hp = Math.min(p.maxHp, p.hp + g.stats.regen * dt);
  g.shake = Math.max(0, g.shake - dt * 30);
  g.hurt = Math.max(0, g.hurt - dt);

  runSpawner(g, dt);

  // Enemies: behaviour + movement
  const far = viewRadius(g) * 1.7;
  for (const e of g.enemies) {
    e.flash = Math.max(0, e.flash - dt);
    e.slow = Math.max(0, e.slow - dt);
    let dx = p.x - e.x, dy = p.y - e.y;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist; dy /= dist;
    let speed = e.speed * (e.slow > 0 ? 0.6 : 1);
    e.timer -= dt;
    if (e.kind === "glitch" && e.timer <= 0) {
      e.timer = 0.9 + g.rng() * 0.8;
      const jump = Math.min(58, dist - 26);
      if (jump > 8) {
        g.ghosts.push({ x: e.x, y: e.y, t: 0, life: 0.25, kind: "glitch" });
        e.x += dx * jump + (g.rng() - 0.5) * 24;
        e.y += dy * jump + (g.rng() - 0.5) * 24;
      }
    } else if (e.kind === "sentinel") {
      if (e.phase === 0 && e.timer <= 0) { e.phase = 1; e.timer = 0.9; e.dx = dx; e.dy = dy; }
      else if (e.phase === 1) { speed = 0; if (e.timer <= 0) { e.phase = 2; e.timer = 0.6; } }
      else if (e.phase === 2) {
        speed = 330; dx = e.dx; dy = e.dy;
        if (g.rng() < 0.5) g.ghosts.push({ x: e.x, y: e.y, t: 0, life: 0.3, kind: "sentinel" });
        if (e.timer <= 0) { e.phase = 0; e.timer = 4.2; }
      }
    }
    e.x += (dx * speed + e.kx) * dt;
    e.y += (dy * speed + e.ky) * dt;
    const decay = Math.exp(-9 * dt);
    e.kx *= decay; e.ky *= decay;
    if (dist > far && e.kind !== "sentinel") {
      // Stragglers re-enter ahead of the player instead of trailing forever.
      const a = Math.atan2(p.fy, p.fx) + (g.rng() - 0.5) * 1.6;
      const point = edgePoint(g, a);
      e.x = point.x; e.y = point.y;
    }
  }

  buildHash(g);
  separate(g);

  // Contact damage
  if (p.iframes <= 0) {
    let damage = 0;
    query(g, p.x, p.y, p.radius + MAX_REACH, (e) => {
      if (Math.hypot(e.x - p.x, e.y - p.y) < p.radius + e.radius * 0.85) damage = Math.max(damage, e.damage);
    });
    if (damage > 0) {
      p.hp -= damage;
      p.iframes = 0.5;
      g.hurt = 0.35;
      g.shake = Math.max(g.shake, 7);
      g.events.push({ type: "hurt" });
      if (p.hp <= 0) {
        p.hp = 0;
        g.status = "over";
        g.events.push({ type: "over" });
        return;
      }
    }
  }

  fireWeapons(g, dt);
  updateShots(g, dt);
  updateBlasts(g, dt);

  // Remove the dead (swap-pop keeps it O(n))
  for (let i = g.enemies.length - 1; i >= 0; i--) {
    if (!g.enemies[i].dead) continue;
    g.enemies[i] = g.enemies[g.enemies.length - 1];
    g.enemies.pop();
  }

  collect(g, dt);
  ageEffects(g, dt);
}

function separate(g: Game) {
  const list = g.enemies;
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    query(g, a.x, a.y, a.radius + MAX_REACH, (b, j) => {
      if (j <= i) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const min = a.radius + b.radius;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 === 0) return;
      const d = Math.sqrt(d2);
      const push = (min - d) * 0.5;
      const wa = b.mass / (a.mass + b.mass), wb = 1 - wa;
      a.x -= (dx / d) * push * wa; a.y -= (dy / d) * push * wa;
      b.x += (dx / d) * push * wb; b.y += (dy / d) * push * wb;
    });
  }
}

function updateShots(g: Game, dt: number) {
  for (let i = g.shots.length - 1; i >= 0; i--) {
    const s = g.shots[i];
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
    let spent = s.life <= 0;
    if (!spent) {
      query(g, s.x, s.y, 5 + MAX_REACH + 40, (e) => {
        if (spent || s.hit.includes(e)) return;
        const d = Math.hypot(e.x - s.x, e.y - s.y);
        if (e.kind === "agent" && e.timer <= 0 && d < 46 + e.radius) {
          // Agents read the packet and sidestep it — once in a while.
          e.timer = 1.3;
          const side = g.rng() < 0.5 ? 1 : -1;
          const sp = Math.hypot(s.vx, s.vy) || 1;
          e.kx += (-s.vy / sp) * side * 420;
          e.ky += (s.vx / sp) * side * 420;
          g.ghosts.push({ x: e.x, y: e.y, t: 0, life: 0.35, kind: "agent" });
          s.hit.push(e);
          return;
        }
        if (d > 5 + e.radius) return;
        s.hit.push(e);
        hit(g, e, s.damage, s.x - s.vx, s.y - s.vy, 60);
        if (s.pierce-- <= 0) spent = true;
      });
    }
    if (spent) {
      g.shots[i] = g.shots[g.shots.length - 1];
      g.shots.pop();
    }
  }
}

function updateBlasts(g: Game, dt: number) {
  for (const b of g.blasts) {
    if (!b.exploded) {
      b.fuse -= dt;
      if (b.fuse > 0) continue;
      b.exploded = true;
      query(g, b.x, b.y, b.radius + MAX_REACH, (e) => {
        if (Math.hypot(e.x - b.x, e.y - b.y) <= b.radius + e.radius) hit(g, e, b.damage, b.x, b.y, 170);
      });
      burst(g, b.x, b.y, 10, "magenta", 160);
      g.shake = Math.max(g.shake, 3);
    } else b.t += dt;
  }
  g.blasts = g.blasts.filter((b) => !b.exploded || b.t < b.life);
}

function collect(g: Game, dt: number) {
  const p = g.player;
  const magnet = g.stats.magnet;
  for (let i = g.gems.length - 1; i >= 0; i--) {
    const gem = g.gems[i];
    const dx = p.x - gem.x, dy = p.y - gem.y;
    const d = Math.hypot(dx, dy);
    if (d < p.radius + 7) {
      g.gems[i] = g.gems[g.gems.length - 1];
      g.gems.pop();
      p.xp += gem.value;
      while (p.xp >= p.xpNext) {
        p.xp -= p.xpNext;
        p.level++;
        p.xpNext = xpForLevel(p.level);
        g.events.push({ type: "levelup", level: p.level });
        queueLevel(g);
      }
      continue;
    }
    if (d < magnet) gem.pulled = true;
    if (gem.pulled) {
      const speed = 420 + Math.max(0, 200 - d);
      gem.x += (dx / d) * speed * dt;
      gem.y += (dy / d) * speed * dt;
    }
  }
  for (let i = g.pickups.length - 1; i >= 0; i--) {
    const item = g.pickups[i];
    item.t += dt;
    if (Math.hypot(p.x - item.x, p.y - item.y) > p.radius + 12) continue;
    g.pickups.splice(i, 1);
    if (item.kind === "heal") p.hp = Math.min(p.maxHp, p.hp + 30);
    else {
      g.events.push({ type: "chest" });
      queueLevel(g);
    }
  }
}

function ageEffects(g: Game, dt: number) {
  for (const b of g.beams) b.t += dt;
  g.beams = g.beams.filter((b) => b.t < b.life);
  for (const b of g.bolts) b.t += dt;
  g.bolts = g.bolts.filter((b) => b.t < b.life);
  for (const r of g.rings) r.t += dt;
  g.rings = g.rings.filter((r) => r.t < r.life);
  for (const gh of g.ghosts) gh.t += dt;
  g.ghosts = g.ghosts.filter((gh) => gh.t < gh.life);
  for (const pt of g.particles) {
    pt.t += dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vx *= 0.92; pt.vy *= 0.92;
  }
  g.particles = g.particles.filter((pt) => pt.t < pt.life);
}

export function drainEvents(g: Game): GameEvent[] {
  const events = g.events;
  g.events = [];
  return events;
}
