import { useRef } from 'react'

const NAV = [
  { id: 'today', label: 'Hôm nay', icon: 'M8 2v3M16 2v3M3.5 9h17M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z' },
  { id: 'dashboard', label: 'Dashboard', icon: 'M4 13h6V4H4v9Zm0 7h6v-3H4v3Zm10 0h6v-9h-6v9Zm0-16v3h6V4h-6Z' },
  { id: 'report', label: 'Báo cáo', icon: 'M6 3h9l4 4v14H6V3Zm8 0v5h5M9 13h7M9 17h7M9 9h2' },
]

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

export default function Sidebar({ view, onView, onExport, onImport, theme, onTheme }) {
  const fileInput = useRef(null)

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">T</span>
        <span>Taskflow</span>
      </div>

      <nav aria-label="Điều hướng chính">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${view === item.id ? 'active' : ''}`}
            aria-current={view === item.id ? 'page' : undefined}
            onClick={() => onView(item.id)}
          >
            <Icon d={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <p className="foot-title">Dữ liệu</p>
        <button className="nav-item" onClick={onExport}>
          <Icon d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
          Xuất JSON
        </button>
        <button className="nav-item" onClick={() => fileInput.current.click()}>
          <Icon d="M12 20V9m0 0-4 4m4-4 4 4M5 4h14" />
          Nhập JSON
        </button>
        <input ref={fileInput} type="file" accept="application/json" hidden onChange={onImport} />
        <button className="nav-item" onClick={onTheme}>
          <Icon d={theme === 'dark' ? 'M12 3v2m0 14v2M5 12H3m18 0h-2M6.3 6.3 4.9 4.9m14.2 14.2-1.4-1.4M6.3 17.7l-1.4 1.4m14.2-14.2-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' : 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z'} />
          {theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
        </button>
      </div>
    </aside>
  )
}
