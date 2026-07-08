/**
 * @schema 2.10
 * @input lines: number = 33
 * @input stroke: number = 0.8
 * @input twist: number = 0.4
 * @input bulge: number = 0.3
 * @input padding: number = 10
 */

const w = pencil.width;
const h = pencil.height;
const nodes = [];

function f(n) {
  return n.toFixed(1);
}

const noiseOffset = Math.random() * 1000;

function hash(a, b) {
  let n = a * 374761393 + b * 668265263 + Math.floor(noiseOffset) * 9137;
  n = (n ^ (n >> 13)) * 1274126177;
  n = n ^ (n >> 16);
  return (n & 0x7fffffff) / 0x7fffffff;
}

function smooth(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let fx = x - ix;
  let fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

function curveA(t) {
  const angle = (t * 0.7 + 0.15) * Math.PI * 2;
  const noiseR = smooth(t * 3, noiseOffset) * 0.2;
  const ra = 0.9 + noiseR;
  return [Math.cos(angle) * ra * 0.8, Math.sin(angle) * ra];
}

function curveB(t) {
  const angle = (t * 0.7 + 0.15 + pencil.input.twist) * Math.PI * 2;
  const noiseR = smooth(t * 3 + 10, noiseOffset + 5) * 0.2;
  const rb = 0.5 + pencil.input.bulge + noiseR;
  return [Math.cos(angle) * rb * 1.1, Math.sin(angle) * rb * 0.7];
}

if (pencil.input.lines < 2) {
  return nodes;
}

const pointsA = [];
const pointsB = [];
let minX = Infinity;
let maxX = -Infinity;
let minY = Infinity;
let maxY = -Infinity;

for (let i = 0; i < pencil.input.lines; i++) {
  const t = i / (pencil.input.lines - 1);
  const a = curveA(t);
  const b = curveB(t);
  pointsA.push(a);
  pointsB.push(b);

  if (a[0] < minX) {
    minX = a[0];
  }
  if (a[0] > maxX) {
    maxX = a[0];
  }
  if (a[1] < minY) {
    minY = a[1];
  }
  if (a[1] > maxY) {
    maxY = a[1];
  }
  if (b[0] < minX) {
    minX = b[0];
  }
  if (b[0] > maxX) {
    maxX = b[0];
  }
  if (b[1] < minY) {
    minY = b[1];
  }
  if (b[1] > maxY) {
    maxY = b[1];
  }
}

const rangeX = maxX - minX;
const rangeY = maxY - minY;
const drawW = w - pencil.input.padding * 2;
const drawH = h - pencil.input.padding * 2;
const scale = Math.min(drawW / rangeX, drawH / rangeY);
const offX = pencil.input.padding + (drawW - rangeX * scale) / 2;
const offY = pencil.input.padding + (drawH - rangeY * scale) / 2;

function mapX(v) {
  return (v - minX) * scale + offX;
}

function mapY(v) {
  return (v - minY) * scale + offY;
}

for (let i = 0; i < pencil.input.lines; i++) {
  const ax = mapX(pointsA[i][0]);
  const ay = mapY(pointsA[i][1]);
  const bx = mapX(pointsB[i][0]);
  const by = mapY(pointsB[i][1]);

  const lMinX = Math.min(ax, bx);
  const lMinY = Math.min(ay, by);
  let pathW = Math.max(ax, bx) - lMinX;
  let pathH = Math.max(ay, by) - lMinY;
  if (pathW < 0.1) {
    pathW = 0.1;
  }
  if (pathH < 0.1) {
    pathH = 0.1;
  }

  const d =
    "M " + f(ax - lMinX) + " " + f(ay - lMinY) +
    " L " + f(bx - lMinX) + " " + f(by - lMinY);

  nodes.push({
    type: "path",
    x: lMinX,
    y: lMinY,
    width: pathW,
    height: pathH,
    viewBox: [0, 0, pathW, pathH],
    geometry: d,
    stroke: {
      align: "center",
      thickness: pencil.input.stroke,
      fill: [{ type: "color", color: "#1a1a1a" }],
    },
  });
}

return nodes;
