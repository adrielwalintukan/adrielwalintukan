const escape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function renderPortrait({ columns, rows, frames }) {
  if (!frames?.length) throw new Error('At least one portrait frame is required')
  if (!Number.isInteger(columns) || columns < 1 || !Number.isInteger(rows) || rows < 1 ||
      frames.some(({ lines }) => lines.length !== rows || lines.some((line) => line.length !== columns))) {
    throw new Error('Portrait frame grid dimensions do not match')
  }
  const neutral = Math.floor(frames.length / 2)
  const forward = frames.map((_, index) => index)
  const cycle = frames.length === 1 ? [0] : [...forward, ...forward.slice(1, -1).reverse()]
  const sequence = [...cycle.slice(neutral), ...cycle.slice(0, neutral)]
  const keyframes = frames.map((_, pose) => `@keyframes ascii-pose-${pose}{${[...sequence, sequence[0]].map((active, step) => `${(step / sequence.length * 100).toFixed(3)}%{opacity:${active === pose ? 1 : 0}}`).join('')}}`).join('\n')
  const glyphs = frames.map(({ lines }, pose) => `<g class="ascii-pose${pose === neutral ? ' ascii-neutral' : ''}" style="animation-name:ascii-pose-${pose}">${lines.map((line, row) =>
    `<text class="ascii-glyph" x="79.5" y="${254 + row * 7.5}" textLength="486" lengthAdjust="spacingAndGlyphs" xml:space="preserve">${escape(line)}</text>`
  ).join('\n')}</g>`).join('\n')
  return `<style>
.ascii-glyph{font-family:'JetBrains Mono',monospace;font-weight:500;font-size:8.6px;white-space:pre;fill:#b5e1e3}
.ascii-pose{opacity:0;animation-duration:8s;animation-timing-function:linear;animation-iteration-count:infinite}
.ascii-neutral{opacity:1}
.ascii-scan{animation:ascii-scan 5s linear infinite}
@keyframes ascii-scan{0%{transform:translateY(-65px)}100%{transform:translateY(435px)}}
${keyframes}
@media(prefers-reduced-motion:reduce){.ascii-pose,.ascii-scan{animation:none}.ascii-pose{opacity:0}.ascii-neutral{opacity:1}.ascii-scan{display:none}}
</style>
<defs>
 <clipPath id="ascii-window"><rect x="40" y="244" width="565" height="416" rx="14"/></clipPath>
 <linearGradient id="ascii-highlight" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#58bac0" stop-opacity="0"/><stop offset=".5" stop-color="#58bac0" stop-opacity=".14"/><stop offset="1" stop-color="#58bac0" stop-opacity="0"/></linearGradient>
</defs>
<g aria-label="Animated ASCII portrait of Adriel, turning from side to side">
 <rect x="40" y="202" width="565" height="458" rx="18" fill="#0b1226"/>
 <circle cx="62" cy="224" r="3" fill="#58bac0"/>
 <text class="m" x="77" y="228" font-size="10" fill="#b5e1e3">Adriel / in motion</text>
 <path d="M58 243H587" stroke="#58bac0" stroke-opacity=".2"/>
 <g clip-path="url(#ascii-window)">${glyphs}
  <rect class="ascii-scan" x="40" y="244" width="565" height="65" fill="url(#ascii-highlight)"/>
 </g>
</g>`
}
