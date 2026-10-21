// Renders assets/stats.svg (GitHub activity) in the portfolio's style: numbers and
// top languages. Run by .github/workflows/stats.yml every day.
// usage: GITHUB_TOKEN=... node scripts/stats.mjs [login]
import fs from 'node:fs'

const LOGIN = process.argv[2] || 'adrielwalintukan'
// repos that are not my own work (copied/imported projects) stay out of every number
const EXCLUDE = new Set(['hexstrike-ai'])
const TOKEN = process.env.GITHUB_TOKEN
if (!TOKEN) throw new Error('GITHUB_TOKEN is required')

const C = { ink: '#07080a', paper: '#f2efea', red: '#ff3344', surface: '#17181c', border: '#222328', muted: '#a3a3a3', subtle: '#7a7a7a' }

const query = `query($login: String!) {
  user(login: $login) {
    followers { totalCount }
    pullRequests { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100) {
      totalCount
      nodes { name stargazerCount languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name } } } }
    }
    contributionsCollection {
      totalCommitContributions
      contributionCalendar { totalContributions }
    }
  }
}`
const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': LOGIN },
  body: JSON.stringify({ query, variables: { login: LOGIN } }),
})
const { data, errors } = await res.json()
if (errors || !data?.user) throw new Error(`GitHub API: ${JSON.stringify(errors ?? res.status)}`)
const u = data.user
const cal = u.contributionsCollection.contributionCalendar

const repos = u.repositories.nodes.filter((r) => !EXCLUDE.has(r.name))
const stars = repos.reduce((n, r) => n + r.stargazerCount, 0)
const bytes = {}
for (const r of repos) for (const e of r.languages.edges) bytes[e.node.name] = (bytes[e.node.name] ?? 0) + e.size
const total = Object.values(bytes).reduce((a, b) => a + b, 0) || 1
const ranked = Object.entries(bytes).sort((a, b) => b[1] - a[1])
const langs = ranked.slice(0, 5).map(([name, b]) => ({ name, pct: (b / total) * 100 }))
const rest = 100 - langs.reduce((a, l) => a + l.pct, 0)
if (rest > 0.5) langs.push({ name: 'Other', pct: rest })

// ---- fonts (Google Fonts subset, embedded: README images can't load external files) ----
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
const GLYPHS = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') + '·'
async function font(family, weight) {
  const q = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(GLYPHS)}`
  const css = await (await fetch(q, { headers: { 'User-Agent': UA } })).text()
  const url = css.match(/url\((https:[^)]+)\)/)?.[1]
  if (!url) throw new Error(`no font url for ${family} ${weight}`)
  const b64 = Buffer.from(await (await fetch(url)).arrayBuffer()).toString('base64')
  return `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format('woff2')}`
}
const fonts = (await Promise.all([font('Big Shoulders Display', 900), font('Geist', 500), font('JetBrains Mono', 500)])).join('')

// ---- layout ----
const W = 1200, X = 48, IW = W - 2 * X
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const fmt = (n) => n.toLocaleString('en-US')

const numbers = [
  ['Contributions', cal.totalContributions, '12 mo'],
  ['Commits', u.contributionsCollection.totalCommitContributions, '12 mo'],
  ['Pull requests', u.pullRequests.totalCount, 'all time'],
  ['Public repos', repos.length, 'no forks'],
  ['Stars earned', stars, 'all repos'],
]
const cellW = (IW - 4 * 24) / 5
const numY = 150
const numberCells = numbers
  .map(([label, value, note], i) => {
    const x = X + i * (cellW + 24)
    return `<g class="fade" style="animation-delay:${0.1 + i * 0.08}s">
  <rect x="${x}" y="${numY}" width="${cellW}" height="124" rx="14" fill="${C.surface}" stroke="${C.border}"/>
  <text class="m" x="${x + 22}" y="${numY + 32}" font-size="10.5" fill="${C.red}">0${i + 1}</text>
  <text class="d" x="${x + 22}" y="${numY + 86}" font-size="54" fill="${C.paper}">${fmt(value)}</text>
  <text class="s" x="${x + 22}" y="${numY + 108}" font-size="13" fill="${C.muted}">${esc(label)} <tspan fill="${C.subtle}">· ${note}</tspan></text>
</g>`
  })
  .join('\n')

// languages: one stacked bar + legend
const SHADES = [C.red, '#ff8a94', C.paper, C.muted, '#55524d', '#34353b']
const langY = numY + 124 + 82
let acc = 0
const bar = langs
  .map((l, i) => {
    const w = (l.pct / 100) * IW
    const r = `<rect x="${(X + acc).toFixed(1)}" y="${langY}" width="${Math.max(w - 3, 1).toFixed(1)}" height="14" rx="3" fill="${SHADES[i]}"/>`
    acc += w
    return r
  })
  .join('')
// legend items laid out by estimated text width (Geist 14px ≈ 7.6px per char)
let lx = X
const legend = langs
  .map(
    (l, i) => `<g transform="translate(${((lx += i ? (langs[i - 1].name.length + 6) * 7.6 + 40 : 0)).toFixed(1)} ${langY + 48})">
  <rect y="-10" width="10" height="10" rx="2" fill="${SHADES[i]}"/>
  <text class="s" x="18" font-size="14" fill="${C.paper}">${esc(l.name)} <tspan fill="${C.subtle}">${l.pct.toFixed(1)}%</tspan></text>
</g>`
  )
  .join('\n')

const H = Math.round(langY + 92)
const updated = new Date().toISOString().slice(0, 10)

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<title>GitHub activity: ${fmt(cal.totalContributions)} contributions in the last 12 months, ${fmt(repos.length)} public repos, top language ${esc(langs[0]?.name ?? 'n/a')}</title>
<style>${fonts}
.d{font-family:'Big Shoulders Display';font-weight:900;text-transform:uppercase}
.s{font-family:Geist;font-weight:500}
.m{font-family:'JetBrains Mono';font-weight:500;text-transform:uppercase;letter-spacing:.12em}
.fade{animation:fade .8s ease both}
@keyframes fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.fade{animation:none}}</style>
<rect width="${W}" height="${H}" rx="18" fill="${C.ink}"/>
<text class="m" x="${X}" y="62" font-size="11" fill="${C.red}">GitHub</text>
<text class="d" x="${X}" y="118" font-size="56" fill="${C.paper}">Activity <tspan fill="${C.subtle}">&amp; stats</tspan></text>
<text class="m" x="${W - X}" y="62" font-size="10.5" text-anchor="end" fill="${C.subtle}">Updated ${updated}</text>
${numberCells}
<text class="m" x="${X}" y="${langY - 18}" font-size="10.5" fill="${C.subtle}">Top languages <tspan fill="${C.border}">·</tspan> public repos, by code size</text>
<g class="fade" style="animation-delay:.7s">${bar}
${legend}</g>
</svg>`

fs.mkdirSync('assets', { recursive: true })
fs.writeFileSync('assets/stats.svg', svg)
console.log(`assets/stats.svg ${Math.round(svg.length / 1024)} KB · ${cal.totalContributions} contributions · ${langs.map((l) => l.name).join(', ')}`)
