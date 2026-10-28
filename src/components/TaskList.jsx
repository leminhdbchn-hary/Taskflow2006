import { useState } from 'react'
import emptyUrl from '../assets/taskflow-empty.webp'
import { PRIORITIES, deadlineInfo, shortDate } from '../lib/tasks.js'

function TaskItem({ task, onToggle, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task)
  const deadline = deadlineInfo(task)

  const save = () => {
    const name = draft.name.trim()
    if (name) onUpdate(task.id, { name, pri: draft.pri, dueTime: draft.dueTime, dueDate: draft.dueDate ?? '' })
    setEditing(false)
  }

  if (editing) {
    return (
      <li className={`task pri-${task.pri} editing`}>
        <input
          autoFocus
          className="name-input"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') setEditing(false)
          }}
          aria-label="Tên công việc"
        />
        <select value={draft.pri} onChange={(e) => setDraft({ ...draft, pri: e.target.value })} aria-label="Mức ưu tiên">
          {Object.entries(PRIORITIES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <input type="date" value={draft.dueDate ?? ''} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} aria-label="Ngày deadline" />
        <input type="time" value={draft.dueTime} onChange={(e) => setDraft({ ...draft, dueTime: e.target.value })} aria-label="Giờ hạn" />
        <button className="primary" onClick={save}>
          Lưu
        </button>
        <button className="ghost" onClick={() => setEditing(false)}>
          Hủy
        </button>
      </li>
    )
  }

  return (
    <li className={`task pri-${task.pri} ${task.done ? 'done' : ''}`}>
      <input
        type="checkbox"
        className="check"
        checked={task.done}
        onChange={() => onToggle(task)}
        aria-label={`Hoàn thành: ${task.name}`}
      />
      <div className="task-body">
        <div className="task-title">
          <span className="name">{task.name}</span>
          <span className={`chip chip-${task.pri}`}>{PRIORITIES[task.pri]}</span>
          {deadline && (
            <span className={`chip chip-dl-${deadline.tone}`} title={`Deadline ${task.dueDate.split('-').reverse().join('/')}`}>
              📅 {deadline.label}
            </span>
          )}
          {task.dueTime && <span className="chip chip-time">⏰ {task.dueTime}</span>}
          {task.carriedFrom && <span className="chip chip-carried">↪ từ {shortDate(task.carriedFrom)}</span>}
        </div>
        <input
          className="note"
          value={task.note}
          placeholder="Thêm ghi chú…"
          onChange={(e) => onUpdate(task.id, { note: e.target.value })}
          aria-label="Ghi chú"
        />
      </div>
      <div className="task-actions">
        <button className="icon" title="Sửa" aria-label="Sửa công việc" onClick={() => { setDraft(task); setEditing(true) }}>
          ✎
        </button>
        <button className="icon danger" title="Xóa" aria-label="Xóa công việc" onClick={() => onRemove(task)}>
          ✕
        </button>
      </div>
    </li>
  )
}

export default function TaskList({ tasks, ...handlers }) {
  if (tasks.length === 0) {
    return (
      <div className="state-card card is-empty">
        <img src={emptyUrl} alt="" width="160" height="133" />
        <div>
          <strong>Bắt đầu ngày mới bằng một việc nhỏ.</strong>
          <span>Nhập tên việc ở ô phía trên rồi nhấn Enter.</span>
        </div>
      </div>
    )
  }
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} {...handlers} />
      ))}
    </ul>
  )
}
