#!/usr/bin/env node
// Generates every SVG in assets/ (dark + light variants).
// No dependencies:  node scripts/build.mjs
//
// GitHub renders these through <img>, so: no JavaScript, no external fonts,
// no external images. Everything is plain SVG + CSS keyframes, and every
// animation has a sensible resting state for prefers-reduced-motion.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets')
mkdirSync(OUT, { recursive: true })

const THEMES = {
  dark: {
    bg: '#0b0e13', panel: '#121821', line: '#263243', ink: '#e9edf2', mute: '#8491a3',
    signal: '#22f0c8', signal2: '#4aa3ff', warm: '#ffb454', violet: '#b79cff',
    dog: '#56647a', dogLight: '#f2f5f8', red: '#ff6b6b',
  },
  light: {
    bg: '#f7f5ef', panel: '#ffffff', line: '#d8d3c5', ink: '#14181e', mute: '#667085',
    signal: '#078f78', signal2: '#1f6fd0', warm: '#b86200', violet: '#6d4fc4',
    dog: '#1d232c', dogLight: '#aab4c2', red: '#d64545',
  },
}

const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`
const SANS = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`
const REDUCED = `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ---------------------------------------------------------------- pixel art
// '#' body, 'w' light patches, 'o' eye, 'p' parcel, 't' tongue
const DOG_BODY = [
  '..................##....',
  '.ww..............####...',
  'w##..............#####..',
  '###.............##o###w#',
  '.##.............######ww',
  '.###..############wwww..',
  '..################ww....',
  '..####ww#########www....',
  '..###wwww########ww.....',
  '..###############.......',
]
const DOG_LEGS_A = [
  '..##..##.....##..##.....',
  '.##....##...##....##....',
  '.w......w...w......w....',
]
const DOG_LEGS_B = [
  '...##.##.....##.##......',
  '....###.......###.......',
  '....ww........ww........',
]
const DOG_SLEEP = [
  '........................',
  '.....#########..........',
  '...#############...##...',
  '..################.####.',
  '.w###########ww####-###w',
  'ww.##########www#####www',
]

function pixels(rows, px, colors, ox = 0, oy = 0) {
  let out = ''
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const c = row[x]
      if (c === '.') { x++; continue }
      let n = 1
      while (row[x + n] === c) n++
      out += `<rect x="${ox + x * px}" y="${oy + y * px}" width="${n * px}" height="${px}" fill="${colors[c]}"/>`
      x += n
    }
  })
  return out
}

// --------------------------------------------------------------------- hero
function hero(t) {
  const W = 800, H = 404
  const dogColors = { '#': t.dog, w: t.dogLight, o: t.bg, t: t.red, '-': t.bg }
  const PX = 4, GROUND = 368
  const linkY = 226
  const links = [ [152, 248], [352, 470], [510, 622] ]
  const beat = [ [8, 30], [34, 56], [60, 82] ] // % of loop each packet travels
  const screens = [
    { x: 68, y: 196, w: 84, h: 56, at: 2 },
    { x: 248, y: 184, w: 104, h: 66, at: 30 },
    { x: 470, y: 186, w: 40, h: 80, at: 56 },
    { x: 622, y: 200, w: 116, h: 66, at: 82 },
  ]

  let css = `
text{font-family:${MONO}}
.title{font-family:${SANS};font-weight:700;letter-spacing:-.5px}
.flow{stroke-dasharray:3 6;animation:flow 1.2s linear infinite}
@keyframes flow{to{stroke-dashoffset:-18}}
.cursor{animation:cur 1s steps(1) infinite}@keyframes cur{50%{opacity:0}}
.blink{animation:blink 1.6s steps(1) infinite}
@keyframes blink{50%{opacity:.25}}
.dog{transform:translateX(352px);animation:run 18s linear infinite}
@keyframes run{from{transform:translateX(-120px)}to{transform:translateX(${W + 20}px)}}
.bob{animation:bob .32s steps(1) infinite}
@keyframes bob{50%{transform:translateY(-2px)}}
.fb{opacity:0;animation:fb .32s steps(1) infinite}
.fa{animation:fa .32s steps(1) infinite}
@keyframes fa{50%{opacity:0}}
@keyframes fb{50%{opacity:1}}
`
  links.forEach(([a, b], i) => {
    const len = b - a - 14, [s, e] = beat[i]
    css += `.p${i}{transform:translateX(${len / 2}px);animation:p${i} 9s linear infinite}
@keyframes p${i}{0%,${s}%{transform:translateX(0);opacity:0}${s + 1}%{opacity:1}${e - 1}%{opacity:1}${e}%,100%{transform:translateX(${len}px);opacity:0}}
`
  })
  screens.forEach((sc, i) => {
    const a = sc.at
    css += `.g${i}{opacity:0;animation:g${i} 9s linear infinite}
@keyframes g${i}{0%,${a}%{opacity:0}${a + 3}%{opacity:.34}${a + 12}%,100%{opacity:0}}
`
  })
  css += REDUCED

  const label = (x, s) => `<text x="${x}" y="292" font-size="12" fill="${t.mute}" text-anchor="middle">${s}</text>`
  const ext = (x, y, s) => `<text x="${x}" y="${y}" font-size="13" font-weight="700" fill="${t.signal}" text-anchor="middle">${s}</text>`
  const S = `fill="${t.panel}" stroke="${t.ink}" stroke-width="2"`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Yashas Raj S — one idea, every platform</title>
<desc id="d">Four connected devices — a Mac, a Windows monitor, an Android phone and a browser window — pass a build packet down the line while a small pixel dog named Fetch runs along underneath carrying a delivery.</desc>
<!-- you opened the SVG. respect. fetch says hi: woof :443 -->
<style>${css}</style>
<defs><clipPath id="c"><rect width="${W}" height="${H}" rx="16"/></clipPath>
<linearGradient id="grad" x1="0" x2="1"><stop offset="0" stop-color="${t.signal}"/><stop offset="1" stop-color="${t.signal2}"/></linearGradient></defs>
<g clip-path="url(#c)">
<rect width="${W}" height="${H}" fill="${t.bg}"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="16" fill="none" stroke="${t.line}"/>

<circle class="blink" cx="44" cy="35" r="4" fill="${t.signal}"/>
<text x="56" y="39" font-size="12" fill="${t.mute}">mesh online · 4 nodes · 0 packets lost</text>
<text x="${W - 40}" y="39" font-size="12" fill="${t.mute}" text-anchor="end">github.com/yashasraj615</text>

<text class="title" x="40" y="96" font-size="42" fill="${t.ink}">Yashas Raj S</text>
<rect x="42" y="110" width="64" height="4" rx="2" fill="url(#grad)"/>
<text x="${W - 54}" y="96" font-size="13" fill="${t.ink}" text-anchor="end"><tspan fill="${t.signal}" font-weight="700">$</tspan> ship idea.zip --everywhere</text>
<rect class="cursor" x="${W - 48}" y="84" width="8" height="15" fill="${t.ink}"/>
<text x="${W - 40}" y="118" font-size="12" fill="${t.mute}" text-anchor="end">building for 4 targets…</text>
<text x="40" y="142" font-size="15" fill="${t.mute}">one idea <tspan fill="${t.signal}">→</tspan> every platform</text>

${links.map(([a, b], i) => `<line class="flow" x1="${a + 2}" y1="${linkY}" x2="${b - 2}" y2="${linkY}" stroke="${t.mute}" stroke-width="1.5"/>
<g transform="translate(${a} ${linkY - 5})"><rect class="p${i}" width="14" height="10" rx="2.5" fill="${t.signal}"/></g>`).join('\n')}

<!-- macOS laptop -->
<rect x="68" y="196" width="84" height="56" rx="6" ${S}/>
<rect class="g0" x="69" y="197" width="82" height="54" rx="5" fill="${t.signal}"/>
<rect x="52" y="254" width="116" height="7" rx="3.5" fill="${t.ink}"/>
${ext(110, 229, '.dmg')}
${label(110, 'macOS')}

<!-- Windows monitor -->
<rect x="248" y="184" width="104" height="66" rx="4" ${S}/>
<rect class="g1" x="249" y="185" width="102" height="64" rx="3" fill="${t.signal}"/>
<rect x="294" y="251" width="12" height="9" fill="${t.ink}"/>
<rect x="274" y="259" width="52" height="4" rx="2" fill="${t.ink}"/>
${ext(300, 222, '.exe')}
${label(300, 'Windows')}

<!-- Android phone -->
<rect x="470" y="186" width="40" height="80" rx="8" ${S}/>
<rect class="g2" x="471" y="187" width="38" height="78" rx="7" fill="${t.signal}"/>
<circle cx="490" cy="195" r="2" fill="${t.ink}"/>
${ext(490, 231, '.apk')}
${label(490, 'Android')}

<!-- Browser window -->
<rect x="622" y="184" width="116" height="82" rx="6" ${S}/>
<rect class="g3" x="623" y="201" width="114" height="64" rx="4" fill="${t.signal}"/>
<line x1="622" y1="200" x2="738" y2="200" stroke="${t.ink}" stroke-width="2"/>
<circle cx="632" cy="192" r="2.2" fill="${t.red}"/><circle cx="640" cy="192" r="2.2" fill="${t.warm}"/><circle cx="648" cy="192" r="2.2" fill="${t.signal}"/>
<rect x="660" y="188.5" width="68" height="7" rx="3.5" fill="${t.line}"/>
${ext(680, 238, 'https://')}
${label(680, 'Web')}

<!-- Fetch's lane -->
<line x1="40" y1="${GROUND + 1}" x2="${W - 40}" y2="${GROUND + 1}" stroke="${t.line}" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>
<g class="dog"><g transform="translate(0 ${GROUND - 13 * PX})"><g class="bob">
${pixels(DOG_BODY, PX, dogColors)}
<g class="fa">${pixels(DOG_LEGS_A, PX, dogColors, 0, 10 * PX)}</g>
<g class="fb">${pixels(DOG_LEGS_B, PX, dogColors, 0, 10 * PX)}</g>
<rect x="${24 * PX}" y="${3 * PX}" width="17" height="13" rx="2.5" fill="${t.warm}"/><path d="M${24*PX+2} ${3*PX+3}l6.5 4.5l6.5 -4.5" fill="none" stroke="${t.bg}" stroke-width="1.5"/>
</g></g></g>
<text x="${W - 40}" y="392" font-size="11" fill="${t.mute}" text-anchor="end">fetch · packet courier · very good at his job</text>
</g>
</svg>`
}

// ----------------------------------------------------------------- terminal
function terminal(t) {
  const W = 680, CH = 8.4, X0 = 28, LH = 25, TOP = 74
  const script = [
    { prompt: 'yashas@mac ~ %', color: t.signal, cmd: 'whoami', out: ['Yashas Raj S. I turn ideas into apps you can install.'] },
    { prompt: 'PS C:\\Users\\yashas>', color: t.signal2, cmd: 'Get-Interests', out: ['cross-platform apps · device-to-device · local-first'] },
    { prompt: 'android:/ $', color: t.warm, cmd: 'getprop ro.builder.mode', out: ['shipping'] },
    { prompt: 'yashasraj.com ❯', color: t.violet, cmd: 'status --all', out: ['macOS ✓  Windows ✓  Android ✓  Web ✓   next idea: compiling…'] },
  ]
  const T = 22 // seconds per loop
  let css = `text{font-family:${MONO};font-size:14px}
.cur{animation:cur 1s steps(1) infinite}@keyframes cur{50%{opacity:0}}
`
  let body = '', y = TOP, time = 0.6, i = 0
  const pct = (s) => (s / T * 100).toFixed(2)
  for (const line of script) {
    const pw = line.prompt.length * CH, cx = X0 + pw + CH, cw = line.cmd.length * CH
    const start = time, typed = start + 0.35 + line.cmd.length * 0.075, shown = typed + 0.3
    css += `.l${i}{animation:l${i} ${T}s steps(1) infinite}@keyframes l${i}{0%{opacity:0}${pct(start)}%,100%{opacity:1}}
.k${i}{transform:scaleX(0);transform-origin:${cx + cw}px 0;animation:k${i} ${T}s linear infinite}
@keyframes k${i}{0%,${pct(start + 0.35)}%{transform:scaleX(1);animation-timing-function:steps(${line.cmd.length},end)}${pct(typed)}%,100%{transform:scaleX(0)}}
.o${i}{animation:o${i} ${T}s steps(1) infinite}@keyframes o${i}{0%{opacity:0}${pct(shown)}%,100%{opacity:1}}
`
    body += `<g class="l${i}"><text x="${X0}" y="${y}" fill="${line.color}" font-weight="700" textLength="${pw.toFixed(1)}" lengthAdjust="spacingAndGlyphs">${esc(line.prompt)}</text>
<text x="${cx.toFixed(1)}" y="${y}" fill="${t.ink}" textLength="${cw.toFixed(1)}" lengthAdjust="spacingAndGlyphs">${esc(line.cmd)}</text>
<rect class="k${i}" x="${cx.toFixed(1)}" y="${y - 15}" width="${(cw + 2).toFixed(1)}" height="21" fill="${t.panel}"/></g>\n`
    y += LH
    for (const o of line.out) {
      body += `<text class="o${i}" x="${X0}" y="${y}" fill="${t.mute}">${esc(o)}</text>\n`
      y += LH
    }
    y += 6
    time = shown + 1.1
    i++
  }
  // resting prompt + cursor
  css += `.end{animation:end ${T}s steps(1) infinite}@keyframes end{0%{opacity:0}${pct(time)}%,100%{opacity:1}}\n` + REDUCED
  body += `<g class="end"><text x="${X0}" y="${y}" fill="${t.signal}" font-weight="700" textLength="${(14 * CH).toFixed(1)}" lengthAdjust="spacingAndGlyphs">yashas@mac ~ %</text>
<rect class="cur" x="${X0 + 15 * CH}" y="${y - 14}" width="9" height="18" fill="${t.ink}"/></g>`
  const H = y + 26

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">A terminal that switches shells: zsh on macOS, PowerShell on Windows, adb shell on Android, and the web</title>
<desc id="d">whoami: Yashas Raj S, I turn ideas into apps you can install. Get-Interests: cross-platform apps, device-to-device, local-first. getprop ro.builder.mode: shipping. status --all: macOS, Windows, Android and Web all green; next idea compiling.</desc>
<style>${css}</style>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="${t.panel}" stroke="${t.line}"/>
<line x1="0" y1="40" x2="${W}" y2="40" stroke="${t.line}"/>
<circle cx="24" cy="20" r="5.5" fill="${t.red}"/><circle cx="43" cy="20" r="5.5" fill="${t.warm}"/><circle cx="62" cy="20" r="5.5" fill="${t.signal}"/>
<text x="${W / 2}" y="25" text-anchor="middle" fill="${t.mute}" style="font-size:12px">yashas — one terminal, every shell</text>
${body}
</svg>`
}

// ---------------------------------------------------------------- nav tiles
function tile(t, num, text, arrow) {
  const W = 190, H = 54
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(text)}">
<style>text{font-family:${MONO}}</style>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${t.panel}" stroke="${t.line}" stroke-width="1.5"/>
<text x="16" y="33" font-size="12" font-weight="700" fill="${t.signal}">${num}</text>
<text x="42" y="33" font-size="14" font-weight="700" fill="${t.ink}">${esc(text)}</text>
<text x="${W - 16}" y="33" font-size="14" fill="${t.mute}" text-anchor="end">${arrow}</text>
</svg>`
}

// ------------------------------------------------------------------- footer
function footer(t) {
  const W = 800, H = 100, PX = 4, GROUND = 71
  const css = `text{font-family:${MONO}}
.z{animation:z 3.2s ease-in-out infinite}.z2{animation-delay:1.06s}.z3{animation-delay:2.12s}
@keyframes z{0%{opacity:0;transform:translate(0,0)}30%{opacity:1}100%{opacity:0;transform:translate(10px,-18px)}}
.br{animation:br 3.2s ease-in-out infinite;transform-origin:48px 24px}
@keyframes br{50%{transform:scaleY(1.05)}}
${REDUCED}`
  const ox = W / 2 - 48, oy = GROUND - 6 * PX
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Fetch the pixel dog, asleep after a long day of deliveries.">
<style>${css}</style>
<line x1="40" y1="${GROUND + 1}" x2="${W - 40}" y2="${GROUND + 1}" stroke="${t.line}" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>
<g transform="translate(${ox} ${oy})"><g class="br">${pixels(DOG_SLEEP, PX, { '#': t.dog, w: t.dogLight, '-': t.dogLight })}</g></g>
<g fill="${t.mute}" font-weight="700">
<text class="z" x="${ox + 96}" y="${oy + 4}" font-size="11">z</text>
<text class="z z2" x="${ox + 105}" y="${oy - 5}" font-size="13">z</text>
<text class="z z3" x="${ox + 116}" y="${oy - 14}" font-size="15">Z</text>
</g>
<text x="${W / 2}" y="93" font-size="11" fill="${t.mute}" text-anchor="middle">all packets delivered. fetch is off the clock.</text>
</svg>`
}

// -------------------------------------------------------------------- write
const TILES = [
  ['projects', '01', 'projects', '↓'],
  ['platforms', '02', 'platforms', '↓'],
  ['portfolio', '03', 'portfolio', '↗'],
  ['repos', '04', 'all repos', '↗'],
]
for (const [name, t] of Object.entries(THEMES)) {
  writeFileSync(join(OUT, `hero-${name}.svg`), hero(t))
  writeFileSync(join(OUT, `terminal-${name}.svg`), terminal(t))
  writeFileSync(join(OUT, `footer-${name}.svg`), footer(t))
  for (const [id, num, text, arrow] of TILES) writeFileSync(join(OUT, `nav-${id}-${name}.svg`), tile(t, num, text, arrow))
}
console.log('assets written to', OUT)
