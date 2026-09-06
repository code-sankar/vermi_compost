/**
 * Procedural artwork generator for the Kenchua storefront.
 *
 * Every image on the site is produced here as a self-contained SVG so the
 * build has no external image dependencies. Swap any file in public/images
 * for a real photograph of the same aspect ratio and the site picks it up.
 *
 *   node scripts/generate-images.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images')
mkdirSync(OUT, { recursive: true })

/* ------------------------------------------------------------------ utils */

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hex2rgb = (h) => {
  const s = h.replace('#', '')
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)]
}
const rgb2hex = (r) =>
  '#' + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
const mix = (a, b, t) => {
  const A = hex2rgb(a)
  const B = hex2rgb(b)
  return rgb2hex([0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t))
}
/** positive t lightens, negative t darkens */
const shade = (c, t) => (t < 0 ? mix(c, '#000000', -t) : mix(c, '#ffffff', t))
const n = (v) => Number(v).toFixed(1)

/** Catmull-Rom-ish smoothing through a closed ring of points. */
function smoothClosed(p) {
  let d = `M ${n(p[0][0])} ${n(p[0][1])}`
  for (let i = 0; i < p.length; i++) {
    const pv = p[(i - 1 + p.length) % p.length]
    const c = p[i]
    const nx = p[(i + 1) % p.length]
    const nn = p[(i + 2) % p.length]
    const c1 = [c[0] + (nx[0] - pv[0]) / 6, c[1] + (nx[1] - pv[1]) / 6]
    const c2 = [nx[0] - (nn[0] - c[0]) / 6, nx[1] - (nn[1] - c[1]) / 6]
    d += ` C ${n(c1[0])} ${n(c1[1])}, ${n(c2[0])} ${n(c2[1])}, ${n(nx[0])} ${n(nx[1])}`
  }
  return d + ' Z'
}

function blob(cx, cy, r, pts, irr, rnd, squash = 1) {
  const ring = []
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2
    const rr = r * (1 - irr + rnd() * irr * 2)
    ring.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * squash])
  }
  return smoothClosed(ring)
}

/** A pointed leaf centred on the origin, tip pointing up. */
function leafPath(len, wid) {
  return `M 0 0 C ${n(wid)} ${n(-len * 0.35)}, ${n(wid * 0.55)} ${n(-len * 0.85)}, 0 ${n(-len)} C ${n(-wid * 0.55)} ${n(-len * 0.85)}, ${n(-wid)} ${n(-len * 0.35)}, 0 0 Z`
}

/* --------------------------------------------------------------- palettes */

const P = {
  ink: '#191108',
  soilDeep: '#2a1c10',
  soil: '#422d1a',
  soilMid: '#5c4026',
  soilWarm: '#7a5433',
  bark: '#946c42',
  clay: '#bd7d4c',
  sand: '#e3d7c1',
  cream: '#f7f2e7',
  moss: '#42582f',
  leaf: '#6d8b46',
  leafBright: '#9ab566',
  sage: '#b9c79a',
  worm: '#b06a58',
  wormLight: '#d09385',
  sky: '#dfe4d8',
  skyWarm: '#f0e6d2',
}

/* ----------------------------------------------------------------- shells */

function defs(seed, extra = '') {
  return `
  <defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="${seed}" result="t"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="softer"><feGaussianBlur stdDeviation="44"/></filter>
    <filter id="haze"><feGaussianBlur stdDeviation="7"/></filter>
    ${extra}
  </defs>`
}

function finish(w, h, { vignette = 0.42, grain = 0.16, warm = null } = {}) {
  return `
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="${grain}" style="mix-blend-mode:overlay"/>
  ${warm ? `<rect width="${w}" height="${h}" fill="${warm}" opacity="0.1" style="mix-blend-mode:soft-light"/>` : ''}
  <rect width="${w}" height="${h}" fill="url(#vig)" opacity="${vignette}"/>`
}

function vignetteDef(w, h) {
  return `<radialGradient id="vig" cx="50%" cy="42%" r="76%">
      <stop offset="52%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#140d05" stop-opacity="0.85"/>
    </radialGradient>`
}

function svg(w, h, body, seed, extraDefs = '', opts) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
${defs(seed, vignetteDef(w, h) + extraDefs)}
${body}
${finish(w, h, opts)}
</svg>`
}

/* ----------------------------------------------------------------- pieces */

/** Dense crumb texture — the base for every soil / compost scene. */
function crumbs(w, h, rnd, { count = 620, base = P.soil, y0 = 0, y1 = 1, scale = 1 } = {}) {
  let s = ''
  const tones = [shade(base, -0.28), shade(base, -0.12), base, shade(base, 0.1), shade(base, 0.22), P.bark]
  for (let i = 0; i < count; i++) {
    const t = rnd()
    const x = rnd() * w
    const y = (y0 + rnd() * (y1 - y0)) * h
    const depth = (y / h - y0) / Math.max(0.001, y1 - y0)
    const r = (6 + rnd() * 30) * scale * (0.5 + depth * 0.9)
    const col = tones[Math.floor(rnd() * tones.length)]
    const rot = rnd() * 360
    s += `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(rot)})"><path d="${blob(0, 0, r, 7, 0.4, rnd, 0.72)}" fill="${col}" opacity="${(0.5 + t * 0.45).toFixed(2)}"/></g>`
    if (rnd() > 0.72) {
      s += `<ellipse cx="${n(x - r * 0.25)}" cy="${n(y - r * 0.3)}" rx="${n(r * 0.34)}" ry="${n(r * 0.22)}" fill="${shade(col, 0.34)}" opacity="0.4"/>`
    }
  }
  return s
}

/** One tapered, shaded earthworm following a sine ribbon. */
function worm(x0, y0, len, amp, thick, rnd, phase = 0, tilt = 0) {
  const steps = 150
  let body = ''
  let hi = ''
  const cos = Math.cos(tilt)
  const sin = Math.sin(tilt)
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const lx = t * len
    const ly = Math.sin(t * Math.PI * 2.1 + phase) * amp
    const x = x0 + lx * cos - ly * sin
    const y = y0 + lx * sin + ly * cos
    const r = thick * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.02)), 0.55)
    const band = t > 0.3 && t < 0.4
    const col = band ? P.wormLight : mix(P.worm, shade(P.worm, -0.3), t * 0.5)
    body += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${col}"/>`
    if (i % 2 === 0) {
      hi += `<circle cx="${n(x - r * 0.22)}" cy="${n(y - r * 0.34)}" r="${n(r * 0.42)}" fill="${P.wormLight}" opacity="0.55"/>`
    }
  }
  return `<g>${body}${hi}</g>`
}

function sprout(x, y, s, rnd, tone = P.leaf) {
  let g = `<path d="M 0 0 C ${n(s * 0.1)} ${n(-s * 0.4)}, ${n(-s * 0.08)} ${n(-s * 0.7)}, ${n(s * 0.04)} ${n(-s)}" stroke="${shade(tone, -0.2)}" stroke-width="${n(s * 0.055)}" fill="none" stroke-linecap="round"/>`
  const leaves = 2 + Math.floor(rnd() * 4)
  for (let i = 0; i < leaves; i++) {
    const t = 0.32 + (i / leaves) * 0.6
    const ly = -s * t
    const dir = i % 2 ? 1 : -1
    const ll = s * (0.34 + rnd() * 0.3)
    const col = mix(tone, P.leafBright, rnd() * 0.6)
    g += `<g transform="translate(${n(s * 0.04 * t)} ${n(ly)}) rotate(${n(dir * (58 + rnd() * 26))})"><path d="${leafPath(ll, ll * 0.45)}" fill="${col}"/><path d="M 0 0 L 0 ${n(-ll)}" stroke="${shade(col, -0.22)}" stroke-width="${n(ll * 0.035)}" opacity="0.7"/></g>`
  }
  return `<g transform="translate(${n(x)} ${n(y)})">${g}</g>`
}

/* ----------------------------------------------------------------- scenes */

const scenes = {}

scenes.soil = (w, h, rnd, o = {}) => {
  const base = o.base || P.soil
  let s = `<rect width="${w}" height="${h}" fill="${shade(base, -0.4)}"/>`
  s += crumbs(w, h, rnd, { count: o.count || 760, base, scale: o.scale || 1 })
  s += `<ellipse cx="${n(w * 0.42)}" cy="${n(h * 0.3)}" rx="${n(w * 0.6)}" ry="${n(h * 0.55)}" fill="${P.skyWarm}" opacity="0.14" filter="url(#softer)"/>`
  return s
}

scenes.worms = (w, h, rnd) => {
  let s = scenes.soil(w, h, rnd, { count: 520, base: P.soilDeep })
  const count = 3 + Math.floor(rnd() * 3)
  for (let i = 0; i < count; i++) {
    s += worm(
      w * (0.02 + rnd() * 0.4),
      h * (0.16 + rnd() * 0.7),
      w * (0.4 + rnd() * 0.45),
      h * (0.05 + rnd() * 0.09),
      w * (0.016 + rnd() * 0.014),
      rnd,
      rnd() * 6,
      (rnd() - 0.5) * 0.7
    )
  }
  s += crumbs(w, h, rnd, { count: 150, base: P.soilMid, y0: 0.72, y1: 1.06, scale: 1.5 })
  return s
}

scenes.castings = (w, h, rnd) => {
  let s = `<rect width="${w}" height="${h}" fill="${shade(P.soilDeep, -0.3)}"/>`
  s += crumbs(w, h, rnd, { count: 900, base: P.soilMid, scale: 0.72 })
  for (let i = 0; i < 26; i++) {
    const x = rnd() * w
    const y = rnd() * h
    const r = 10 + rnd() * 22
    let c = `<g transform="translate(${n(x)} ${n(y)})">`
    for (let k = 0; k < 7; k++) {
      c += `<ellipse cx="${n((rnd() - 0.5) * r)}" cy="${n(-k * r * 0.3)}" rx="${n(r * (0.9 - k * 0.07))}" ry="${n(r * 0.3)}" fill="${shade(P.soilWarm, k * 0.04)}" opacity="0.9"/>`
    }
    s += c + '</g>'
  }
  return s
}

scenes.sprouts = (w, h, rnd) => {
  let s = `<rect width="${w}" height="${h}" fill="${mix(P.sky, P.sage, 0.35)}"/>`
  s += `<rect width="${w}" height="${h}" fill="url(#bok)"/>`
  for (let i = 0; i < 22; i++) {
    s += `<circle cx="${n(rnd() * w)}" cy="${n(rnd() * h * 0.75)}" r="${n(24 + rnd() * 90)}" fill="${P.cream}" opacity="${(0.05 + rnd() * 0.14).toFixed(2)}" filter="url(#soft)"/>`
  }
  s += `<g filter="url(#haze)" opacity="0.55">`
  for (let i = 0; i < 7; i++) s += sprout(w * (0.05 + rnd() * 0.9), h * 0.86, h * (0.3 + rnd() * 0.2), rnd, P.sage)
  s += `</g>`
  s += `<path d="M 0 ${n(h * 0.8)} Q ${n(w * 0.5)} ${n(h * 0.72)} ${w} ${n(h * 0.82)} L ${w} ${h} L 0 ${h} Z" fill="${shade(P.soil, -0.15)}"/>`
  s += crumbs(w, h, rnd, { count: 340, base: P.soil, y0: 0.78, y1: 1.05, scale: 1.25 })
  const main = 3 + Math.floor(rnd() * 3)
  for (let i = 0; i < main; i++) {
    s += sprout(w * (0.16 + (i / main) * 0.7 + (rnd() - 0.5) * 0.08), h * (0.83 + rnd() * 0.05), h * (0.42 + rnd() * 0.24), rnd)
  }
  for (let i = 0; i < 40; i++) {
    s += `<circle cx="${n(rnd() * w)}" cy="${n(rnd() * h * 0.8)}" r="${n(1.5 + rnd() * 4)}" fill="${P.cream}" opacity="${(0.2 + rnd() * 0.5).toFixed(2)}"/>`
  }
  return s
}

scenes.canopy = (w, h, rnd) => {
  let s = `<rect width="${w}" height="${h}" fill="${shade(P.moss, -0.5)}"/>`
  for (let layer = 0; layer < 4; layer++) {
    const blurAttr = layer < 2 ? ' filter="url(#haze)"' : ''
    let g = `<g${blurAttr} opacity="${0.55 + layer * 0.15}">`
    for (let i = 0; i < 30; i++) {
      const x = rnd() * w
      const y = rnd() * h
      const len = (h * 0.14 + rnd() * h * 0.3) * (0.5 + layer * 0.22)
      const col = mix(shade(P.moss, -0.2 + layer * 0.05), P.leafBright, rnd() * (0.2 + layer * 0.22))
      g += `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(rnd() * 360)})"><path d="${leafPath(len, len * (0.3 + rnd() * 0.2))}" fill="${col}"/><path d="M 0 0 L 0 ${n(-len)}" stroke="${shade(col, -0.25)}" stroke-width="${n(len * 0.02)}" opacity="0.6"/></g>`
    }
    s += g + '</g>'
  }
  s += `<ellipse cx="${n(w * 0.7)}" cy="${n(h * 0.16)}" rx="${n(w * 0.4)}" ry="${n(h * 0.32)}" fill="${P.skyWarm}" opacity="0.3" filter="url(#softer)"/>`
  return s
}

scenes.field = (w, h, rnd) => {
  const hz = h * 0.42
  let s = `<rect width="${w}" height="${h}" fill="url(#skyg)"/>`
  s += `<circle cx="${n(w * 0.74)}" cy="${n(hz * 0.42)}" r="${n(h * 0.13)}" fill="${P.skyWarm}" opacity="0.75" filter="url(#soft)"/>`
  for (let i = 0; i < 5; i++) {
    s += `<ellipse cx="${n(rnd() * w)}" cy="${n(hz * (0.2 + rnd() * 0.5))}" rx="${n(w * (0.1 + rnd() * 0.2))}" ry="${n(h * 0.035)}" fill="${P.cream}" opacity="0.28" filter="url(#soft)"/>`
  }
  let tree = `<g filter="url(#haze)" opacity="0.9">`
  for (let i = 0; i < 34; i++) {
    const x = (i / 34) * w + (rnd() - 0.5) * 60
    const r = h * (0.03 + rnd() * 0.055)
    tree += `<path d="${blob(x, hz - r * 0.4, r, 9, 0.35, rnd, 0.8)}" fill="${mix(shade(P.moss, -0.35), P.sky, 0.25)}"/>`
  }
  s += tree + '</g>'
  s += `<path d="M 0 ${n(hz)} L ${w} ${n(hz)} L ${w} ${h} L 0 ${h} Z" fill="${mix(P.soilMid, P.moss, 0.3)}"/>`
  const rows = 16
  for (let i = 0; i <= rows; i++) {
    const t = i / rows
    const topX = w * (0.2 + t * 0.6)
    const botX = w * (-1.4 + t * 3.8)
    const col = mix(shade(P.soil, -0.1), P.moss, 0.15 + rnd() * 0.25)
    s += `<path d="M ${n(topX)} ${n(hz)} L ${n(botX)} ${h} L ${n(botX + w * 0.13)} ${h} L ${n(topX + 7)} ${n(hz)} Z" fill="${col}" opacity="${(0.5 + rnd() * 0.4).toFixed(2)}"/>`
  }
  for (let i = 0; i < 130; i++) {
    const t = Math.pow(rnd(), 0.55)
    const y = hz + t * (h - hz)
    const x = rnd() * w
    const sc = h * 0.02 + t * h * 0.13
    s += sprout(x, y, sc, rnd, mix(P.moss, P.leafBright, rnd() * 0.5))
  }
  s += crumbs(w, h, rnd, { count: 220, base: P.soil, y0: 0.9, y1: 1.1, scale: 2 })
  return s
}

scenes.beds = (w, h, rnd) => {
  let s = `<rect width="${w}" height="${h}" fill="${mix(P.sand, P.bark, 0.35)}"/>`
  s += crumbs(w, h, rnd, { count: 260, base: mix(P.sand, P.bark, 0.4), scale: 0.8 })
  const cols = 3
  const rows = 2
  const pad = w * 0.045
  const bw = (w - pad * (cols + 1)) / cols
  const bh = (h - pad * (rows + 1)) / rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = pad + c * (bw + pad)
      const y = pad + r * (bh + pad)
      s += `<rect x="${n(x)}" y="${n(y)}" width="${n(bw)}" height="${n(bh)}" rx="${n(bw * 0.04)}" fill="${shade(P.soilDeep, -0.2)}"/>`
      s += `<g clip-path="inset(0 round ${n(bw * 0.04)}px)"><g transform="translate(${n(x)} ${n(y)})">${crumbs(bw, bh, rnd, { count: 190, base: P.soil, scale: 0.55 })}</g></g>`
      s += `<rect x="${n(x)}" y="${n(y)}" width="${n(bw)}" height="${n(bh)}" rx="${n(bw * 0.04)}" fill="none" stroke="${mix(P.bark, P.cream, 0.35)}" stroke-width="${n(w * 0.008)}"/>`
      if (rnd() > 0.45) {
        for (let k = 0; k < 3; k++) s += sprout(x + bw * (0.2 + rnd() * 0.6), y + bh * (0.35 + rnd() * 0.5), bh * 0.3, rnd)
      }
    }
  }
  return s
}

scenes.hands = (w, h, rnd) => {
  const skin = '#c08e63'
  const cx = w * 0.5
  const cy = h * 0.52
  const R = Math.min(w, h) * 0.3

  let s = `<rect width="${w}" height="${h}" fill="${mix(P.soilDeep, P.ink, 0.45)}"/>`
  s += `<g filter="url(#soft)" opacity="0.75">${crumbs(w, h, rnd, { count: 300, base: P.soilDeep, scale: 1.6 })}</g>`
  s += `<ellipse cx="${n(cx)}" cy="${n(h * 0.26)}" rx="${n(w * 0.5)}" ry="${n(h * 0.36)}" fill="${P.skyWarm}" opacity="0.2" filter="url(#softer)"/>`

  // forearms receding to the bottom corners
  for (const dir of [-1, 1]) {
    s += `<path d="M ${n(cx + dir * w * 0.42)} ${n(h * 1.08)} Q ${n(cx + dir * w * 0.3)} ${n(cy + R * 0.95)} ${n(cx + dir * w * 0.19)} ${n(cy + R * 0.6)}" stroke="${shade(skin, -0.16)}" stroke-width="${n(w * 0.15)}" stroke-linecap="round" fill="none"/>`
    s += `<path d="M ${n(cx + dir * w * 0.4)} ${n(h * 1.05)} Q ${n(cx + dir * w * 0.29)} ${n(cy + R * 0.93)} ${n(cx + dir * w * 0.19)} ${n(cy + R * 0.62)}" stroke="${skin}" stroke-width="${n(w * 0.115)}" stroke-linecap="round" fill="none"/>`
    // palm heel
    s += `<path d="${blob(cx + dir * w * 0.185, cy + R * 0.5, w * 0.115, 9, 0.14, rnd, 0.92)}" fill="${skin}"/>`
  }

  // the mound of castings resting in the cup
  const moundPath = blob(cx, cy + R * 0.06, R, 14, 0.13, mulberry32(5), 0.78)
  s += `<path d="${moundPath}" fill="${shade(P.soil, -0.12)}"/>`
  s += `<g clip-path="url(#moundClip)">${crumbs(w, h, rnd, { count: 260, base: P.soilWarm, y0: 0.3, y1: 0.78, scale: 0.5 })}</g>`
  s += `<ellipse cx="${n(cx - R * 0.25)}" cy="${n(cy - R * 0.3)}" rx="${n(R * 0.5)}" ry="${n(R * 0.3)}" fill="${P.skyWarm}" opacity="0.16" filter="url(#soft)"/>`

  // fingers curling over the front of the mound
  for (const dir of [-1, 1]) {
    for (let f = 0; f < 4; f++) {
      const t = f / 3
      const bx = cx + dir * (w * 0.225 - t * w * 0.022)
      const by = cy + R * (0.16 + t * 0.34)
      const tx = cx + dir * (w * 0.052 + t * w * 0.016)
      const ty = cy + R * (0.5 + t * 0.28)
      const mx = (bx + tx) / 2
      const my = (by + ty) / 2 + R * 0.16
      const width = w * (0.05 - t * 0.007)
      s += `<path d="M ${n(bx)} ${n(by)} Q ${n(mx)} ${n(my)} ${n(tx)} ${n(ty)}" stroke="${shade(skin, -0.14)}" stroke-width="${n(width)}" stroke-linecap="round" fill="none"/>`
      s += `<path d="M ${n(bx)} ${n(by - width * 0.12)} Q ${n(mx)} ${n(my - width * 0.14)} ${n(tx)} ${n(ty - width * 0.1)}" stroke="${skin}" stroke-width="${n(width * 0.74)}" stroke-linecap="round" fill="none"/>`
      s += `<ellipse cx="${n(tx)}" cy="${n(ty - width * 0.12)}" rx="${n(width * 0.24)}" ry="${n(width * 0.18)}" fill="${shade(skin, 0.22)}" opacity="0.75"/>`
    }
    // thumb
    s += `<path d="M ${n(cx + dir * w * 0.245)} ${n(cy + R * 0.62)} Q ${n(cx + dir * w * 0.185)} ${n(cy + R * 0.95)} ${n(cx + dir * w * 0.1)} ${n(cy + R * 0.98)}" stroke="${shade(skin, -0.08)}" stroke-width="${n(w * 0.062)}" stroke-linecap="round" fill="none"/>`
  }

  // crumbs spilling through the fingers
  for (let i = 0; i < 34; i++) {
    const x = cx + (rnd() - 0.5) * R * 1.7
    const y = cy + R * (0.75 + rnd() * 1.5)
    s += `<path d="${blob(x, y, 4 + rnd() * 11, 6, 0.4, rnd, 0.8)}" fill="${shade(P.soilWarm, (rnd() - 0.4) * 0.3)}" opacity="${(0.55 + rnd() * 0.45).toFixed(2)}"/>`
  }
  s += sprout(cx + (rnd() - 0.5) * R * 0.3, cy - R * 0.5, R * 0.85, rnd)
  return s
}

scenes.bag = (w, h, rnd, o = {}) => {
  const accent = o.accent || P.moss
  let s = `<rect width="${w}" height="${h}" fill="url(#stud)"/>`
  const bw = w * (o.wide ? 0.64 : 0.5)
  const bh = h * (o.wide ? 0.56 : 0.66)
  const x = (w - bw) / 2
  const y = h * (o.wide ? 0.3 : 0.2)
  s += `<ellipse cx="${n(w / 2)}" cy="${n(y + bh + h * 0.015)}" rx="${n(bw * 0.62)}" ry="${n(h * 0.035)}" fill="${P.ink}" opacity="0.25" filter="url(#soft)"/>`
  s += `<path d="M ${n(x)} ${n(y + bh)} L ${n(x + bw * 0.03)} ${n(y + bh * 0.1)} Q ${n(w / 2)} ${n(y - bh * 0.03)} ${n(x + bw * 0.97)} ${n(y + bh * 0.1)} L ${n(x + bw)} ${n(y + bh)} Z" fill="${o.body || mix(P.sand, P.cream, 0.4)}"/>`
  s += `<path d="M ${n(x + bw * 0.03)} ${n(y + bh * 0.1)} Q ${n(w / 2)} ${n(y - bh * 0.03)} ${n(x + bw * 0.97)} ${n(y + bh * 0.1)} L ${n(x + bw * 0.94)} ${n(y + bh * 0.02)} Q ${n(w / 2)} ${n(y - bh * 0.12)} ${n(x + bw * 0.06)} ${n(y + bh * 0.02)} Z" fill="${shade(o.body || P.sand, -0.18)}"/>`
  s += `<rect x="${n(x)}" y="${n(y + bh * 0.08)}" width="${n(bw * 0.12)}" height="${n(bh * 0.92)}" fill="${P.ink}" opacity="0.1"/>`
  s += `<rect x="${n(x + bw * 0.86)}" y="${n(y + bh * 0.08)}" width="${n(bw * 0.14)}" height="${n(bh * 0.92)}" fill="${P.ink}" opacity="0.14"/>`
  const lx = x + bw * 0.17
  const lw = bw * 0.66
  const ly = y + bh * 0.24
  const lh = bh * 0.5
  s += `<rect x="${n(lx)}" y="${n(ly)}" width="${n(lw)}" height="${n(lh)}" rx="${n(lw * 0.06)}" fill="${accent}"/>`
  s += `<rect x="${n(lx + lw * 0.06)}" y="${n(ly + lh * 0.07)}" width="${n(lw * 0.88)}" height="${n(lh * 0.86)}" rx="${n(lw * 0.04)}" fill="none" stroke="${P.cream}" stroke-width="${n(lw * 0.012)}" opacity="0.75"/>`
  s += `<g transform="translate(${n(lx + lw * 0.5)} ${n(ly + lh * 0.44)})">`
  for (let i = 0; i < 3; i++) {
    s += `<g transform="rotate(${n(-40 + i * 40)})"><path d="${leafPath(lh * 0.24, lh * 0.09)}" fill="${P.cream}" opacity="0.9"/></g>`
  }
  s += `</g>`
  s += `<rect x="${n(lx + lw * 0.2)}" y="${n(ly + lh * 0.58)}" width="${n(lw * 0.6)}" height="${n(lh * 0.055)}" rx="${n(lh * 0.028)}" fill="${P.cream}" opacity="0.92"/>`
  s += `<rect x="${n(lx + lw * 0.32)}" y="${n(ly + lh * 0.7)}" width="${n(lw * 0.36)}" height="${n(lh * 0.035)}" rx="${n(lh * 0.018)}" fill="${P.cream}" opacity="0.6"/>`
  s += `<path d="M ${n(x + bw * 0.12)} ${n(y + bh * 0.1)} L ${n(x + bw * 0.12)} ${n(y + bh)}" stroke="${P.cream}" stroke-width="${n(bw * 0.01)}" opacity="0.35"/>`
  return s
}

scenes.bottle = (w, h, rnd, o = {}) => {
  const accent = o.accent || P.moss
  let s = `<rect width="${w}" height="${h}" fill="url(#stud)"/>`
  const bw = w * 0.3
  const bh = h * 0.62
  const x = (w - bw) / 2
  const y = h * 0.24
  s += `<ellipse cx="${n(w / 2)}" cy="${n(y + bh + h * 0.012)}" rx="${n(bw * 0.75)}" ry="${n(h * 0.028)}" fill="${P.ink}" opacity="0.25" filter="url(#soft)"/>`
  s += `<rect x="${n(w / 2 - bw * 0.17)}" y="${n(y - h * 0.075)}" width="${n(bw * 0.34)}" height="${n(h * 0.085)}" rx="${n(bw * 0.05)}" fill="${shade(accent, -0.25)}"/>`
  s += `<path d="M ${n(x)} ${n(y + bh)} L ${n(x)} ${n(y + bh * 0.2)} Q ${n(x)} ${n(y + bh * 0.04)} ${n(w / 2 - bw * 0.16)} ${n(y)} L ${n(w / 2 + bw * 0.16)} ${n(y)} Q ${n(x + bw)} ${n(y + bh * 0.04)} ${n(x + bw)} ${n(y + bh * 0.2)} L ${n(x + bw)} ${n(y + bh)} Z" fill="${o.body || '#6b4a33'}" opacity="0.95"/>`
  s += `<rect x="${n(x + bw * 0.08)}" y="${n(y + bh * 0.16)}" width="${n(bw * 0.14)}" height="${n(bh * 0.7)}" rx="${n(bw * 0.07)}" fill="${P.cream}" opacity="0.22"/>`
  const lh = bh * 0.44
  s += `<rect x="${n(x)}" y="${n(y + bh * 0.34)}" width="${n(bw)}" height="${n(lh)}" fill="${accent}"/>`
  s += `<g transform="translate(${n(w / 2)} ${n(y + bh * 0.34 + lh * 0.4)})">`
  for (let i = 0; i < 3; i++) s += `<g transform="rotate(${n(-38 + i * 38)})"><path d="${leafPath(lh * 0.26, lh * 0.1)}" fill="${P.cream}" opacity="0.9"/></g>`
  s += `</g>`
  s += `<rect x="${n(x + bw * 0.2)}" y="${n(y + bh * 0.34 + lh * 0.6)}" width="${n(bw * 0.6)}" height="${n(lh * 0.07)}" rx="${n(lh * 0.035)}" fill="${P.cream}" opacity="0.9"/>`
  s += `<rect x="${n(x + bw * 0.32)}" y="${n(y + bh * 0.34 + lh * 0.74)}" width="${n(bw * 0.36)}" height="${n(lh * 0.045)}" rx="${n(lh * 0.022)}" fill="${P.cream}" opacity="0.6"/>`
  return s
}

scenes.bin = (w, h, rnd, o = {}) => {
  const accent = o.accent || P.moss
  let s = `<rect width="${w}" height="${h}" fill="url(#stud)"/>`
  const bw = w * 0.52
  const x = (w - bw) / 2
  const tiers = 3
  const th = h * 0.135
  const top = h * 0.26
  s += `<ellipse cx="${n(w / 2)}" cy="${n(top + tiers * th + h * 0.03)}" rx="${n(bw * 0.66)}" ry="${n(h * 0.03)}" fill="${P.ink}" opacity="0.25" filter="url(#soft)"/>`
  s += `<path d="M ${n(x + bw * 0.06)} ${n(top)} Q ${n(w / 2)} ${n(top - h * 0.06)} ${n(x + bw * 0.94)} ${n(top)} L ${n(x + bw * 0.9)} ${n(top + h * 0.03)} Q ${n(w / 2)} ${n(top - h * 0.015)} ${n(x + bw * 0.1)} ${n(top + h * 0.03)} Z" fill="${shade(accent, -0.3)}"/>`
  for (let i = 0; i < tiers; i++) {
    const y = top + h * 0.02 + i * th
    const col = shade(accent, -0.05 + i * 0.06)
    s += `<rect x="${n(x)}" y="${n(y)}" width="${n(bw)}" height="${n(th * 0.94)}" rx="${n(bw * 0.045)}" fill="${col}"/>`
    s += `<rect x="${n(x)}" y="${n(y)}" width="${n(bw * 0.16)}" height="${n(th * 0.94)}" rx="${n(bw * 0.045)}" fill="${P.cream}" opacity="0.12"/>`
    s += `<rect x="${n(x + bw * 0.84)}" y="${n(y)}" width="${n(bw * 0.16)}" height="${n(th * 0.94)}" rx="${n(bw * 0.045)}" fill="${P.ink}" opacity="0.14"/>`
    for (let v = 0; v < 5; v++) {
      s += `<rect x="${n(x + bw * (0.3 + v * 0.09))}" y="${n(y + th * 0.6)}" width="${n(bw * 0.03)}" height="${n(th * 0.22)}" rx="${n(bw * 0.015)}" fill="${P.ink}" opacity="0.2"/>`
    }
  }
  const oy = top + h * 0.02
  s += `<g clip-path="inset(0 round ${n(bw * 0.045)}px)"><g transform="translate(${n(x)} ${n(oy)})">${crumbs(bw, th * 0.7, rnd, { count: 130, base: P.soil, scale: 0.4 })}</g></g>`
  s += worm(x + bw * 0.24, oy + th * 0.4, bw * 0.5, th * 0.1, bw * 0.022, rnd, 1.2)
  return s
}

scenes.pot = (w, h, rnd) => {
  let s = `<rect width="${w}" height="${h}" fill="url(#stud)"/>`
  const pw = w * 0.4
  const x = (w - pw) / 2
  const y = h * 0.58
  const ph = h * 0.3
  s += `<ellipse cx="${n(w / 2)}" cy="${n(y + ph + h * 0.012)}" rx="${n(pw * 0.6)}" ry="${n(h * 0.025)}" fill="${P.ink}" opacity="0.24" filter="url(#soft)"/>`
  for (let i = 0; i < 9; i++) {
    s += sprout(w / 2 + (rnd() - 0.5) * pw * 0.9, y + ph * 0.06, h * (0.2 + rnd() * 0.28), rnd, mix(P.moss, P.leafBright, rnd()))
  }
  s += `<path d="M ${n(x)} ${n(y)} L ${n(x + pw * 0.14)} ${n(y + ph)} L ${n(x + pw * 0.86)} ${n(y + ph)} L ${n(x + pw)} ${n(y)} Z" fill="${P.clay}"/>`
  s += `<rect x="${n(x - pw * 0.04)}" y="${n(y - ph * 0.1)}" width="${n(pw * 1.08)}" height="${n(ph * 0.16)}" rx="${n(ph * 0.03)}" fill="${shade(P.clay, 0.08)}"/>`
  s += `<path d="M ${n(x + pw * 0.06)} ${n(y + ph * 0.16)} L ${n(x + pw * 0.18)} ${n(y + ph * 0.95)}" stroke="${P.cream}" stroke-width="${n(pw * 0.03)}" opacity="0.18"/>`
  s += `<ellipse cx="${n(w / 2)}" cy="${n(y + ph * 0.02)}" rx="${n(pw * 0.47)}" ry="${n(ph * 0.07)}" fill="${shade(P.soil, -0.2)}"/>`
  return s
}

scenes.texture = (w, h, rnd, o = {}) => {
  const a = o.a || P.soil
  const b = o.b || P.moss
  let s = `<rect width="${w}" height="${h}" fill="${a}"/>`
  for (let i = 0; i < 16; i++) {
    s += `<path d="${blob(rnd() * w, rnd() * h, w * (0.1 + rnd() * 0.35), 9, 0.4, rnd)}" fill="${mix(a, b, rnd())}" opacity="${(0.2 + rnd() * 0.4).toFixed(2)}" filter="url(#softer)"/>`
  }
  s += crumbs(w, h, rnd, { count: 420, base: mix(a, b, 0.35), scale: 0.9 })
  return s
}

/* ------------------------------------------------------------- extra defs */

const skyDef = `<linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#9fb3bd"/><stop offset="55%" stop-color="#d8ddd0"/><stop offset="100%" stop-color="#f2e7d0"/>
  </linearGradient>`
const moundDef = (w, h) => {
  const rnd = mulberry32(5)
  return `<clipPath id="moundClip"><path d="${blob(w * 0.5, h * 0.52 + Math.min(w, h) * 0.3 * 0.06, Math.min(w, h) * 0.3, 14, 0.13, rnd, 0.78)}"/></clipPath>`
}
const studDef = `<linearGradient id="stud" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="#efe7d8"/><stop offset="55%" stop-color="#e2d7c2"/><stop offset="100%" stop-color="#cdbfa6"/>
  </linearGradient>`
const bokDef = `<linearGradient id="bok" x1="0" y1="0" x2="0.2" y2="1">
    <stop offset="0%" stop-color="#cfd9c4" stop-opacity="0.9"/><stop offset="100%" stop-color="#8fa477" stop-opacity="0.5"/>
  </linearGradient>`

/* ------------------------------------------------------------------ build */

const jobs = [
  ['hero-field', 'field', 2400, 1500, 11, {}, { vignette: 0.5 }, skyDef],
  ['hero-hands', 'hands', 1600, 2000, 23, {}, { vignette: 0.55 }, moundDef(1600, 2000)],
  ['soil-macro-1', 'soil', 1400, 1400, 31, {}, {}, ''],
  ['soil-macro-2', 'soil', 1400, 1750, 37, { base: P.soilMid }, {}, ''],
  ['soil-macro-3', 'soil', 1600, 900, 41, { base: P.soilDeep, scale: 1.4 }, {}, ''],
  ['castings-1', 'castings', 1400, 1400, 43, {}, {}, ''],
  ['castings-2', 'castings', 1200, 1500, 47, {}, {}, ''],
  ['worms-1', 'worms', 1600, 1200, 53, {}, {}, ''],
  ['worms-2', 'worms', 1200, 1500, 59, {}, {}, ''],
  ['worms-3', 'worms', 1400, 1400, 61, {}, {}, ''],
  ['sprouts-1', 'sprouts', 1400, 1750, 67, {}, {}, bokDef],
  ['sprouts-2', 'sprouts', 1600, 1000, 71, {}, {}, bokDef],
  ['sprouts-3', 'sprouts', 1400, 1400, 73, {}, {}, bokDef],
  ['canopy-1', 'canopy', 1400, 1750, 79, {}, {}, ''],
  ['canopy-2', 'canopy', 1600, 900, 83, {}, {}, ''],
  ['field-rows', 'field', 1600, 1000, 89, {}, {}, skyDef],
  ['field-wide', 'field', 2000, 900, 97, {}, {}, skyDef],
  ['beds-1', 'beds', 1500, 1100, 101, {}, {}, ''],
  ['beds-2', 'beds', 1200, 1500, 103, {}, {}, ''],
  ['hands-1', 'hands', 1400, 1400, 107, {}, {}, moundDef(1400, 1400)],
  ['hands-2', 'hands', 1600, 1000, 109, {}, {}, moundDef(1600, 1000)],
  ['pot-1', 'pot', 1200, 1500, 113, {}, { vignette: 0.3 }, studDef],
  ['pot-2', 'pot', 1400, 1400, 127, {}, { vignette: 0.3 }, studDef],
  ['texture-1', 'texture', 1600, 900, 131, { a: P.soilDeep, b: P.clay }, {}, ''],
  ['texture-2', 'texture', 1200, 1500, 137, { a: P.moss, b: P.soil }, {}, ''],
  ['texture-3', 'texture', 1400, 1400, 139, { a: P.soil, b: P.bark }, {}, ''],
  // products — studio backdrop
  ['product-vermicompost', 'bag', 1200, 1500, 149, { accent: '#3f5a2e', body: '#f2ead8' }, { vignette: 0.24, grain: 0.1 }, studDef],
  ['product-neem', 'bag', 1200, 1500, 151, { accent: '#1f4a45', body: '#dfe3d2' }, { vignette: 0.24, grain: 0.1 }, studDef],
  ['product-potting-mix', 'bag', 1200, 1500, 157, { accent: '#9c4a24', body: '#efe0c6' }, { vignette: 0.24, grain: 0.1 }, studDef],
  ['product-bulk', 'bag', 1200, 1500, 163, { accent: '#232d1a', body: '#b08a5c', wide: true }, { vignette: 0.24, grain: 0.1 }, studDef],
  ['product-vermiwash', 'bottle', 1200, 1500, 167, { accent: '#3f5a2e' }, { vignette: 0.24, grain: 0.1 }, studDef],
  ['product-tea', 'bottle', 1200, 1500, 173, { accent: '#5c4026', body: '#3f2a1c' }, { vignette: 0.24, grain: 0.1 }, studDef],
  ['product-bin', 'bin', 1200, 1500, 179, { accent: '#43613a' }, { vignette: 0.24, grain: 0.1 }, studDef],
  ['product-worms', 'worms', 1200, 1500, 181, {}, { vignette: 0.3 }, ''],
  ['product-starter', 'bin', 1200, 1500, 191, { accent: '#6b4a2f' }, { vignette: 0.24, grain: 0.1 }, studDef],
]

const manifest = []
for (const [name, scene, w, h, seed, opts, fin, extra] of jobs) {
  const rnd = mulberry32(seed)
  const body = scenes[scene](w, h, rnd, opts)
  const out = svg(w, h, body, seed % 90, extra, fin)
  writeFileSync(join(OUT, `${name}.svg`), out)
  manifest.push({ name, w, h })
}

writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`generated ${manifest.length} images -> public/images`)
