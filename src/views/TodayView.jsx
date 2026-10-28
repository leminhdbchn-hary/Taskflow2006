import Hero from '../components/Hero.jsx'
import TaskForm from '../components/TaskForm.jsx'
import TaskList from '../components/TaskList.jsx'
import { Ring } from '../components/Charts.jsx'
import successUrl from '../assets/taskflow-success.webp'
import { formatDay, shiftDay, shortDate, sortTasks, todayKey, weekdayShort } from '../lib/tasks.js'
import { overdueTasks, periodRange, summarize } from '../lib/stats.js'

export default function TodayView({ data, day, onDay, actions }) {
  const tasks = data[day] ?? []
  const stats = summarize(tasks)
  const overdue = overdueTasks(data, day)
  const week = periodRange('week', day)
  const days = Array.from({ length: 7 }, (_, i) => shiftDay(week.start, i))
  const isToday = day === todayKey()
  const allDone = stats.total > 0 && stats.open === 0

  return (
    <div className="page">
      <Hero dateLabel={formatDay(day)} stats={stats} />

      <div className="day-bar">
        <div className="toolbar">
          <button className="ghost" onClick={() => onDay(shiftDay(day, -1))} aria-label="Hôm trước">
            ‹
          </button>
          <input type="date" value={day} onChange={(e) => e.target.value && onDay(e.target.value)} aria-label="Chọn ngày" />
          <button className="ghost" onClick={() => onDay(shiftDay(day, 1))} aria-label="Hôm sau">
            ›
          </button>
          <button className="ghost" onClick={() => onDay(todayKey())} disabled={isToday}>
            Hôm nay
          </button>
        </div>
      </div>

      <div className="week-strip card" role="tablist" aria-label="Các ngày trong tuần">
        {days.map((k) => {
          const s = summarize(data[k] ?? [])
          return (
            <button key={k} role="tab" aria-selected={k === day} className={`week-day ${k === day ? 'active' : ''} ${k === todayKey() ? 'is-today' : ''}`} onClick={() => onDay(k)}>
              <span className="wd">{weekdayShort(k)}</span>
              <strong>{k.slice(8)}</strong>
              <span className="wd-count">{s.total ? `${s.done}/${s.total}` : '–'}</span>
            </button>
          )
        })}
      </div>

      <div className="two-col">
        <section className="col-main">
          <TaskForm onAdd={actions.add} />
          {allDone && (
            <div className="state-card card success" role="status">
              <img src={successUrl} alt="" width="140" height="124" />
              <div>
                <strong>Xong việc hôm nay. Bạn làm tốt lắm!</strong>
                <span>Tất cả {stats.total} việc trong ngày đã hoàn thành.</span>
              </div>
            </div>
          )}
          <TaskList tasks={sortTasks(tasks)} onToggle={actions.toggle} onUpdate={actions.update} onRemove={actions.remove} />
        </section>

        <aside className="col-side">
          <div className="card progress-card">
            <Ring value={stats.rate} label={`${stats.rate}%`} sub="hoàn thành" />
            <ul className="mini-stats">
              <li>
                <b>{stats.total}</b> tổng việc
              </li>
              <li>
                <b>{stats.done}</b> đã xong
              </li>
              <li>
                <b>{stats.open}</b> còn lại
              </li>
            </ul>
          </div>

          <div className="card">
            <h3>Tồn đọng từ ngày trước</h3>
            {overdue.length === 0 ? (
              <p className="muted">Không có việc tồn đọng.</p>
            ) : (
              <>
                <ul className="overdue-list">
                  {overdue.slice(0, 5).map((t) => (
                    <li key={t.id}>
                      <button className="link" onClick={() => onDay(t.date)} title={`Mở ngày ${shortDate(t.date)}`}>
                        {t.name}
                      </button>
                      <span className="chip chip-time">{t.age} ngày</span>
                    </li>
                  ))}
                </ul>
                {overdue.length > 5 && <p className="muted small">và {overdue.length - 5} việc khác…</p>}
                <button className="primary full" onClick={actions.carryOver}>
                  Chuyển {overdue.length} việc sang ngày này
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
