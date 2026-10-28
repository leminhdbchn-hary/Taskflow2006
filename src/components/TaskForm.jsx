import { useRef, useState } from 'react'
import { PRIORITIES } from '../lib/tasks.js'

export default function TaskForm({ onAdd }) {
  const [name, setName] = useState('')
  const [pri, setPri] = useState('med')
  const [dueTime, setDueTime] = useState('')
  const nameInput = useRef(null)

  const submit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, pri, dueTime })
    setName('')
    setDueTime('')
    nameInput.current.focus()
  }

  return (
    <form className="task-form card" onSubmit={submit}>
      <input
        ref={nameInput}
        className="name-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Thêm công việc mới rồi nhấn Enter…"
        aria-label="Tên công việc"
      />
      <select value={pri} onChange={(e) => setPri(e.target.value)} aria-label="Mức ưu tiên">
        {Object.entries(PRIORITIES).map(([key, label]) => (
          <option key={key} value={key}>
            Ưu tiên: {label}
          </option>
        ))}
      </select>
      <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} aria-label="Giờ hạn" />
      <button type="submit" className="primary" disabled={!name.trim()}>
        Thêm
      </button>
    </form>
  )
}
