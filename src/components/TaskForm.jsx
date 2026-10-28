import { useId, useMemo, useRef, useState } from 'react'
import { PRIORITIES } from '../lib/tasks.js'
import { suggest } from '../lib/suggest.js'

export default function TaskForm({ onAdd, index }) {
  const [name, setName] = useState('')
  const [pri, setPri] = useState('med')
  const [dueTime, setDueTime] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const nameInput = useRef(null)
  const listId = useId()

  const items = useMemo(() => (open ? suggest(index, name) : []), [open, index, name])
  const showList = open && items.length > 0

  const pick = (entry) => {
    setName(entry.name)
    setPri(entry.pri ?? 'med')
    setOpen(false)
    setActive(-1)
    nameInput.current.focus()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return
      e.preventDefault()
      setOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (i + step + items.length) % items.length)
    } else if (e.key === 'Escape' && showList) {
      e.preventDefault()
      setOpen(false)
      setActive(-1)
    } else if (e.key === 'Enter' && showList && items[active]) {
      e.preventDefault()
      pick(items[active])
    }
  }

  const submit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, pri, dueTime, dueDate })
    setName('')
    setDueTime('')
    setDueDate('')
    setOpen(false)
    setActive(-1)
    nameInput.current.focus()
  }

  return (
    <form className="task-form card" onSubmit={submit}>
      <div
        className="combo"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
        }}
      >
        <input
          ref={nameInput}
          className="name-input"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setActive(-1)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Thêm công việc mới rồi nhấn Enter…"
          aria-label="Tên công việc"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
        />
        {showList && (
          <ul className="suggest" id={listId} role="listbox" aria-label="Gợi ý công việc">
            {!name.trim() && <li className="suggest-head" role="presentation">Việc hay lặp lại</li>}
            {items.map((entry, i) => (
              <li
                key={entry.key}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? 'active' : ''}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(entry)}
                onMouseEnter={() => setActive(i)}
              >
                <span className="s-name">{entry.name}</span>
                <span className={`chip chip-${entry.pri ?? 'med'}`}>{PRIORITIES[entry.pri] ?? PRIORITIES.med}</span>
                {entry.count > 1 && <span className="chip">{entry.count} lần</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <select value={pri} onChange={(e) => setPri(e.target.value)} aria-label="Mức ưu tiên">
        {Object.entries(PRIORITIES).map(([key, label]) => (
          <option key={key} value={key}>
            Ưu tiên: {label}
          </option>
        ))}
      </select>
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Ngày deadline" title="Ngày deadline (tùy chọn)" />
      <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} aria-label="Giờ hạn" />
      <button type="submit" className="primary" disabled={!name.trim()}>
        Thêm
      </button>
    </form>
  )
}
