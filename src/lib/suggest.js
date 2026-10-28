// Gợi ý khi gõ tên việc: lấy từ các việc đã làm, ưu tiên việc hay lặp lại; không phân biệt dấu/hoa thường.

export const fold = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

// Gom các việc cùng tên (theo `fold`): số lần, cách viết và mức ưu tiên gần nhất.
export function buildIndex(data) {
  const map = new Map()
  for (const [date, list] of Object.entries(data)) {
    for (const task of list) {
      const key = fold(task.name ?? '')
      if (!key) continue
      const entry = map.get(key)
      if (!entry) map.set(key, { key, name: task.name, count: 1, pri: task.pri, last: date })
      else {
        entry.count++
        if (date >= entry.last) Object.assign(entry, { name: task.name, pri: task.pri, last: date })
      }
    }
  }
  return [...map.values()]
}

const byFrequency = (a, b) => b.count - a.count || b.last.localeCompare(a.last)

export function suggest(index, query, limit = 6) {
  const q = fold(query)
  if (!q) return index.filter((e) => e.count > 1).sort(byFrequency).slice(0, limit)
  const scored = []
  for (const entry of index) {
    if (entry.key === q) continue // đã gõ đúng hệt
    const score = entry.key.startsWith(q) ? 0 : entry.key.split(' ').some((w) => w.startsWith(q)) ? 1 : entry.key.includes(q) ? 2 : -1
    if (score >= 0) scored.push([score, entry])
  }
  return scored
    .sort((a, b) => a[0] - b[0] || byFrequency(a[1], b[1]))
    .slice(0, limit)
    .map(([, entry]) => entry)
}
