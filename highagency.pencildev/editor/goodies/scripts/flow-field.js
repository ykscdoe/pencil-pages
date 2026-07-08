/**
 * @schema 2.10
 * @input particles: number(min=20, max=800) = 300
 * @input steps: number(min=10, max=150) = 60
 * @input noiseScale: number(min=0.001, max=0.02) = 0.004
 * @input noiseStrength: number(min=1, max=12) = 6
 * @input stepSize: number(min=1, max=8) = 3
 * @input lineWidth: number(min=0.5, max=4) = 1.5
 * @input fadeTrails: boolean = true
 * @input time: number = 0
 * @input timeScale: number = 1
 * @input color1: color = #FF6B6B
 * @input color2: color = #4ECDC4
 * @input color3: color = #45B7D1
 * @input color4: color = #FFEAA7
 * @input bgColor: color = #0D1117
 */

const W = pencil.width;
const H = pencil.height;

const numParticles = Math.floor(pencil.input.particles);
const numSteps = Math.floor(pencil.input.steps);
const scale = pencil.input.noiseScale;
const strength = pencil.input.noiseStrength;
const step = pencil.input.stepSize;
const lw = pencil.input.lineWidth;
const fade = pencil.input.fadeTrails;
const t = pencil.input.time;
const timeScale = pencil.input.timeScale;

const colors = [
  pencil.input.color1,
  pencil.input.color2,
  pencil.input.color3,
  pencil.input.color4,
];

const perm = [];
for (let i = 0; i < 256; i++) {
  perm[i] = i;
}
for (let i = 255; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  const tmp = perm[i];
  perm[i] = perm[j];
  perm[j] = tmp;
}
for (let i = 0; i < 256; i++) {
  perm[i + 256] = perm[i];
}

const grad2 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

function dot2(g, x, y) {
  return g[0] * x + g[1] * y;
}

function noise2D(x, y) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;

  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
  const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);

  const aa = perm[perm[X] + Y] % 8;
  const ab = perm[perm[X] + Y + 1] % 8;
  const ba = perm[perm[X + 1] + Y] % 8;
  const bb = perm[perm[X + 1] + Y + 1] % 8;

  const n00 = dot2(grad2[aa], xf, yf);
  const n10 = dot2(grad2[ba], xf - 1, yf);
  const n01 = dot2(grad2[ab], xf, yf - 1);
  const n11 = dot2(grad2[bb], xf - 1, yf - 1);

  const nx0 = n00 + u * (n10 - n00);
  const nx1 = n01 + u * (n11 - n01);

  return nx0 + v * (nx1 - nx0);
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  function h(n) {
    return Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
  }
  return "#" + h(r) + h(g) + h(b);
}

function lerpColor(c1, c2, t) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  return rgbToHex(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t
  );
}

function pickColor(t) {
  const idx = t * (colors.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  if (i >= colors.length - 1) {
    return colors[colors.length - 1];
  }
  return lerpColor(colors[i], colors[i + 1], f);
}

const viewBox = [0, 0, W, H];
const nodes = [];
const trailsByColor = {};

for (let p = 0; p < numParticles; p++) {
  let x = Math.random() * W;
  let y = Math.random() * H;

  const color = pickColor(Math.random());
  const points = [{ x, y }];

  const tt = t * timeScale;

  for (let s = 0; s < numSteps; s++) {
    const angle =
      noise2D(x * scale + tt, y * scale + tt * 0.7) * Math.PI * strength;

    x += Math.cos(angle) * step;
    y += Math.sin(angle) * step;

    if (x < -10 || x > W + 10 || y < -10 || y > H + 10) {
      break;
    }

    points.push({ x, y });
  }

  if (points.length < 3) {
    continue;
  }

  // Quantize to 32-step buckets so similar colors share a single path node.
  const rgb = hexToRgb(color);
  const qr = Math.round(rgb.r / 32) * 32;
  const qg = Math.round(rgb.g / 32) * 32;
  const qb = Math.round(rgb.b / 32) * 32;
  const qColor = rgbToHex(qr, qg, qb);

  if (!trailsByColor[qColor]) {
    trailsByColor[qColor] = [];
  }
  trailsByColor[qColor].push(points);
}

for (const color in trailsByColor) {
  const trails = trailsByColor[color];

  if (fade) {
    const segments = 4;

    for (let seg = 0; seg < segments; seg++) {
      let svg = "";
      const opacity = 0.15 + (seg / segments) * 0.7;
      let hasContent = false;

      for (const points of trails) {
        const segStart = Math.floor((seg / segments) * points.length);
        const segEnd = Math.floor(((seg + 1) / segments) * points.length);
        if (segEnd - segStart < 2) {
          continue;
        }

        hasContent = true;
        svg += `M${points[segStart].x.toFixed(1)} ${points[segStart].y.toFixed(1)}`;
        for (let i = segStart + 1; i < segEnd; i++) {
          svg += `L${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
        }
      }

      if (!hasContent) {
        continue;
      }

      nodes.push({
        type: "path",
        x: 0,
        y: 0,
        width: W,
        height: H,
        viewBox: viewBox,
        geometry: svg,
        stroke: {
          thickness: lw * (0.6 + seg * 0.15),
          cap: "round",
          fill: color,
          align: "center",
        },
        opacity: opacity,
      });
    }
    continue;
  }

  let svg = "";
  for (const points of trails) {
    svg += `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      svg += `L${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
    }
  }

  nodes.push({
    type: "path",
    x: 0,
    y: 0,
    width: W,
    height: H,
    viewBox: viewBox,
    geometry: svg,
    stroke: {
      thickness: lw,
      cap: "round",
      fill: color,
      align: "center",
    },
    opacity: 0.7,
  });
}

return nodes;
