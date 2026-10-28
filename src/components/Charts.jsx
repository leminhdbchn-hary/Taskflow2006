import { PRIORITIES } from '../lib/tasks.js'

export function BarChart({ bars }) {
  const W = 640
  const H = 220
  const pad = { top: 12, right: 8, bottom: 26, left: 28 }
  const max = Math.max(1, ...bars.map((b) => b.done + b.open))
  const top = max <= 4 ? max : Math.ceil(max / 2) * 2
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom
  const slot = innerW / bars.length
  const barW = Math.min(28, slot * 0.62)
  const y = (v) => pad.top + innerH - (v / top) * innerH
  const every = Math.ceil(bars.length / 16)

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Biểu đồ số việc">
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={pad.left} x2={W - pad.right} y1={y(top * f)} y2={y(top * f)} className="grid" />
          <text x={pad.left - 6} y={y(top * f) + 4} className="axis" textAnchor="end">
            {Math.round(top * f)}
          </text>
        </g>
      ))}
      {bars.map((b, i) => {
        const x = pad.left + slot * i + (slot - barW) / 2
        const hDone = (b.done / top) * innerH
        const hOpen = (b.open / top) * innerH
        return (
          <g key={i}>
            <title>{b.tip}</title>
            <rect x={x} y={y(b.done + b.open)} width={barW} height={hOpen} rx="3" className="bar-open" />
            <rect x={x} y={y(b.done)} width={barW} height={hDone} rx="3" className="bar-done" />
            {i % every === 0 && (
              <text x={x + barW / 2} y={H - 8} className="axis" textAnchor="middle">
                {b.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function Donut({ counts }) {
  const total = counts.high + counts.med + counts.low
  let acc = 0
  const stops = ['high', 'med', 'low']
    .map((k) => {
      const from = (acc / (total || 1)) * 100
      acc += counts[k]
      return `var(--pri-${k}) ${from}% ${(acc / (total || 1)) * 100}%`
    })
    .join(', ')

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: total ? `conic-gradient(${stops})` : 'var(--surface-2)' }}>
        <div className="donut-hole">
          <strong>{total}</strong>
          <span>việc</span>
        </div>
      </div>
      <ul className="legend">
        {['high', 'med', 'low'].map((k) => (
          <li key={k}>
            <i style={{ background: `var(--pri-${k})` }} />
            {PRIORITIES[k]}
            <b>{counts[k]}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Ring({ value, label, sub }) {
  const r = 34
  const c = 2 * Math.PI * r
  return (
    <div className="ring">
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} className="ring-bg" />
        <circle
          cx="40"
          cy="40"
          r={r}
          className="ring-fg"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          transform="rotate(-90 40 40)"
        />
      </svg>
      <div className="ring-text">
        <strong>{label}</strong>
        {sub && <span>{sub}</span>}
      </div>
    </div>
  )
}

export function Legend() {
  return (
    <div className="chart-legend">
      <span>
        <i className="dot-done" /> Hoàn thành
      </span>
      <span>
        <i className="dot-open" /> Chưa xong
      </span>
    </div>
  )
}
