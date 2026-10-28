import { useState } from 'react'
import { PRIORITIES } from '../lib/tasks.js'

export default function TaskForm({ onAdd }) {
  const [name, setName] = useState('')
  const [pri, setPri] = useState('med')
  const [dueTime, setDueTime] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, pri, dueTime })
    setName('')
    setDueTime('')
  }

  return (
    <form className="task-form" onSubmit={submit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Thêm công việc mới..." />
      <select value={pri} onChange={(e) => setPri(e.target.value)} aria-label="Mức ưu tiên">
        {Object.entries(PRIORITIES).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} aria-label="Giờ hạn" />
      <button type="submit">Thêm</button>
    </form>
  )
}
