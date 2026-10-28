const STORAGE_KEY = 'taskflow.data'

export const PRIORITIES = {
  high: 'Cao',
  med: 'Trung bình',
  low: 'Thấp',
}
const PRI_ORDER = { high: 0, med: 1, low: 2 }

export function toKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function shiftDay(key, delta) {
  const date = new Date(`${key}T00:00:00`)
  date.setDate(date.getDate() + delta)
  return toKey(date)
}

export function formatDay(key) {
  return new Date(`${key}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Dữ liệu có dạng { "YYYY-MM-DD": [task, ...] }. Lần đầu dùng sẽ trống; nhập bản sao lưu bằng nút "Nhập JSON".
export function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // dữ liệu hỏng: bắt đầu lại từ trống
  }
  return {}
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function sortTasks(tasks) {
  return [...tasks].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      PRI_ORDER[a.pri] - PRI_ORDER[b.pri] ||
      (a.dueTime || '99:99').localeCompare(b.dueTime || '99:99'),
  )
}

export function newTask({ name, pri = 'med', dueTime = '', note = '' }) {
  return { id: Date.now(), name, pri, done: false, status: 'todo', dueTime, note, carriedFrom: null }
}

// Các việc chưa xong ở những ngày trước `day`.
export function findOverdue(data, day) {
  return Object.entries(data)
    .filter(([key]) => key < day)
    .flatMap(([key, tasks]) => tasks.filter((t) => !t.done).map((t) => ({ ...t, from: key })))
}

export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `taskflow-backup-${toKey(new Date())}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function isValidBackup(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).every((tasks) => Array.isArray(tasks))
  )
}
