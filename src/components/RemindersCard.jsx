import { KIND_LABEL } from '../lib/reminders.js'
import { askPermission, notifyPermission, showNotification } from '../lib/notify.js'
import { fullDate } from '../lib/tasks.js'

const TONE = { overdue: 'overdue', late: 'overdue', hour: 'today', today: 'today', behind: 'soon', soon: 'soon' }
const LEADS = [1, 2, 3, 5, 7]

function Settings({ settings, setSettings }) {
  const permission = notifyPermission()

  const toggle = async (checked) => {
    if (!checked) return setSettings({ browser: false })
    const result = permission === 'granted' ? 'granted' : await askPermission()
    setSettings({ browser: result === 'granted' })
  }

  return (
    <details className="rem-settings">
      <summary>Cài đặt nhắc việc</summary>
      <label className="check-line">
        <input type="checkbox" checked={settings.browser && permission === 'granted'} disabled={permission === 'unsupported' || permission === 'denied'} onChange={(e) => toggle(e.target.checked)} />
        Thông báo của trình duyệt
      </label>
      {permission === 'denied' && <p className="rem-note">Trình duyệt đang chặn thông báo. Hãy cho phép trong cài đặt trang web rồi tải lại.</p>}
      {permission === 'unsupported' && <p className="rem-note">Trình duyệt này không hỗ trợ thông báo.</p>}
      <label className="field-line">
        Nhắc trước hạn
        <select value={settings.lead} onChange={(e) => setSettings({ lead: Number(e.target.value) })} aria-label="Số ngày nhắc trước hạn">
          {LEADS.map((n) => (
            <option key={n} value={n}>
              {n} ngày
            </option>
          ))}
        </select>
      </label>
      {settings.browser && permission === 'granted' && (
        <button className="ghost small-btn" onClick={() => showNotification('Taskflow', { body: 'Thông báo hoạt động bình thường.', tag: 'taskflow-test' })}>
          Gửi thông báo thử
        </button>
      )}
      <p className="rem-note">Chỉ nhắc khi trang đang mở (kể cả tab chạy nền). Trên iPhone cần thêm trang vào Màn hình chính.</p>
    </details>
  )
}

export default function RemindersCard({ items, onOpenDay, limit = 6, title = 'Nhắc việc', settings, setSettings }) {
  return (
    <div className="card reminders">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="muted">Không có việc nào cần nhắc.</p>
      ) : (
        <ul className="rem-list">
          {items.slice(0, limit).map((r) => (
            <li key={`${r.id}:${r.kind}`} className={`rem rem-${TONE[r.kind]}`}>
              <div>
                <button className="link" onClick={() => onOpenDay(r.date)} title={`Mở ngày ${fullDate(r.date)}`}>
                  {r.name}
                </button>
                <p>{r.text}</p>
              </div>
              <span className={`chip chip-dl-${TONE[r.kind]}`}>{KIND_LABEL[r.kind]}</span>
            </li>
          ))}
        </ul>
      )}
      {items.length > limit && <p className="muted small">và {items.length - limit} việc khác…</p>}
      {settings && <Settings settings={settings} setSettings={setSettings} />}
    </div>
  )
}
