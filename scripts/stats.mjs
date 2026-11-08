// Renders assets/stats.svg (GitHub activity) in the portfolio's style: numbers and
// top languages. Run by .github/workflows/stats.yml every day.
// usage: GITHUB_TOKEN=... node scripts/stats.mjs [login]
import fs from 'node:fs'
import { renderCalendar } from './activity.mjs'

const LOGIN = process.argv[2] || 'adrielwalintukan'
// repos that are not my own work (copied/imported projects) stay out of every number
const EXCLUDE = new Set(['hexstrike-ai'])
const TOKEN = process.env.GITHUB_TOKEN
const snapshotIndex = process.argv.indexOf('--from-json')
if (!TOKEN && snapshotIndex === -1) throw new Error('GITHUB_TOKEN is required')

const C = { ink: '#eef2f3', paper: '#0b1226', red: '#1b7a80', surface: '#ffffff', border: '#b9c1c7', muted: '#4a5565', subtle: '#77828f' }

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
      contributionCalendar { totalContributions weeks { contributionDays { date weekday contributionCount } } }
    }
  }
}`
const res = snapshotIndex === -1 ? await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': LOGIN },
  body: JSON.stringify({ query, variables: { login: LOGIN } }),
}) : null
const { data, errors } = res ? await res.json() : JSON.parse(fs.readFileSync(process.argv[snapshotIndex + 1], 'utf8'))
if (errors || !data?.user) throw new Error(`GitHub API: ${JSON.stringify(errors ?? res?.status)}`)
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

// Embed the checked-in subset fonts: image-mode SVG cannot fetch web fonts.
const fonts = fs.readFileSync(new URL('../assets/fonts.css', import.meta.url), 'utf8')

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
const SHADES = [C.red, '#75b1b5', C.paper, C.muted, '#9aa8ad', '#c4cacf']
const langY = 562
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
.day{animation:fade 1.3s ease both}
.scan{animation:scan 9s ease-in-out infinite}
@keyframes scan{0%,15%{transform:translateX(-150px);opacity:0}25%{opacity:.2}80%{opacity:.2}95%,100%{transform:translateX(1200px);opacity:0}}
@keyframes fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.fade,.day,.scan{animation:none}.scan{display:none}}</style>
<rect width="${W}" height="${H}" rx="18" fill="${C.ink}"/>
<text class="m" x="${X}" y="62" font-size="11" fill="${C.red}">GitHub</text>
<text class="d" x="${X}" y="118" font-size="56" fill="${C.paper}">Activity <tspan fill="${C.subtle}">&amp; stats</tspan></text>
<text class="m" x="${W - X}" y="62" font-size="10.5" text-anchor="end" fill="${C.subtle}">Updated ${updated}</text>
${numberCells}
<text class="m" x="${X}" y="316" font-size="11" fill="${C.red}">A year of building</text>
<text class="m" x="${W - X}" y="316" font-size="10" text-anchor="end" fill="${C.muted}">Actual daily contributions</text>
<g transform="translate(${X} 356)">${renderCalendar(cal.weeks ?? [])}</g>
<clipPath id="calendar-window"><rect x="${X}" y="352" width="${IW}" height="144" rx="4"/></clipPath>
<g clip-path="url(#calendar-window)"><rect class="scan" x="0" y="352" width="120" height="144" fill="${C.red}" opacity=".1"/></g>
<text class="m" x="${X}" y="${langY - 18}" font-size="10.5" fill="${C.subtle}">Top languages <tspan fill="${C.border}">·</tspan> public repos, by code size</text>
<g class="fade" style="animation-delay:.7s">${bar}
${legend}</g>
</svg>`

fs.mkdirSync('assets', { recursive: true })
fs.writeFileSync('assets/stats.svg', svg)
console.log(`assets/stats.svg ${Math.round(svg.length / 1024)} KB · ${cal.totalContributions} contributions · ${langs.map((l) => l.name).join(', ')}`)
