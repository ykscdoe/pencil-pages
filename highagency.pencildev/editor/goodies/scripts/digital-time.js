/**
 * @schema 2.10
 * @input minutes: number(min=0, max=99) = 3
 * @input seconds: number(min=0, max=59) = 45
 * @input color: color = #00FF00
 */

const W = pencil.width;
const H = pencil.height;

const min = Math.floor(pencil.input.minutes);
const sec = Math.floor(pencil.input.seconds);

const onColor = pencil.input.color;
const offColor = onColor.slice(0, 7) + "12";

// 7-segment map: [a,b,c,d,e,f,g] = [top, topR, botR, bot, botL, topL, mid]
const SEG = [
  [1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 0, 1],
  [1, 1, 1, 1, 0, 0, 1],
  [0, 1, 1, 0, 0, 1, 1],
  [1, 0, 1, 1, 0, 1, 1],
  [1, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 1],
];

const digits = [
  Math.floor(min / 10),
  min % 10,
  -1,
  Math.floor(sec / 10),
  sec % 10,
];

const pad = Math.max(4, W * 0.03);
const colonW = Math.max(10, W * 0.05);
const digitGap = Math.max(3, W * 0.025);
const usableW = W - pad * 2 - colonW - digitGap * 4;
const dw = usableW / 4;
const dh = H - pad * 2;
const t = Math.max(2, Math.min(dw * 0.2, dh * 0.1));

const nodes = [];
let cx = pad;

for (const d of digits) {
  if (d === -1) {
    const dotSz = t * 1.3;
    nodes.push({
      type: "rectangle",
      x: cx + (colonW - dotSz) / 2,
      y: pad + dh * 0.27 - dotSz / 2,
      width: dotSz,
      height: dotSz,
      fill: onColor,
      cornerRadius: 1,
    });
    nodes.push({
      type: "rectangle",
      x: cx + (colonW - dotSz) / 2,
      y: pad + dh * 0.73 - dotSz / 2,
      width: dotSz,
      height: dotSz,
      fill: onColor,
      cornerRadius: 1,
    });
    cx += colonW + digitGap;
    continue;
  }

  const s = SEG[d];
  const ox = cx;
  const oy = pad;
  const hw = dw - t * 2;
  const hh = (dh - t * 3) / 2;

  nodes.push({
    type: "rectangle",
    x: ox + t,
    y: oy,
    width: hw,
    height: t,
    fill: s[0] ? onColor : offColor,
    cornerRadius: 1,
  });
  nodes.push({
    type: "rectangle",
    x: ox + dw - t,
    y: oy + t,
    width: t,
    height: hh,
    fill: s[1] ? onColor : offColor,
    cornerRadius: 1,
  });
  nodes.push({
    type: "rectangle",
    x: ox + dw - t,
    y: oy + t + hh + t,
    width: t,
    height: hh,
    fill: s[2] ? onColor : offColor,
    cornerRadius: 1,
  });
  nodes.push({
    type: "rectangle",
    x: ox + t,
    y: oy + dh - t,
    width: hw,
    height: t,
    fill: s[3] ? onColor : offColor,
    cornerRadius: 1,
  });
  nodes.push({
    type: "rectangle",
    x: ox,
    y: oy + t + hh + t,
    width: t,
    height: hh,
    fill: s[4] ? onColor : offColor,
    cornerRadius: 1,
  });
  nodes.push({
    type: "rectangle",
    x: ox,
    y: oy + t,
    width: t,
    height: hh,
    fill: s[5] ? onColor : offColor,
    cornerRadius: 1,
  });
  nodes.push({
    type: "rectangle",
    x: ox + t,
    y: oy + t + hh,
    width: hw,
    height: t,
    fill: s[6] ? onColor : offColor,
    cornerRadius: 1,
  });

  cx += dw + digitGap;
}

return nodes;
