/**
 * @schema 2.10
 * @input bands: number(min=4, max=40) = 22
 * @input intensity: number(min=0.1, max=1) = 0.75
 * @input peakHold: boolean = true
 */

const W = pencil.width;
const H = pencil.height;
const numBands = Math.floor(pencil.input.bands);
const intensity = pencil.input.intensity;

const nodes = [];

nodes.push({
  type: "rectangle",
  x: 0,
  y: 0,
  width: W,
  height: H,
  fill: "#000000",
});

const gap = 1.5;
const barW = (W - gap * (numBands + 1)) / numBands;

for (let i = 0; i < numBands; i++) {
  // Bass-heavy bias: lower index bands get taller baseline.
  const freqBias = Math.pow(1 - i / numBands, 0.4) * 0.5 + 0.2;
  const randomness = Math.random() * 0.7 + 0.3;
  const h = Math.max(2, freqBias * randomness * intensity * H);

  const x = gap + i * (barW + gap);
  const y = H - h;

  nodes.push({
    type: "rectangle",
    x: x,
    y: y,
    width: barW,
    height: h,
    fill: {
      type: "gradient",
      gradientType: "linear",
      rotation: 180,
      colors: [
        { color: "#FF1744", position: 0 },
        { color: "#FFD600", position: 0.35 },
        { color: "#00E676", position: 1 },
      ],
    },
  });

  if (pencil.input.peakHold) {
    const peakY = Math.max(1, y - (2 + Math.random() * 10));
    nodes.push({
      type: "rectangle",
      x: x,
      y: peakY,
      width: barW,
      height: 2,
      fill: "#FFFFFF",
      opacity: 0.85,
    });
  }
}

const segGap = Math.max(3, Math.floor(H / 18));
for (let sy = segGap; sy < H; sy += segGap) {
  nodes.push({
    type: "rectangle",
    x: 0,
    y: sy - 0.5,
    width: W,
    height: 1.2,
    fill: "#000000",
    opacity: 0.65,
  });
}

return nodes;
