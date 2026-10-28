const BASE = import.meta.env.BASE_URL

export const notifySupported = () => typeof Notification !== 'undefined'
export const notifyPermission = () => (notifySupported() ? Notification.permission : 'unsupported')

export async function askPermission() {
  if (!notifySupported()) return 'unsupported'
  return Notification.requestPermission()
}

// Ưu tiên service worker (bắt buộc trên Chrome điện thoại), không có thì dùng Notification thường.
export async function showNotification(title, { body, tag }) {
  if (notifyPermission() !== 'granted') return false
  const options = { body, tag, icon: `${BASE}icon-192.png`, badge: `${BASE}icon-192.png`, data: { url: BASE } }
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null
    if (reg) await reg.showNotification(title, options)
    else new Notification(title, options)
    return true
  } catch {
    return false
  }
}
