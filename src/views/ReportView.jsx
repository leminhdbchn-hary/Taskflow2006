import { useState } from 'react'
import { BarChart, Donut, Legend } from '../components/Charts.jsx'
import { fullDate, shortDate, todayKey, weekdayShort } from '../lib/tasks.js'
import { PERIODS, buckets, periodLabel, periodRange, reportText, shiftPeriod, summarize, tasksInRange } from '../lib/stats.js'

function TaskGroups({ tasks, empty }) {
  if (tasks.length === 0) return <p className="muted">{empty}</p>
  const groups = Object.entries(Object.groupBy(tasks, (t) => t.date)).sort(([a], [b]) => a.localeCompare(b))
  return (
    <div className="groups">
      {groups.map(([date, list]) => (
        <div key={date} className="group">
          <h4>
            {weekdayShort(date)}, {shortDate(date)}
            <span className="muted small">{list.length} việc</span>
          </h4>
          <ul>
            {list.map((t) => (
              <li key={t.id}>
                <span className={`dot dot-${t.pri}`} />
                <span>
                  {t.name}
                  {t.dueDate && <span className="muted"> · hạn {fullDate(t.dueDate)}</span>}
                  {t.note && <em className="muted"> — {t.note}</em>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default function ReportView({ data }) {
  const [type, setType] = useState('week')
  const [anchor, setAnchor] = useState(todayKey())
  const [copied, setCopied] = useState(false)

  const range = periodRange(type, anchor)
  const tasks = tasksInRange(data, range.start, range.end)
  const stats = summarize(tasks)
  const isCurrent = anchor >= periodRange(type, todayKey()).start && anchor <= periodRange(type, todayKey()).end

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportText(type, range, tasks))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      alert('Không sao chép được. Hãy dùng nút In / lưu PDF.')
    }
  }

  return (
    <div className="page report">
      <header className="page-head">
        <div>
          <h1>Báo cáo</h1>
          <p className="muted cap">{periodLabel(type, range)}</p>
        </div>
        <div className="toolbar no-print">
          <div className="segmented" role="tablist" aria-label="Kỳ báo cáo">
            {Object.entries(PERIODS).map(([key, label]) => (
              <button key={key} role="tab" aria-selected={type === key} className={type === key ? 'active' : ''} onClick={() => setType(key)}>
                {label}
              </button>
            ))}
          </div>
          <button className="ghost" onClick={() => setAnchor(shiftPeriod(type, anchor, -1))} aria-label="Kỳ trước">
            ‹
          </button>
          <button className="ghost" onClick={() => setAnchor(shiftPeriod(type, anchor, 1))} aria-label="Kỳ sau">
            ›
          </button>
          <button className="ghost" onClick={() => setAnchor(todayKey())} disabled={isCurrent}>
            Hiện tại
          </button>
          <button className="primary" onClick={copy}>
            {copied ? '✓ Đã sao chép' : 'Sao chép báo cáo'}
          </button>
          <button className="ghost" onClick={() => window.print()}>
            In / PDF
          </button>
        </div>
      </header>

      <div className="stat-grid">
        <div className="card stat">
          <span className="stat-label">Tổng công việc</span>
          <strong className="stat-value">{stats.total}</strong>
        </div>
        <div className="card stat good">
          <span className="stat-label">Hoàn thành</span>
          <strong className="stat-value">{stats.done}</strong>
          <span className="stat-sub">{stats.rate}% tổng số</span>
        </div>
        <div className="card stat warn">
          <span className="stat-label">Chưa hoàn thành</span>
          <strong className="stat-value">{stats.open}</strong>
        </div>
        <div className="card stat">
          <span className="stat-label">Việc chuyển ngày</span>
          <strong className="stat-value">{stats.carried}</strong>
          <span className="stat-sub">bị dời từ ngày khác</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3>{type === 'year' ? 'Theo tháng' : 'Theo ngày'}</h3>
            <Legend />
          </div>
          <BarChart bars={buckets(data, type, range)} />
        </div>
        <div className="card">
          <h3>Mức ưu tiên</h3>
          <Donut counts={stats.byPri} />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Đã hoàn thành ({stats.done})</h3>
          <TaskGroups tasks={tasks.filter((t) => t.done)} empty="Chưa có việc hoàn thành trong kỳ này." />
        </div>
        <div className="card">
          <h3>Chưa hoàn thành ({stats.open})</h3>
          <TaskGroups tasks={tasks.filter((t) => !t.done)} empty="Không còn việc nào tồn trong kỳ này." />
        </div>
      </div>
    </div>
  )
}
