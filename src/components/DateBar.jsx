import { formatDay, shiftDay, toKey } from '../lib/tasks.js'

export default function DateBar({ day, onChange }) {
  return (
    <div className="date-bar">
      <button className="ghost" onClick={() => onChange(shiftDay(day, -1))} aria-label="Hôm trước">
        ‹
      </button>
      <div className="date-label">
        <strong>{formatDay(day)}</strong>
        <input type="date" value={day} onChange={(e) => e.target.value && onChange(e.target.value)} />
      </div>
      <button className="ghost" onClick={() => onChange(shiftDay(day, 1))} aria-label="Hôm sau">
        ›
      </button>
      <button className="ghost" onClick={() => onChange(toKey(new Date()))}>
        Hôm nay
      </button>
    </div>
  )
}
