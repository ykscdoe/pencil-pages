/**
 * @schema 2.10
 * @input candles: number(min=2) = 160
 * @input bullColor: color = #22C55E
 * @input bearColor: color = #EF4444
 * @input wickWidth: number = 2
 * @input showGrid: boolean = true
 * @input gridColor: color = #1E293B
 * @input gridLines: number = 5
 * @input crosshairColor: color = #3B82F6
 * @input activeCandle: number (min=0, max=60) = 1
 * @input showCrosshair: boolean = true
 * @input showVolume: boolean = true
 * @input volumeBullColor: color = #22C55E33
 * @input volumeBearColor: color = #EF444433
 */

const W = pencil.width;
const H = pencil.height;
const count = Math.floor(pencil.input.candles);
const bullColor = pencil.input.bullColor;
const bearColor = pencil.input.bearColor;
const wickW = pencil.input.wickWidth;
const showGrid = pencil.input.showGrid;
const gridColor = pencil.input.gridColor;
const gridLines = pencil.input.gridLines;
const crosshairColor = pencil.input.crosshairColor;
const active = Math.min(Math.floor(pencil.input.activeCandle), count - 1);
const showCrosshair = pencil.input.showCrosshair;
const showVolume = pencil.input.showVolume;
const volumeBullColor = pencil.input.volumeBullColor;
const volumeBearColor = pencil.input.volumeBearColor;

const data = [];
let price = 150 + Math.random() * 100;
for (let i = 0; i < count; i++) {
  const change = (Math.random() - 0.48) * 8;
  const open = price;
  const close = open + change;
  const high = Math.max(open, close) + Math.random() * 5 + 1;
  const low = Math.min(open, close) - Math.random() * 5 - 1;
  const volume = 0.3 + Math.random() * 0.7;
  data.push({ open, high, low, close, volume });
  price = close;
}

let minLow = data[0].low;
let maxHigh = data[0].high;
for (let i = 1; i < count; i++) {
  if (data[i].low < minLow) {
    minLow = data[i].low;
  }
  if (data[i].high > maxHigh) {
    maxHigh = data[i].high;
  }
}
let dataRange = maxHigh - minLow;
const pricePad = dataRange * 0.08;
minLow -= pricePad;
maxHigh += pricePad;
dataRange = maxHigh - minLow;

const chartTop = 0;
const volumeH = showVolume ? H * 0.18 : 0;
const chartH = H - volumeH;
const gap = 2;
const candleW = (W - gap * (count + 1)) / count;

const nodes = [];

if (showGrid) {
  for (let g = 0; g <= gridLines; g++) {
    const gy = chartTop + (chartH / gridLines) * g;
    nodes.push({
      type: "line",
      x: 0,
      y: gy,
      width: W,
      height: 0,
      stroke: { fill: gridColor, thickness: 1, align: "center", dashPattern: [4, 4] },
    });
  }
}

if (showVolume) {
  for (let i = 0; i < count; i++) {
    const d = data[i];
    const bull = d.close >= d.open;
    const barH = d.volume * volumeH * 0.8;
    const bx = gap + i * (candleW + gap);
    nodes.push({
      type: "rectangle",
      x: bx,
      y: H - barH,
      width: candleW,
      height: barH,
      cornerRadius: [2, 2, 0, 0],
      fill: bull ? volumeBullColor : volumeBearColor,
    });
  }
}

for (let i = 0; i < count; i++) {
  const d = data[i];
  const bull = d.close >= d.open;
  const color = bull ? bullColor : bearColor;
  const bx = gap + i * (candleW + gap);

  const wickHigh = chartTop + ((maxHigh - d.high) / dataRange) * chartH;
  const wickLow = chartTop + ((maxHigh - d.low) / dataRange) * chartH;
  nodes.push({
    type: "rectangle",
    x: bx + candleW / 2 - wickW / 2,
    y: wickHigh,
    width: wickW,
    height: wickLow - wickHigh,
    fill: color,
    cornerRadius: 1,
  });

  const bodyTop = chartTop + ((maxHigh - Math.max(d.open, d.close)) / dataRange) * chartH;
  const bodyBottom = chartTop + ((maxHigh - Math.min(d.open, d.close)) / dataRange) * chartH;
  let bodyH = bodyBottom - bodyTop;
  if (bodyH < 2) {
    bodyH = 2;
  }
  nodes.push({
    type: "rectangle",
    x: bx,
    y: bodyTop,
    width: candleW,
    height: bodyH,
    fill: color,
    cornerRadius: 1,
  });
}

if (showCrosshair && active < count) {
  const ad = data[active];
  const ax = gap + active * (candleW + gap) + candleW / 2;
  const ay = chartTop + ((maxHigh - ad.close) / dataRange) * chartH;

  nodes.push({
    type: "line",
    x: ax,
    y: 0,
    width: 0,
    height: H,
    stroke: { fill: crosshairColor, thickness: 1, align: "center", dashPattern: [3, 3] },
  });

  nodes.push({
    type: "line",
    x: 0,
    y: ay,
    width: W,
    height: 0,
    stroke: { fill: crosshairColor, thickness: 1, align: "center", dashPattern: [3, 3] },
  });

  nodes.push({
    type: "ellipse",
    x: ax - 5,
    y: ay - 5,
    width: 10,
    height: 10,
    fill: crosshairColor,
  });

  nodes.push({
    type: "frame",
    x: W - 72,
    y: ay - 12,
    width: 68,
    height: 24,
    cornerRadius: 4,
    fill: crosshairColor,
    layout: "horizontal",
    justifyContent: "center",
    alignItems: "center",
    children: [
      {
        type: "text",
        content: "$" + ad.close.toFixed(2),
        fontSize: 10,
        fontFamily: "Geist Mono",
        fontWeight: "600",
        fill: "#FFFFFF",
      },
    ],
  });
}

return nodes;
