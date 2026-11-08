import test from 'node:test'
import assert from 'node:assert/strict'

test('ASCII rows preserve spacing and escape SVG text instead of embedding a bitmap', async () => {
  const { renderPortrait } = await import('./portrait.mjs')
  const svg = renderPortrait({ columns: 4, rows: 2, frames: [{ lines: [' @  ', '<&> '] }] })
  assert.match(svg, /> @  <\/text>/)
  assert.match(svg, />&lt;&amp;&gt; <\/text>/)
  assert.equal((svg.match(/class="ascii-glyph"/g) || []).length, 2)
  assert.doesNotMatch(svg, /<image\b|data:image/)
})

test('rejects incomplete frame grids so a turn cannot silently distort the face', async () => {
  const { renderPortrait } = await import('./portrait.mjs')
  assert.throws(() => renderPortrait({ columns: 4, rows: 2, frames: [{ lines: ['@@', '@@@@'] }] }), /grid/)
  assert.throws(() => renderPortrait({ columns: 4, rows: 2, frames: [] }), /frame/)
})
