import test from 'node:test'
import assert from 'node:assert/strict'

// Losing a day, inventing activity, or overflowing a long year breaks the dashboard.
const render = async (weeks) => {
  const { renderCalendar } = await import('./activity.mjs')
  return renderCalendar(weeks)
}

test('keeps actual daily counts, weekday positions and XML-safe date labels', async () => {
  const svg = await render([{ contributionDays: [
    { date: '2026-11-02', weekday: 1, contributionCount: 0 },
    { date: '2026-11-03', weekday: 2, contributionCount: 7 },
    { date: 'test<&', weekday: 6, contributionCount: 1 },
  ] }])
  assert.match(svg, /2026-11-02: 0 contributions/)
  assert.match(svg, /2026-11-03: 7 contributions/)
  assert.match(svg, /test&lt;&amp;: 1 contributions/)
  assert.equal((svg.match(/class="day"/g) || []).length, 3)
  assert.match(svg, /data-weekday="6"/)
})

test('empty data does not invent contribution cells', async () => {
  const svg = await render([])
  assert.doesNotMatch(svg, /class="day"|NaN|Infinity/)
  assert.match(svg, /No contribution data available/)
})

test('a 54-week calendar fits within the 1104px chart width', async () => {
  const svg = await render(Array.from({ length: 54 }, () => ({ contributionDays: [
    { date: '2026-11-01', weekday: 0, contributionCount: 3 },
  ] })))
  const cells = [...svg.matchAll(/<rect class="day"[^>]*x="([\d.]+)"[^>]*width="([\d.]+)"/g)]
  assert.equal(cells.length, 54)
  for (const [, x, width] of cells) assert.ok(Number(x) + Number(width) <= 1104.01)
})
