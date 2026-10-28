import { BarChart, Donut, Legend, Ring } from '../components/Charts.jsx'
import { deadlineInfo, shortDate, todayKey } from '../lib/tasks.js'
import { deadlineTasks, lastDaysBuckets, overdueTasks, periodRange, summarize, tasksInRange, topRecurring } from '../lib/stats.js'

function Stat({ label, value, sub, tone }) {
  return (
    <div className={`card stat ${tone ?? ''}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-sub">{sub}</span>
    </div>
  )
}

export default function DashboardView({ data, onDay }) {
  const today = todayKey()
  const todayStats = summarize(data[today] ?? [])
  const week = summarize(tasksInRange(data, ...Object.values(periodRange('week', today))))
  const monthRange = periodRange('month', today)
  const monthTasks = tasksInRange(data, monthRange.start, monthRange.end)
  const month = summarize(monthTasks)
  const yearRange = periodRange('year', today)
  const yearTasks = tasksInRange(data, yearRange.start, yearRange.end)
  const overdue = overdueTasks(data, today)
  const recurring = topRecurring(yearTasks, 5)
  const deadlines = deadlineTasks(data, today, 7)
  const hasData = Object.values(data).some((l) => l.length)

  if (!hasData) {
    return (
      <div className="page">
        <header className="page-head">
          <h1>Dashboard</h1>
        </header>
        <div className="empty card">
          <strong>Chưa có dữ liệu để thống kê</strong>
          <span>Thêm công việc ở mục “Hôm nay” hoặc nhập file sao lưu bằng nút “Nhập JSON”.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Tổng quan tiến độ công việc của bạn</p>
        </div>
      </header>

      <div className="stat-grid">
        <div className="card stat">
          <span className="stat-label">Hôm nay</span>
          <Ring value={todayStats.rate} label={`${todayStats.done}/${todayStats.total}`} sub="việc xong" />
        </div>
        <Stat label="Tuần này" value={`${week.rate}%`} sub={`${week.done}/${week.total} việc hoàn thành`} />
        <Stat label="Tháng này" value={`${month.rate}%`} sub={`${month.done}/${month.total} việc hoàn thành`} />
        <Stat label="Tồn đọng" value={overdue.length} sub={overdue.length ? `Cũ nhất: ${overdue[0].age} ngày` : 'Không có việc tồn'} tone={overdue.length ? 'warn' : 'good'} />
      </div>

      <div className="card">
        <h3>Deadline cần chú ý</h3>
        {deadlines.length === 0 ? (
          <p className="muted">Không có deadline quá hạn hoặc trong 7 ngày tới.</p>
        ) : (
          <ul className="rank-list">
            {deadlines.slice(0, 8).map((t) => {
              const dl = deadlineInfo(t, today)
              return (
                <li key={t.id}>
                  <button className="link" onClick={() => onDay(t.date)}>
                    {t.name}
                  </button>
                  <span className="muted small">{shortDate(t.dueDate)}</span>
                  <span className={`chip chip-dl-${dl.tone}`}>{dl.label}</span>
                </li>
              )
            })}
          </ul>
        )}
        {deadlines.length > 8 && <p className="muted small">và {deadlines.length - 8} việc khác…</p>}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <h3>14 ngày gần nhất</h3>
            <Legend />
          </div>
          <BarChart bars={lastDaysBuckets(data, today, 14)} />
        </div>
        <div className="card">
          <h3>Ưu tiên trong tháng</h3>
          <Donut counts={month.byPri} />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Việc tồn đọng lâu nhất</h3>
          {overdue.length === 0 ? (
            <p className="muted">Không có việc tồn đọng. 🎉</p>
          ) : (
            <ul className="rank-list">
              {overdue.slice(0, 6).map((t) => (
                <li key={t.id}>
                  <button className="link" onClick={() => onDay(t.date)}>
                    {t.name}
                  </button>
                  <span className="muted small">{shortDate(t.date)}</span>
                  <span className="chip chip-time">{t.age} ngày</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h3>Việc lặp lại nhiều nhất trong năm</h3>
          {recurring.length === 0 ? (
            <p className="muted">Chưa có việc nào lặp lại.</p>
          ) : (
            <ul className="rank-list">
              {recurring.map((r) => (
                <li key={r.name}>
                  <span>{r.name}</span>
                  <span className="chip chip-med">{r.count} lần</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
