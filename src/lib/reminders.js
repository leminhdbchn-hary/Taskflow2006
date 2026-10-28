import { daysBetween, fullDate, toKey } from './tasks.js'

// Sai lệch tối đa (điểm %) giữa tiến độ thực tế và kế hoạch trước khi coi là chậm.
const BEHIND_TOLERANCE = 20

const toMinutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

// Tiến độ kế hoạch: tuyến tính từ ngày bắt đầu (ngày gốc của việc) đến ngày deadline.
export function scheduleInfo(task, date, today) {
  if (task.done || !task.dueDate || typeof task.progress !== 'number') return null
  const start = task.carriedFrom ?? date
  const total = Math.max(1, daysBetween(start, task.dueDate))
  const elapsed = clamp(daysBetween(start, today), 0, total)
  const expected = Math.round((elapsed / total) * 100)
  const behind = total >= 2 && daysBetween(today, task.dueDate) >= 0 && task.progress + BEHIND_TOLERANCE < expected
  return { expected, elapsed, total, behind }
}

export const KIND_LABEL = {
  overdue: 'Quá hạn',
  late: 'Quá giờ',
  hour: 'Sắp đến giờ',
  today: 'Hôm nay',
  behind: 'Chậm tiến độ',
  soon: 'Sắp đến hạn',
}

// Danh sách việc cần nhắc, việc gấp nhất lên đầu. rank: 0 khẩn, 1 hôm nay/chậm, 2 sắp đến hạn.
export function computeReminders(data, now = new Date(), leadDays = 2) {
  const today = toKey(now)
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const out = []

  for (const [date, list] of Object.entries(data)) {
    for (const task of list) {
      if (task.done || !task.dueDate) continue
      const diff = daysBetween(today, task.dueDate)
      const base = { id: String(task.id), taskId: task.id, date, name: task.name, dueDate: task.dueDate, dueTime: task.dueTime ?? '', diff }

      if (diff < 0) {
        out.push({ ...base, kind: 'overdue', rank: 0, text: `Quá hạn ${-diff} ngày (hạn ${fullDate(task.dueDate)})` })
      } else if (diff === 0) {
        const m = task.dueTime ? toMinutes(task.dueTime) : null
        if (m !== null && m < minutesNow) out.push({ ...base, kind: 'late', rank: 0, text: `Đã quá giờ hạn ${task.dueTime} hôm nay` })
        else if (m !== null && m - minutesNow <= 60) out.push({ ...base, kind: 'hour', rank: 0, text: `Còn ${m - minutesNow} phút (hạn ${task.dueTime} hôm nay)` })
        else out.push({ ...base, kind: 'today', rank: 1, text: `Hạn hôm nay${m !== null ? ` lúc ${task.dueTime}` : ''} (${fullDate(task.dueDate)})` })
      } else if (diff <= leadDays) {
        out.push({ ...base, kind: 'soon', rank: 2, text: `Còn ${diff} ngày (hạn ${fullDate(task.dueDate)})` })
      }

      const sched = scheduleInfo(task, date, today)
      if (sched?.behind) {
        out.push({
          ...base,
          kind: 'behind',
          rank: 1,
          text: `Tiến độ ${task.progress}% thấp hơn kế hoạch ~${sched.expected}% (đã qua ${sched.elapsed}/${sched.total} ngày, hạn ${fullDate(task.dueDate)})`,
        })
      }
    }
  }
  return out.sort((a, b) => a.rank - b.rank || a.dueDate.localeCompare(b.dueDate))
}
