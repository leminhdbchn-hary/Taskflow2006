import { useCallback, useEffect, useMemo, useState } from 'react'
import { computeReminders } from './reminders.js'
import { showNotification, notifyPermission } from './notify.js'
import { toKey } from './tasks.js'

const SETTINGS_KEY = 'taskflow.reminders' // cài đặt theo từng thiết bị
const SEEN_KEY = 'taskflow.notified'
const TOAST_KEY = 'taskflow.toastday'
const DEFAULTS = { browser: false, lead: 2 }

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // bỏ qua nếu trình duyệt chặn lưu trữ
  }
}

// Tính danh sách nhắc việc và gửi thông báo trình duyệt (mỗi việc, mỗi loại, mỗi ngày một lần).
// Chỉ hoạt động khi trang đang mở, kể cả tab chạy nền.
export function useReminders({ data, notify }) {
  const [settings, setState] = useState(() => ({ ...DEFAULTS, ...read(SETTINGS_KEY, {}) }))
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const setSettings = useCallback((patch) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      write(SETTINGS_KEY, next)
      return next
    })
  }, [])

  const items = useMemo(() => computeReminders(data, now, settings.lead), [data, now, settings.lead])
  const urgent = items.filter((i) => i.rank <= 1).length

  useEffect(() => {
    const today = toKey(now)

    if (urgent > 0 && read(TOAST_KEY, '') !== today) {
      write(TOAST_KEY, today)
      notify(`Có ${urgent} việc cần chú ý hôm nay. Xem mục “Nhắc việc”.`)
    }

    if (!settings.browser || notifyPermission() !== 'granted') return
    const seen = Object.fromEntries(Object.entries(read(SEEN_KEY, {})).filter(([, day]) => day === today))
    const fresh = items.filter((i) => i.rank <= 2 && !seen[`${i.id}:${i.kind}`])
    if (!fresh.length) return
    for (const i of fresh) seen[`${i.id}:${i.kind}`] = today
    write(SEEN_KEY, seen)

    if (fresh.length > 3) {
      showNotification(`Taskflow: ${fresh.length} việc cần chú ý`, {
        body: fresh.slice(0, 3).map((i) => i.name).join(' · ') + '…',
        tag: 'taskflow-summary',
      })
    } else {
      for (const i of fresh) showNotification(i.name, { body: i.text, tag: `${i.id}:${i.kind}` })
    }
  }, [items, now, settings.browser, urgent, notify])

  return { settings, setSettings, items, urgent }
}
