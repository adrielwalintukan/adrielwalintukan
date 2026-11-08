// Rebuild the hero using embedded fonts and the portfolio's ASCII head poses.
import fs from 'node:fs'
import { renderPortrait } from './portrait.mjs'

const fonts = fs.readFileSync(new URL('../assets/fonts.css', import.meta.url), 'utf8')
const portrait = renderPortrait(JSON.parse(fs.readFileSync(new URL('../assets/portrait-frames.json', import.meta.url), 'utf8')))
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
<title>Adriel Walintukan | Web, mobile and AI developer based in Manado, Indonesia</title>
<desc>An animated ASCII portrait turns from side to side. Information Systems student building AI-powered web and mobile products with clean architecture. Open the portfolio to explore the work.</desc>
<style>${fonts}
.d{font-family:'Big Shoulders Display','Arial Narrow',sans-serif;font-weight:900;text-transform:uppercase}
.s{font-family:Geist,Arial,sans-serif;font-weight:500}
.m{font-family:'JetBrains Mono',monospace;font-weight:500;letter-spacing:.12em;text-transform:uppercase}
.roles{animation:roles 15s ease-in-out infinite}
.intro{animation:reveal 1.1s ease both}
@keyframes roles{0%,22%{transform:translateY(0)}28%,49%{transform:translateY(-42px)}55%,76%{transform:translateY(-84px)}82%,94%{transform:translateY(-126px)}100%{transform:translateY(0)}}
@keyframes reveal{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){.roles,.intro{animation:none}}
</style>
<defs>
 <clipPath id="frame"><rect width="1200" height="700" rx="22"/></clipPath>
 <clipPath id="role-window"><rect x="682" y="436" width="450" height="34"/></clipPath>
 <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1" fill="#0b1226" opacity=".12"/></pattern>
 <radialGradient id="aura"><stop stop-color="#1b7a80" stop-opacity=".18"/><stop offset="1" stop-color="#1b7a80" stop-opacity="0"/></radialGradient>
</defs>
<g clip-path="url(#frame)">
 <rect width="1200" height="700" fill="#ccd2d6"/>
 <rect width="1200" height="700" fill="url(#dots)"/>
 <circle cx="270" cy="470" r="360" fill="url(#aura)"/>
 <text class="d" x="44" y="70" font-size="39" fill="#0b1226">AW.</text>
 <text class="m" x="623" y="46" font-size="10" fill="#4a5565">Based in</text>
 <text class="m" x="623" y="65" font-size="11" fill="#0b1226">Manado, Indonesia</text>
 <text class="m" x="865" y="46" font-size="10" fill="#4a5565">Local time</text>
 <text class="m" x="865" y="65" font-size="11" fill="#0b1226">WITA / UTC+8</text>
 <path d="M44 100H1156" stroke="#0b1226" stroke-opacity=".16"/>
 <circle cx="51" cy="143" r="4" fill="#1b7a80"/>
 <text class="m" x="66" y="147" font-size="11" fill="#0b1226">Build. Test. Ship.</text>
 ${portrait}
 <g class="intro" fill="#0b1226">
  <text class="d" x="1156" y="235" font-size="112" text-anchor="end">Adriel</text>
  <text class="d" x="1156" y="336" font-size="112" text-anchor="end">Walintukan</text>
  <text class="m" x="682" y="406" font-size="11" fill="#4a5565">What I do</text>
  <circle cx="660" cy="451" r="4" fill="#1b7a80"/>
  <g clip-path="url(#role-window)"><g class="roles s" font-size="25" fill="#1b7a80">
   <text x="682" y="462">AI integration</text>
   <text x="682" y="504">Web development</text>
   <text x="682" y="546">Mobile development</text>
   <text x="682" y="588">Software testing</text>
  </g></g>
  <text class="s" x="682" y="514" font-size="19">Information Systems student building</text>
  <text class="s" x="682" y="543" font-size="19">AI-powered web &amp; mobile products.</text>
  <text class="m" x="682" y="584" font-size="10" fill="#4a5565">Clean architecture. Thoughtful interfaces.</text>
  <rect x="682" y="616" width="474" height="49" rx="11" fill="#0b1226"/>
  <text class="d" x="704" y="648" font-size="23" fill="#f8fafb">Explore my portfolio</text>
  <rect x="1109" y="625" width="33" height="31" rx="7" fill="#1b7a80"/>
  <path d="M1119 646L1132 633M1122 633H1132V643" fill="none" stroke="#f8fafb" stroke-width="2"/>
 </g>
</g>
</svg>`
fs.writeFileSync(new URL('../assets/hero-ascii.svg', import.meta.url), svg)
console.log('Updated assets/hero-ascii.svg')
