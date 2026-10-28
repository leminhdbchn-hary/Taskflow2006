import { useEffect, useRef, useState } from 'react'
import DateBar from './components/DateBar.jsx'
import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'
import {
  exportData,
  findOverdue,
  isValidBackup,
  loadData,
  newTask,
  saveData,
  sortTasks,
  toKey,
} from './lib/tasks.js'

export default function App() {
  const [data, setData] = useState(loadData)
  const [day, setDay] = useState(() => toKey(new Date()))
  const fileInput = useRef(null)

  useEffect(() => {
    saveData(data)
  }, [data])

  const tasks = data[day] ?? []
  const overdue = findOverdue(data, day)
  const doneCount = tasks.filter((t) => t.done).length

  const updateDay = (key, fn) => setData((prev) => ({ ...prev, [key]: fn(prev[key] ?? []) }))

  const addTask = (fields) => updateDay(day, (list) => [...list, newTask(fields)])
  const updateTask = (id, patch) =>
    updateDay(day, (list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  const toggleTask = (task) =>
    updateTask(task.id, { done: !task.done, status: task.done ? 'todo' : 'done' })
  const removeTask = (id) => updateDay(day, (list) => list.filter((t) => t.id !== id))

  // Chuyển các việc chưa xong từ ngày cũ sang ngày đang xem.
  const carryOver = () =>
    setData((prev) => {
      const next = { ...prev }
      const moved = []
      for (const { from, ...task } of overdue) {
        next[from] = next[from].filter((t) => t.id !== task.id)
        moved.push({ ...task, carriedFrom: from })
      }
      next[day] = [...(next[day] ?? []), ...moved]
      return next
    })

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
    <main className="app">
      <header className="top">
        <h1>Taskflow</h1>
        <div className="actions">
          <button className="ghost" onClick={() => exportData(data)}>
            Xuất JSON
          </button>
          <button className="ghost" onClick={() => fileInput.current.click()}>
            Nhập JSON
          </button>
          <input ref={fileInput} type="file" accept="application/json" hidden onChange={importFile} />
        </div>
      </header>

      <DateBar day={day} onChange={setDay} />
      <p className="summary">
        {doneCount}/{tasks.length} việc hoàn thành
      </p>

      {overdue.length > 0 && (
        <div className="overdue">
          <span>{overdue.length} việc chưa xong từ các ngày trước.</span>
          <button onClick={carryOver}>Chuyển sang ngày này</button>
        </div>
      )}

      <TaskForm onAdd={addTask} />
      <TaskList
        tasks={sortTasks(tasks)}
        onToggle={toggleTask}
        onUpdate={updateTask}
        onRemove={removeTask}
      />
    </main>
  )
}
