precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * The base color that fills the empty areas.
 * @label Background Color
 * @color @default #0b0b12
 */
uniform vec3 u_backgroundColor;

/**
 * The color of the dots that make up the shapes.
 * @label Dot Color
 * @color @default #e8e3d3
 */
uniform vec3 u_dotColor;

/**
 * How big each dot is. Small = fine and detailed, large = chunky and retro.
 * @label Dot Size
 * @default 3.0
 */
uniform float u_dotSize;

/**
 * How big the cloudy shapes are. Small = lots of little blobs, large = a few
 * big sweeping clouds.
 * @label Shape Size
 * @default 2.7
 */
uniform float u_shapeSize;

/**
 * How rough the shapes are. Low = smooth blobs, high = grainy crinkly detail.
 * @label Roughness
 * @default 0.5
 */
uniform float u_roughness;

/**
 * How fast the shapes slide across the frame. 0 = frozen still.
 * @label Movement
 * @default 0.2
 */
uniform float u_movement;

/**
 * Which way the shapes slide, in degrees. 0 = right, 90 = up, 180 = left.
 * @label Slide Angle
 * @default 45.0
 */
uniform float u_slideAngle;

/**
 * Swirl that bends the shapes into flowing, marbled forms. 0 = plain blobs.
 * @label Warp
 * @default 0.4
 */
uniform float u_warp;

/**
 * How much of the frame fills up with dots. 0 = almost empty, 1 = almost solid.
 * @label Coverage
 * @default 0.5
 */
uniform float u_coverage;

/**
 * Low = a soft, even scattering of dots; high = bold solid patches with crisp
 * edges.
 * @label Contrast
 * @default 1.0
 */
uniform float u_contrast;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p, float gain) {
  float sum = 0.0;
  float amp = 0.5;
  float norm = 0.0;
  for (int i = 0; i < 6; i++) {
    sum += amp * valueNoise(p);
    norm += amp;
    p = p * 2.0 + 19.7;
    amp *= gain;
  }
  return sum / norm;
}

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x * 0.5 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

void main() {
  float cell = max(u_dotSize, 1.0);
  vec2 pix = floor(gl_FragCoord.xy / cell);
  vec2 snapped = (pix + 0.5) * cell;

  vec2 np = snapped / u_resolution.y * (8.0 / max(u_shapeSize, 0.2));
  float slide = radians(u_slideAngle);
  np += u_time * u_movement * vec2(cos(slide), sin(slide));

  float gain = clamp(u_roughness, 0.0, 1.0) * 0.65;
  if (u_warp > 0.0) {
    np += u_warp * vec2(fbm(np, gain), fbm(np + vec2(5.2, 1.3), gain));
  }
  float g = fbm(np, gain) + u_coverage - 0.5;
  g = clamp((g - 0.5) * max(u_contrast, 0.05) + 0.5, 0.0, 1.0);

  float on = 1.0 - step(g, bayer4(pix));
  gl_FragColor = vec4(mix(u_backgroundColor, u_dotColor, on), 1.0);
}
