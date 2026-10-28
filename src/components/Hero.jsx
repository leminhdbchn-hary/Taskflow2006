import heroUrl from '../assets/taskflow-hero.webp'

export default function Hero({ dateLabel, stats }) {
  const label = stats.total ? `${stats.done}/${stats.total} việc hoàn thành · ${stats.rate}%` : 'Chưa có việc nào trong ngày'

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-text">
        <p className="hero-date cap">{dateLabel}</p>
        <h1 id="hero-title">Một ngày rõ ràng, từng việc nhẹ nhàng.</h1>
        <div className="hero-progress">
          <div
            className="progress"
            role="progressbar"
            aria-label="Tiến độ hoàn thành trong ngày"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stats.rate}
          >
            <span style={{ width: `${stats.rate}%` }} />
          </div>
          <span className="progress-label">{label}</span>
        </div>
      </div>
      <img className="hero-art" src={heroUrl} alt="" width="1200" height="400" />
    </section>
  )
}
