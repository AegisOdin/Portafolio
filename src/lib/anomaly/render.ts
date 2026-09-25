/**
 * Canvas renderer for ANOMALY. Reads game state, never mutates it.
 * Glyphs are pre-rendered with their phosphor glow into a sprite cache, so a
 * frame is mostly drawImage calls — cheap enough for a few hundred entities.
 */
import { firewallRadius, forkLayout, type Enemy, type Game, type Tone } from "./engine.ts";

export interface Palette {
  bg: string; accent: string; ink: string; amber: string; cyan: string; magenta: string;
  danger: string; steel: string; edge: string;
}

/** Touch/drag joystick, in CSS pixels relative to the canvas. */
export interface Stick { ox: number; oy: number; x: number; y: number; radius: number }

const KATAKANA = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
const RAIN = KATAKANA + "01<>/{}=;:";
const FONT = `"VT323", "JetBrains Mono", "MS Gothic", "Hiragino Kaku Gothic ProN", "Noto Sans CJK JP", monospace`;

// Pixel-art Agent: suit, tie, sunglasses. Legend in agentColor().
const AGENT = [
  "...HHHHH...",
  "..HHHHHHH..",
  "..FFFFFFF..",
  "..GGGFGGG..",
  "..GgGFGgG..",
  "..FFFFFFF..",
  "...FFFFF...",
  "....FFF....",
  ".SSSWTWSSS.",
  "SSSSWTWSSSS",
  "SSSSSTSSSSS",
  "SS.SSTSS.SS",
  "SS.SSSSS.SS",
  "...SS.SS...",
  "...SS.SS...",
];

export function readPalette(root: HTMLElement): Palette {
  const css = getComputedStyle(root);
  const read = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    bg: read("--color-bg", "#0a0e0a"),
    accent: read("--accent", "#39ff14"),
    ink: read("--color-ink", "#c8ffb6"),
    amber: read("--color-amber", "#ffb000"),
    cyan: read("--color-cyan", "#00f0ff"),
    magenta: read("--color-magenta", "#ff2bd6"),
    danger: read("--color-sentinel-eye", "#ff1836"),
    steel: read("--color-sentinel-steel", "#222b32"),
    edge: read("--color-sentinel-edge", "#64727c"),
  };
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private sprites = new Map<string, HTMLCanvasElement>();
  private palette: Palette;
  private rain: HTMLCanvasElement = document.createElement("canvas");
  private rainCtx: CanvasRenderingContext2D;
  private rainDrops: number[] = [];
  private rainClock = 0;
  private vignette: HTMLCanvasElement = document.createElement("canvas");
  private hurtTint: HTMLCanvasElement = document.createElement("canvas");
  private dpr = 1;
  private cssW = 1;
  private cssH = 1;
  /** World units → CSS pixels. */
  zoom = 1;

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, palette: Palette) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false })!;
    this.rainCtx = this.rain.getContext("2d")!;
    this.palette = palette;
  }

  setPalette(palette: Palette) {
    this.palette = palette;
    this.sprites.clear();
    this.paintOverlays();
    this.resetRain();
  }

  /** Clears cached glyphs (e.g. once web fonts finish loading). */
  refreshGlyphs() {
    this.sprites.clear();
  }

  /** Returns the visible world size so the simulation can spawn just off-screen. */
  resize(cssW: number, cssH: number, dpr: number) {
    this.cssW = Math.max(1, cssW);
    this.cssH = Math.max(1, cssH);
    this.dpr = dpr;
    this.canvas.width = Math.round(this.cssW * dpr);
    this.canvas.height = Math.round(this.cssH * dpr);
    this.zoom = Math.min(1.35, Math.max(0.62, Math.min(this.cssW, this.cssH) / 520));
    this.sprites.clear();
    this.rain.width = Math.max(1, Math.round(this.canvas.width / 2));
    this.rain.height = Math.max(1, Math.round(this.canvas.height / 2));
    this.resetRain();
    this.paintOverlays();
    return { viewW: this.cssW / this.zoom, viewH: this.cssH / this.zoom };
  }

  // ------------------------------------------------------------ sprites

  private get scale() {
    return this.zoom * this.dpr;
  }

  private tone(t: Tone) {
    const p = this.palette;
    return t === "accent" ? p.accent : t === "ink" ? p.ink : t === "amber" ? p.amber : t === "cyan" ? p.cyan : t === "magenta" ? p.magenta : p.danger;
  }

  private glyph(char: string, color: string, size: number, glow: number, mirror = false, glowColor = color) {
    const key = `${char}|${color}|${size}|${glow}|${mirror}|${glowColor}`;
    let sprite = this.sprites.get(key);
    if (sprite) return sprite;
    const px = size * this.scale;
    const pad = Math.ceil(glow * this.scale * 1.6 + 2);
    sprite = document.createElement("canvas");
    sprite.width = sprite.height = Math.ceil(px * 1.3 + pad * 2);
    const c = sprite.getContext("2d")!;
    c.translate(sprite.width / 2, sprite.height / 2);
    if (mirror) c.scale(-1, 1);
    c.font = `${px}px ${FONT}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = color;
    if (glow > 0) {
      c.shadowColor = glowColor;
      c.shadowBlur = glow * this.scale;
      c.fillText(char, 0, px * 0.04);
    }
    c.shadowBlur = 0;
    c.fillText(char, 0, px * 0.04);
    this.sprites.set(key, sprite);
    return sprite;
  }

  private agentSprite(flash: boolean) {
    const key = `agent|${flash}`;
    let sprite = this.sprites.get(key);
    if (sprite) return sprite;
    const p = this.palette;
    const cell = 2.2 * this.scale;
    const w = AGENT[0].length * cell, h = AGENT.length * cell;
    const raw = document.createElement("canvas");
    raw.width = Math.ceil(w);
    raw.height = Math.ceil(h);
    const r = raw.getContext("2d")!;
    AGENT.forEach((row, y) => {
      [...row].forEach((code, x) => {
        if (code === ".") return;
        r.fillStyle = flash ? "#ffffff" : code === "G" || code === "T" ? p.bg : code === "g" ? p.danger : code === "S" ? p.accent : p.ink;
        r.globalAlpha = code === "H" ? 0.75 : code === "S" && !flash ? 0.82 : 1;
        r.fillRect(Math.floor(x * cell), Math.floor(y * cell), Math.ceil(cell), Math.ceil(cell));
      });
    });
    const pad = Math.ceil(8 * this.scale);
    sprite = document.createElement("canvas");
    sprite.width = raw.width + pad * 2;
    sprite.height = raw.height + pad * 2;
    const c = sprite.getContext("2d")!;
    c.shadowColor = flash ? "#ffffff" : p.accent;
    c.shadowBlur = 6 * this.scale;
    c.drawImage(raw, pad, pad);
    c.shadowBlur = 0;
    c.drawImage(raw, pad, pad);
    this.sprites.set(key, sprite);
    return sprite;
  }

  private enemySprite(e: Enemy, now: number) {
    const p = this.palette;
    const flash = e.flash > 0;
    const color = (c: string) => (flash ? "#ffffff" : c);
    switch (e.kind) {
      case "fragment":
        return this.glyph(KATAKANA[e.variant % KATAKANA.length], color(p.accent), 19, 5, true, p.accent);
      case "glitch":
        return this.glyph((Math.floor(now / 90) + e.variant) % 3 ? "▓" : "▒", color(p.cyan), 15, 6, false, p.cyan);
      case "daemon":
        return this.glyph("Ж", color(p.amber), 27, 7, false, p.amber);
      case "agent":
        return this.agentSprite(flash);
      default:
        return null;
    }
  }

  // ------------------------------------------------------------ overlays

  private paintOverlays() {
    const { width, height } = this.canvas;
    for (const [target, color, inner, alpha] of [
      [this.vignette, this.palette.bg, 0.45, 0.85],
      [this.hurtTint, this.palette.danger, 0.3, 0.75],
    ] as const) {
      target.width = width;
      target.height = height;
      const c = target.getContext("2d")!;
      const r = Math.hypot(width, height) / 2;
      const gradient = c.createRadialGradient(width / 2, height / 2, r * inner, width / 2, height / 2, r);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, color);
      c.globalAlpha = alpha;
      c.fillStyle = gradient;
      c.fillRect(0, 0, width, height);
    }
  }

  private resetRain() {
    const size = 14 * this.dpr / 2;
    const columns = Math.ceil(this.rain.width / size);
    this.rainDrops = Array.from({ length: columns }, () => Math.random() * -60);
    this.rainClock = 0;
    this.rainCtx.fillStyle = this.palette.bg;
    this.rainCtx.fillRect(0, 0, this.rain.width, this.rain.height);
  }

  /** Runs the rain for a while so a still frame already shows trails. */
  primeRain(steps = 40) {
    for (let i = 0; i < steps; i++) this.stepRain(this.rainClock + 60, false);
  }

  private stepRain(now: number, reduced: boolean) {
    if (reduced || now - this.rainClock < 55) return;
    this.rainClock = now;
    const c = this.rainCtx;
    const size = 14 * this.dpr / 2;
    c.globalAlpha = 0.16;
    c.fillStyle = this.palette.bg;
    c.fillRect(0, 0, this.rain.width, this.rain.height);
    c.globalAlpha = 1;
    c.fillStyle = this.palette.accent;
    c.font = `${size}px ${FONT}`;
    for (let i = 0; i < this.rainDrops.length; i++) {
      if (i % 2) continue; // sparse columns keep the playfield readable
      const y = this.rainDrops[i] * size;
      c.fillText(RAIN[Math.floor(Math.random() * RAIN.length)], i * size, y);
      if (y > this.rain.height && Math.random() > 0.96) this.rainDrops[i] = 0;
      this.rainDrops[i] += 0.55;
    }
  }

  // ------------------------------------------------------------ frame

  draw(game: Game, options: { now: number; reduced: boolean; stick: Stick | null }) {
    const { ctx, palette: pal } = this;
    const { width: W, height: H } = this.canvas;
    const k = this.scale;
    const { now, reduced } = options;
    const p = game.player;
    const shake = reduced ? 0 : game.shake;
    const camX = p.x + (shake ? (Math.random() - 0.5) * shake : 0);
    const camY = p.y + (shake ? (Math.random() - 0.5) * shake : 0);
    const sx = (x: number) => (x - camX) * k + W / 2;
    const sy = (y: number) => (y - camY) * k + H / 2;
    const margin = 60 * k;
    const visible = (x: number, y: number) => {
      const X = sx(x), Y = sy(y);
      return X > -margin && X < W + margin && Y > -margin && Y < H + margin;
    };
    const blit = (sprite: HTMLCanvasElement, x: number, y: number) =>
      ctx.drawImage(sprite, Math.round(sx(x) - sprite.width / 2), Math.round(sy(y) - sprite.height / 2));

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, W, H);

    // Digital rain (screen space) and the world grid (world space) give parallax.
    this.stepRain(now, reduced);
    ctx.globalAlpha = 0.28;
    ctx.drawImage(this.rain, 0, 0, W, H);
    ctx.globalAlpha = 0.09;
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = Math.max(1, this.dpr);
    ctx.beginPath();
    const step = 64;
    const left = camX - W / 2 / k, top = camY - H / 2 / k;
    for (let x = Math.floor(left / step) * step; x < left + W / k + step; x += step) {
      ctx.moveTo(Math.round(sx(x)) + 0.5, 0);
      ctx.lineTo(Math.round(sx(x)) + 0.5, H);
    }
    for (let y = Math.floor(top / step) * step; y < top + H / k + step; y += step) {
      ctx.moveTo(0, Math.round(sy(y)) + 0.5);
      ctx.lineTo(W, Math.round(sy(y)) + 0.5);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Pickups
    for (const gem of game.gems) {
      if (!visible(gem.x, gem.y)) continue;
      const tier = gem.value < 3 ? 0 : gem.value < 10 ? 1 : 2;
      const color = tier === 0 ? pal.accent : tier === 1 ? pal.cyan : pal.amber;
      const digit = (Math.round(gem.x + gem.y) & 1) ? "1" : "0";
      const bob = reduced ? 0 : Math.sin(now / 250 + gem.x) * 1.5;
      blit(this.glyph(digit, color, 11 + tier * 3, 4 + tier * 2), gem.x, gem.y + bob);
    }
    for (const item of game.pickups) {
      if (!visible(item.x, item.y)) continue;
      const pulse = reduced ? 1 : 0.75 + Math.sin(item.t * 6) * 0.25;
      ctx.globalAlpha = pulse;
      blit(item.kind === "chest" ? this.glyph("▣", pal.amber, 22, 10) : this.glyph("+", pal.ink, 22, 8, false, pal.accent), item.x, item.y);
      ctx.globalAlpha = 1;
    }

    // Firewall aura (under enemies)
    const firewall = game.weapons.find((w) => w.id === "firewall");
    if (firewall) {
      const radius = firewallRadius(firewall.level) * k;
      ctx.save();
      ctx.strokeStyle = pal.amber;
      ctx.lineWidth = 1.5 * this.dpr;
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([6 * this.dpr, 7 * this.dpr]);
      ctx.lineDashOffset = reduced ? 0 : -now / 40;
      ctx.beginPath();
      ctx.arc(sx(p.x), sy(p.y), radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = pal.amber;
      ctx.fill();
      ctx.restore();
    }

    // rm -rf charges
    for (const b of game.blasts) {
      const X = sx(b.x), Y = sy(b.y), R = b.radius * k;
      ctx.save();
      ctx.strokeStyle = pal.magenta;
      ctx.fillStyle = pal.magenta;
      if (!b.exploded) {
        ctx.globalAlpha = 0.45 + 0.35 * Math.sin(now / 45);
        ctx.setLineDash([4 * this.dpr, 5 * this.dpr]);
        ctx.lineWidth = 1.5 * this.dpr;
        ctx.beginPath();
        ctx.arc(X, Y, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = `${10 * k}px ${FONT}`;
        ctx.textAlign = "center";
        ctx.fillText("rm -rf", X, Y - R - 4 * k);
      } else {
        const t = b.t / b.life;
        ctx.globalAlpha = (1 - t) * 0.35;
        ctx.beginPath();
        ctx.arc(X, Y, R * (0.6 + t * 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1 - t;
        ctx.lineWidth = 2 * this.dpr;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Afterimages
    for (const ghost of game.ghosts) {
      if (!visible(ghost.x, ghost.y)) continue;
      ctx.globalAlpha = 0.4 * (1 - ghost.t / ghost.life);
      if (ghost.kind === "agent") blit(this.agentSprite(false), ghost.x, ghost.y);
      else if (ghost.kind === "glitch") blit(this.glyph("░", pal.magenta, 15, 4), ghost.x, ghost.y);
      else {
        ctx.strokeStyle = pal.danger;
        ctx.lineWidth = 2 * this.dpr;
        ctx.beginPath();
        ctx.arc(sx(ghost.x), sy(ghost.y), 30 * k, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Enemies
    for (const e of game.enemies) {
      if (!visible(e.x, e.y)) continue;
      if (e.kind === "sentinel") { this.drawSentinel(e, sx(e.x), sy(e.y), now, reduced); continue; }
      const sprite = this.enemySprite(e, now);
      if (sprite) blit(sprite, e.x, e.y);
      if (e.kind === "agent" && e.hp < e.maxHp) this.healthBar(sx(e.x), sy(e.y) - 22 * k, 22 * k, e.hp / e.maxHp);
    }

    // Player
    const blink = p.iframes > 0 && game.time > 1.3 && Math.floor(now / 70) % 2 === 0;
    ctx.globalAlpha = blink ? (reduced ? 0.6 : 0.25) : 1;
    blit(this.glyph("@", pal.ink, 24, 10, false, pal.accent), p.x, p.y);
    ctx.globalAlpha = 1;

    // fork() orbitals
    const fork = game.weapons.find((w) => w.id === "fork");
    if (fork) {
      const { count, radius } = forkLayout(fork.level);
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = this.dpr;
      ctx.beginPath();
      ctx.arc(sx(p.x), sy(p.y), radius * k, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      const sprite = this.glyph("◆", pal.ink, 13, 8, false, pal.accent);
      for (let i = 0; i < count; i++) {
        const a = game.orbit + (i / count) * Math.PI * 2;
        blit(sprite, p.x + Math.cos(a) * radius, p.y + Math.sin(a) * radius);
      }
    }

    // ping packets
    ctx.strokeStyle = pal.amber;
    ctx.lineWidth = 2 * this.dpr;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (const s of game.shots) {
      ctx.moveTo(sx(s.x - s.vx * 0.035), sy(s.y - s.vy * 0.035));
      ctx.lineTo(sx(s.x), sy(s.y));
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    const packet = this.glyph("•", pal.amber, 14, 6);
    for (const s of game.shots) if (visible(s.x, s.y)) blit(packet, s.x, s.y);

    // grep beams
    for (const b of game.beams) {
      const fade = 1 - b.t / b.life;
      ctx.lineCap = "round";
      ctx.strokeStyle = pal.amber;
      ctx.globalAlpha = 0.28 * fade;
      ctx.lineWidth = b.width * k;
      ctx.beginPath();
      ctx.moveTo(sx(b.x1), sy(b.y1));
      ctx.lineTo(sx(b.x2), sy(b.y2));
      ctx.stroke();
      ctx.strokeStyle = pal.ink;
      ctx.globalAlpha = fade;
      ctx.lineWidth = 2 * this.dpr;
      ctx.stroke();
      ctx.lineCap = "butt";
    }

    // | pipe bolts: jagged, re-jittered each frame so they crackle
    for (const bolt of game.bolts) {
      const fade = 1 - bolt.t / bolt.life;
      ctx.beginPath();
      for (let i = 0; i + 3 < bolt.points.length; i += 2) {
        const x1 = bolt.points[i], y1 = bolt.points[i + 1], x2 = bolt.points[i + 2], y2 = bolt.points[i + 3];
        ctx.moveTo(sx(x1), sy(y1));
        for (let s = 1; s <= 4; s++) {
          const t = s / 5, j = reduced ? 0 : (Math.random() - 0.5) * 14;
          ctx.lineTo(sx(x1 + (x2 - x1) * t + j), sy(y1 + (y2 - y1) * t - j));
        }
        ctx.lineTo(sx(x2), sy(y2));
      }
      ctx.strokeStyle = pal.cyan;
      ctx.globalAlpha = 0.5 * fade;
      ctx.lineWidth = 4 * this.dpr;
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.globalAlpha = fade;
      ctx.lineWidth = 1.5 * this.dpr;
      ctx.stroke();
    }

    // Shockwave rings
    for (const r of game.rings) {
      const t = r.t / r.life;
      ctx.globalAlpha = (1 - t) * 0.7;
      ctx.strokeStyle = this.tone(r.tone);
      ctx.lineWidth = 1.5 * this.dpr;
      ctx.beginPath();
      ctx.arc(sx(r.x), sy(r.y), (r.from + (r.to - r.from) * t) * k, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Bit debris
    for (const pt of game.particles) {
      if (!visible(pt.x, pt.y)) continue;
      ctx.globalAlpha = 1 - pt.t / pt.life;
      blit(this.glyph(pt.variant ? "1" : "0", this.tone(pt.tone), 10, 3), pt.x, pt.y);
    }
    ctx.globalAlpha = 1;

    // Joystick
    const stick = options.stick;
    if (stick) {
      const d = this.dpr;
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = pal.ink;
      ctx.lineWidth = 1.5 * d;
      ctx.beginPath();
      ctx.arc(stick.ox * d, stick.oy * d, stick.radius * d, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = pal.accent;
      ctx.beginPath();
      ctx.arc((stick.ox + stick.x * stick.radius) * d, (stick.oy + stick.y * stick.radius) * d, 14 * d, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Lens: vignette, then a danger tint while hurt
    ctx.drawImage(this.vignette, 0, 0);
    if (game.hurt > 0) {
      ctx.globalAlpha = Math.min(1, game.hurt / 0.35) * (reduced ? 0.35 : 0.6);
      ctx.drawImage(this.hurtTint, 0, 0);
      ctx.globalAlpha = 1;
    }
  }

  private healthBar(x: number, y: number, w: number, ratio: number) {
    const { ctx, palette: pal } = this;
    const h = 2 * this.dpr;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = pal.bg;
    ctx.fillRect(x - w / 2, y, w, h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = pal.danger;
    ctx.fillRect(x - w / 2, y, w * Math.max(0, ratio), h);
  }

  private drawSentinel(e: Enemy, X: number, Y: number, now: number, reduced: boolean) {
    const { ctx, palette: pal } = this;
    const k = this.scale;
    const R = e.radius * k;
    const t = reduced ? 0 : now / 1000;
    const flash = e.flash > 0;
    ctx.save();
    // Dash telegraph: a dashed lane so the player can step aside.
    if (e.phase === 1) {
      ctx.strokeStyle = pal.danger;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2 * this.dpr;
      ctx.setLineDash([8 * this.dpr, 8 * this.dpr]);
      ctx.beginPath();
      ctx.moveTo(X, Y);
      ctx.lineTo(X + e.dx * 330 * 0.6 * k, Y + e.dy * 330 * 0.6 * k);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    // Tentacles
    ctx.strokeStyle = flash ? "#ffffff" : pal.edge;
    ctx.lineCap = "round";
    for (let i = 0; i < 8; i++) {
      const base = (i / 8) * Math.PI * 2 + t * 0.4;
      let x = X + Math.cos(base) * R * 0.8, y = Y + Math.sin(base) * R * 0.8;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 1; s <= 9; s++) {
        const a = base + Math.sin(t * 3 + i + s * 0.55) * 0.35 * (s / 9);
        x += Math.cos(a) * R * 0.24;
        y += Math.sin(a) * R * 0.24;
        ctx.lineTo(x, y);
      }
      ctx.lineWidth = 3 * k;
      ctx.stroke();
    }
    // Body
    ctx.fillStyle = flash ? "#ffffff" : pal.steel;
    ctx.strokeStyle = pal.edge;
    ctx.lineWidth = 2 * k;
    ctx.beginPath();
    ctx.ellipse(X, Y, R, R * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Eyes
    const hot = e.phase > 0;
    ctx.fillStyle = pal.danger;
    ctx.shadowColor = pal.danger;
    ctx.shadowBlur = (hot ? 18 : 10) * this.dpr;
    const eyes: Array<[number, number, number]> = [[0, 0, 0.3], [-0.5, -0.35, 0.12], [0.5, -0.35, 0.12], [-0.62, 0.15, 0.11], [0.62, 0.15, 0.11], [-0.28, 0.48, 0.1], [0.28, 0.48, 0.1]];
    for (const [ex, ey, er] of eyes) {
      ctx.beginPath();
      ctx.arc(X + ex * R, Y + ey * R, er * R * (hot ? 1.2 : 1), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
