import { fullDate, shiftDay, shortDate, toKey, weekdayShort } from './tasks.js'

const parse = (key) => new Date(`${key}T00:00:00`)

export const PERIODS = { week: 'Tuần', month: 'Tháng', year: 'Năm' }

function isoWeek(key) {
  const d = parse(key)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const jan4 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d - jan4) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7)
}

export function periodRange(type, anchor) {
  const d = parse(anchor)
  if (type === 'week') {
    const start = shiftDay(anchor, -((d.getDay() + 6) % 7))
    return { start, end: shiftDay(start, 6) }
  }
  if (type === 'month') {
    return {
      start: toKey(new Date(d.getFullYear(), d.getMonth(), 1)),
      end: toKey(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
    }
  }
  return { start: `${d.getFullYear()}-01-01`, end: `${d.getFullYear()}-12-31` }
}

export function shiftPeriod(type, anchor, delta) {
  const d = parse(anchor)
  if (type === 'week') return shiftDay(anchor, 7 * delta)
  if (type === 'month') return toKey(new Date(d.getFullYear(), d.getMonth() + delta, 1))
  return toKey(new Date(d.getFullYear() + delta, 0, 1))
}

export function periodLabel(type, { start, end }) {
  if (type === 'week') return `Tuần ${isoWeek(start)} · ${shortDate(start)} – ${shortDate(end)}/${end.slice(0, 4)}`
  if (type === 'month') return `Tháng ${start.slice(5, 7)}/${start.slice(0, 4)}`
  return `Năm ${start.slice(0, 4)}`
}

export function tasksInRange(data, start, end) {
  return Object.entries(data)
    .filter(([key]) => key >= start && key <= end)
    .flatMap(([date, list]) => list.map((t) => ({ ...t, date })))
}

export function summarize(tasks) {
  const done = tasks.filter((t) => t.done).length
  const byPri = { high: 0, med: 0, low: 0 }
  for (const t of tasks) if (t.pri in byPri) byPri[t.pri]++
  return {
    total: tasks.length,
    done,
    open: tasks.length - done,
    rate: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    carried: tasks.filter((t) => t.carriedFrom).length,
    byPri,
  }
}

// Gom việc theo ngày (tuần/tháng) hoặc theo tháng (năm) cho biểu đồ cột.
export function buckets(data, type, { start, end }) {
  const out = []
  if (type === 'year') {
    for (let m = 1; m <= 12; m++) {
      const prefix = `${start.slice(0, 4)}-${String(m).padStart(2, '0')}`
      const s = summarize(tasksInRange(data, `${prefix}-01`, `${prefix}-31`))
      out.push({ label: `T${m}`, done: s.done, open: s.open, tip: `Tháng ${m}: ${s.done}/${s.total} xong` })
    }
    return out
  }
  for (let k = start; k <= end; k = shiftDay(k, 1)) {
    const s = summarize(data[k] ?? [])
    out.push({
      label: type === 'week' ? weekdayShort(k) : String(Number(k.slice(8))),
      done: s.done,
      open: s.open,
      tip: `${shortDate(k)}: ${s.done}/${s.total} xong`,
    })
  }
  return out
}

export function lastDaysBuckets(data, endKey, n) {
  return buckets(data, 'month', { start: shiftDay(endKey, -(n - 1)), end: endKey }).map((b, i) => ({
    ...b,
    label: shortDate(shiftDay(endKey, -(n - 1) + i)),
  }))
}

// Các việc chưa xong ở những ngày trước `day`, kèm số ngày tồn.
export function overdueTasks(data, day) {
  return Object.entries(data)
    .filter(([key]) => key < day)
    .flatMap(([date, list]) => list.filter((t) => !t.done).map((t) => ({ ...t, date })))
    .map((t) => ({ ...t, age: Math.round((parse(day) - parse(t.date)) / 86400000) }))
    .sort((a, b) => b.age - a.age)
}

const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim()

export function topRecurring(tasks, n) {
  const map = new Map()
  for (const t of tasks) {
    const key = normalize(t.name)
    const entry = map.get(key) ?? { name: t.name, count: 0 }
    entry.count++
    map.set(key, entry)
  }
  return [...map.values()].filter((e) => e.count > 1).sort((a, b) => b.count - a.count).slice(0, n)
}

export function reportText(type, range, tasks) {
  const s = summarize(tasks)
  const lines = [
    `BÁO CÁO ${periodLabel(type, range).toUpperCase()}`,
    `Tổng: ${s.total} việc · Hoàn thành: ${s.done} (${s.rate}%) · Chưa xong: ${s.open}`,
    '',
  ]
  const groups = (list) =>
    Object.entries(Object.groupBy(list, (t) => t.date)).sort(([a], [b]) => a.localeCompare(b))
  const done = tasks.filter((t) => t.done)
  const open = tasks.filter((t) => !t.done)
  if (done.length) {
    lines.push('I. Công việc đã hoàn thành')
    for (const [date, list] of groups(done)) {
      lines.push(`- ${shortDate(date)}:`)
      for (const t of list) lines.push(`  • ${t.name}${t.dueDate ? ` [hạn ${fullDate(t.dueDate)}]` : ''}${t.note ? ` (${t.note})` : ''}`)
    }
    lines.push('')
  }
  if (open.length) {
    lines.push('II. Công việc chưa hoàn thành')
    for (const [date, list] of groups(open)) {
      lines.push(`- ${shortDate(date)}:`)
      for (const t of list) lines.push(`  • ${t.name}${t.dueDate ? ` [hạn ${fullDate(t.dueDate)}]` : ''}${t.note ? ` (${t.note})` : ''}`)
    }
  }
  return lines.join('\n').trim()
}
