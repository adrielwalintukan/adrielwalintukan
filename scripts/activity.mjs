const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Calendar markup is shared by the daily renderer and its offline checks.
export function renderCalendar(weeks) {
  if (!weeks.length) return '<text class="s" y="50" font-size="18" fill="#4a5565">No contribution data available</text>'
  const colors = ['#dce3e6', '#b3d4d5', '#75b1b5', '#1b7a80', '#0b5157']
  const max = Math.max(1, ...weeks.flatMap((week) => week.contributionDays.map((day) => day.contributionCount)))
  const pitch = 1108 / Math.max(53, weeks.length)
  let previousMonth = -1
  return weeks.map((week, index) => {
    const first = week.contributionDays[0]
    const date = new Date(first?.date)
    const month = date.getUTCMonth()
    let label = ''
    if (Number.isFinite(month) && month !== previousMonth && index < weeks.length - 2) {
      label = `<text class="m" x="${(index * pitch).toFixed(2)}" y="-14" font-size="10" fill="#4a5565">${date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}</text>`
      previousMonth = month
    }
    return label + week.contributionDays.map((day) => {
      const level = day.contributionCount ? Math.max(1, Math.ceil(day.contributionCount / max * 4)) : 0
      return `<rect class="day" data-weekday="${day.weekday}" x="${(index * pitch).toFixed(2)}" y="${day.weekday * 20}" width="${(pitch - 4).toFixed(2)}" height="16" rx="3" fill="${colors[level]}"><title>${escape(day.date)}: ${day.contributionCount} contributions</title></rect>`
    }).join('')
  }).join('\n')
}
