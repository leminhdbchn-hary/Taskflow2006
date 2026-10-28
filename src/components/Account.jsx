const STATUS = {
  loading: 'Đang kiểm tra tài khoản…',
  connecting: 'Đang kết nối…',
  syncing: 'Đang đồng bộ…',
  synced: 'Đã đồng bộ',
  offline: 'Ngoại tuyến, sẽ đồng bộ khi có mạng',
  error: 'Lỗi đồng bộ, sẽ thử lại khi có thay đổi',
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5Z" />
      <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1Z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48Z" />
    </svg>
  )
}

export default function Account({ cloud, onSignOut }) {
  if (!cloud.enabled) return null
  const { user, status } = cloud

  if (!user) {
    return (
      <div className="account">
        <button className="nav-item google" onClick={cloud.signIn} disabled={status === 'loading'} title="Đăng nhập bằng Google" aria-label="Đăng nhập bằng Google">
          <GoogleIcon />
          <span className="label">Đăng nhập Google</span>
        </button>
        <p className="acc-hint">Đăng nhập để xem cùng dữ liệu trên điện thoại và máy tính.</p>
      </div>
    )
  }

  return (
    <div className="account signed-in">
      <div className="acc-row">
        {user.photo ? (
          <img className="avatar" src={user.photo} alt="" width="36" height="36" referrerPolicy="no-referrer" />
        ) : (
          <span className="avatar fallback" aria-hidden="true">
            {(user.name || user.email || '?').charAt(0).toUpperCase()}
          </span>
        )}
        <div className="acc-text">
          <strong>{user.name || 'Tài khoản Google'}</strong>
          <span className="acc-mail">{user.email}</span>
        </div>
      </div>
      <p className={`acc-status st-${status}`} role="status" aria-live="polite">
        <i aria-hidden="true" />
        <span className="label">{STATUS[status]}</span>
      </p>
      <button className="nav-item" onClick={onSignOut} title="Đăng xuất" aria-label="Đăng xuất">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" />
        </svg>
        <span className="label">Đăng xuất</span>
      </button>
    </div>
  )
}
