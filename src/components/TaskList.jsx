import { PRIORITIES } from '../lib/tasks.js'

export default function TaskList({ tasks, onToggle, onUpdate, onRemove }) {
  if (tasks.length === 0) return <p className="empty">Chưa có công việc nào trong ngày này.</p>

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={task.done ? 'done' : ''}>
          <div className="row">
            <label>
              <input type="checkbox" checked={task.done} onChange={() => onToggle(task)} />
              <span className="name">{task.name}</span>
            </label>
            <span className={`pri pri-${task.pri}`}>{PRIORITIES[task.pri]}</span>
            {task.dueTime && <span className="due">⏰ {task.dueTime}</span>}
            <button className="icon" aria-label="Xóa" onClick={() => onRemove(task.id)}>
              ✕
            </button>
          </div>
          {task.carriedFrom && <small className="carried">Chuyển từ {task.carriedFrom}</small>}
          <input
            className="note"
            value={task.note}
            placeholder="Ghi chú..."
            onChange={(e) => onUpdate(task.id, { note: e.target.value })}
          />
        </li>
      ))}
    </ul>
  )
}
