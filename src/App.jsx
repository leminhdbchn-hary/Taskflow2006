import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TodayView from './views/TodayView.jsx'
import DashboardView from './views/DashboardView.jsx'
import ReportView from './views/ReportView.jsx'
import { exportData, isValidBackup, loadData, newTask, saveData, todayKey } from './lib/tasks.js'
import { overdueTasks } from './lib/stats.js'

const VIEWS = ['today', 'dashboard', 'report']
const readView = () => {
  const id = location.hash.replace('#/', '')
  return VIEWS.includes(id) ? id : 'today'
}
const readTheme = () => {
  try {
    return localStorage.getItem('taskflow.theme')
  } catch {
    return null
  }
}

export default function App() {
  const [data, setData] = useState(loadData)
  const [day, setDay] = useState(todayKey)
  const [view, setView] = useState(readView)
  const [theme, setTheme] = useState(() => readTheme() ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const [toast, setToast] = useState(null)

  useEffect(() => saveData(data), [data])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('taskflow.theme', theme)
    } catch {
      // bỏ qua nếu trình duyệt chặn lưu trữ
    }
  }, [theme])
  useEffect(() => {
    const onHash = () => setView(readView())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(timer)
  }, [toast])

  const goView = (id) => {
    location.hash = `#/${id}`
    setView(id)
  }
  const openDay = (key) => {
    setDay(key)
    goView('today')
  }

  const updateDay = (key, fn) => setData((prev) => ({ ...prev, [key]: fn(prev[key] ?? []) }))

  const actions = {
    add: (fields) => updateDay(day, (list) => [...list, newTask(fields)]),
    update: (id, patch) => updateDay(day, (list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    toggle: (task) => actions.update(task.id, { done: !task.done, status: task.done ? 'todo' : 'done' }),
    remove: (task) => {
      updateDay(day, (list) => list.filter((t) => t.id !== task.id))
      setToast({ text: `Đã xóa “${task.name}”`, undo: () => updateDay(day, (list) => [...list, task]) })
    },
    // Chuyển các việc chưa xong từ ngày cũ sang ngày đang xem.
    carryOver: () =>
      setData((prev) => {
        const moved = overdueTasks(prev, day)
        const next = { ...prev }
        for (const { date, age: _age, ...task } of moved) {
          next[date] = next[date].filter((t) => t.id !== task.id)
          next[day] = [...(next[day] ?? []), { ...task, carriedFrom: task.carriedFrom ?? date }]
        }
        return next
      }),
  }

  const importFile = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      if (!isValidBackup(parsed)) throw new Error('invalid')
      if (confirm('Dữ liệu hiện tại sẽ bị thay bằng file sao lưu. Tiếp tục?')) setData(parsed)
    } catch {
      alert('File sao lưu không hợp lệ.')
    }
  }

  return (
    <div className="shell">
      <Sidebar
        view={view}
        onView={goView}
        onExport={() => exportData(data)}
        onImport={importFile}
        theme={theme}
        onTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      <main className="content">
        {view === 'today' && <TodayView data={data} day={day} onDay={setDay} actions={actions} />}
        {view === 'dashboard' && <DashboardView data={data} onDay={openDay} />}
        {view === 'report' && <ReportView data={data} />}
      </main>
      {toast && (
        <div className="toast" role="status">
          {toast.text}
          <button
            onClick={() => {
              toast.undo()
              setToast(null)
            }}
          >
            Hoàn tác
          </button>
        </div>
      )}
    </div>
  )
}
