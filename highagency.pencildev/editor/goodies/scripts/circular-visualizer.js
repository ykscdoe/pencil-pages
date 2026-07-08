/**
 * @schema 2.10
 * @input bars: number(min=1) = 64
 * @input radius: number = 120
 * @input barWidth: number = 4
 * @input minHeight: number = 4
 * @input maxHeight: number = 60
 * @input phase: number(min=0, max=360) = 0
 * @input colorStart: color = #00FF88
 * @input colorEnd: color = #00BBFF
 * @input glow: boolean = true
 */

function parseHex(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

function lerpColor(c1, c2, t) {
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return (
    "#" +
    ("0" + r.toString(16)).slice(-2) +
    ("0" + g.toString(16)).slice(-2) +
    ("0" + b.toString(16)).slice(-2)
  );
}

const bars = Math.floor(pencil.input.bars);
const radius = pencil.input.radius;
const barWidth = pencil.input.barWidth;
const minH = pencil.input.minHeight;
const maxH = pencil.input.maxHeight;
const glow = pencil.input.glow;

const cx = pencil.width / 2;
const cy = pencil.height / 2;

const c1 = parseHex(pencil.input.colorStart);
const c2 = parseHex(pencil.input.colorEnd);

function generateHeights(n, phase) {
  const phases = [];
  for (let j = 0; j < 6; j++) {
    phases.push(Math.random() * 6.2832);
  }

  // Phase input (0–360) maps to one full cycle so the motion loops cleanly.
  const phaseOffset = (phase * (Math.PI * 2)) / 360;

  const raw = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    let v = 0;
    v += 0.4 * Math.sin(t * Math.PI * 2 * 2 + phases[0] + phaseOffset * 2);
    v += 0.25 * Math.sin(t * Math.PI * 2 * 5 + phases[1] + phaseOffset * 5);
    v += 0.15 * Math.sin(t * Math.PI * 2 * 9 + phases[2] + phaseOffset * 9);
    v += 0.1 * Math.sin(t * Math.PI * 2 * 17 + phases[3] + phaseOffset * 3);
    v += 0.1 * Math.sin(t * Math.PI * 2 * 31 + phases[4] + phaseOffset * 7);
    raw.push(v);
  }

  let lo = raw[0];
  let hi = raw[0];
  for (let i = 1; i < raw.length; i++) {
    if (raw[i] < lo) {
      lo = raw[i];
    }
    if (raw[i] > hi) {
      hi = raw[i];
    }
  }
  const range = hi - lo || 1;
  for (let i = 0; i < raw.length; i++) {
    raw[i] = (raw[i] - lo) / range;
  }
  return raw;
}

const heights = generateHeights(bars, pencil.input.phase);

const nodes = [];

for (let i = 0; i < bars; i++) {
  const angleDeg = (360 / bars) * i;
  const angleRad = angleDeg * (Math.PI / 180);
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  const barH = minH + heights[i] * (maxH - minH);
  const barW = barWidth;

  // Local pivot (px, py) = (barW/2, barH + radius) puts the bar's base on the
  // circle and the tip pointing outward after rotation.
  const px = barW / 2;
  const py = barH + radius;

  const color = lerpColor(c1, c2, i / bars);

  const bar = {
    type: "rectangle",
    x: cx - px * cosA - py * sinA,
    y: cy + px * sinA - py * cosA,
    width: barW,
    height: barH,
    cornerRadius: barW / 2,
    rotation: angleDeg,
    fill: color,
  };

  if (glow) {
    bar.effect = {
      type: "shadow",
      shadowType: "outer",
      blur: 8,
      spread: 0,
      offset: { x: 0, y: 0 },
      color: color + "88",
    };
  }

  nodes.push(bar);
}

return nodes;
