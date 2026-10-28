import { useCallback, useEffect, useRef, useState } from 'react'
import { firebaseConfig, firebaseReady } from './firebase-config.js'
import { diffDays, hasTasks, mergeDays } from './sync.js'

const OWNER_KEY = 'taskflow.owner'
export const cloudEnabled = firebaseReady || Boolean(import.meta.env.VITE_FAKE_CLOUD)

async function loadCloud() {
  // VITE_FAKE_CLOUD chỉ có khi build để kiểm thử; bản thật loại bỏ nhánh này.
  if (import.meta.env.VITE_FAKE_CLOUD) return (await import('./fakeCloud.js')).createCloud()
  return (await import('./firebaseCloud.js')).createCloud(firebaseConfig)
}

const getOwner = () => {
  try {
    return localStorage.getItem(OWNER_KEY)
  } catch {
    return null
  }
}
const setOwner = (uid) => {
  try {
    if (uid) localStorage.setItem(OWNER_KEY, uid)
    else localStorage.removeItem(OWNER_KEY)
  } catch {
    // bỏ qua nếu trình duyệt chặn lưu trữ
  }
}

// Đồng bộ `data` với Firestore khi đã đăng nhập; chưa đăng nhập thì ứng dụng chạy cục bộ như cũ.
export function useCloud({ data, setData, notify }) {
  const [user, setUser] = useState(cloudEnabled ? undefined : null) // undefined: đang kiểm tra
  const [ready, setReady] = useState(false)
  const [settled, setSettled] = useState(false) // đã xếp hàng xong đợt ghi đầu tiên sau khi nhận dữ liệu
  const [pending, setPending] = useState(0)
  const [failed, setFailed] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  const cloud = useRef(null)
  const baseline = useRef({}) // những gì tài khoản đã biết
  const readyRef = useRef(false)
  const dataRef = useRef(data)
  useEffect(() => {
    dataRef.current = data
  })

  const markReady = (value) => {
    readyRef.current = value
    setReady(value)
  }

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    addEventListener('online', on)
    addEventListener('offline', off)
    return () => {
      removeEventListener('online', on)
      removeEventListener('offline', off)
    }
  }, [])

  // Khởi tạo và theo dõi trạng thái đăng nhập.
  useEffect(() => {
    if (!cloudEnabled) return
    let stop = () => {}
    let cancelled = false
    loadCloud()
      .then((c) => {
        if (cancelled) return
        cloud.current = c
        stop = c.onUser(setUser)
      })
      .catch(() => {
        setUser(null)
        notify('Không tải được dịch vụ đồng bộ. Ứng dụng đang chạy ở chế độ cục bộ.')
      })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [notify])

  // Đăng nhập xong: nhận dữ liệu từ tài khoản và theo dõi thay đổi từ thiết bị khác.
  const uid = user?.uid
  useEffect(() => {
    if (!uid || !cloud.current) return
    let first = true
    const owner = getOwner()

    const initialSync = (remote) => {
      const local = dataRef.current
      // Dữ liệu trên máy chỉ là bản lưu đệm của tài khoản này, hoặc của tài khoản khác: tài khoản luôn thắng.
      // Dữ liệu chưa thuộc tài khoản nào (dùng khi chưa đăng nhập): gộp vào tài khoản.
      const guest = !owner && hasTasks(local)
      const final = guest ? mergeDays(remote, local) : remote
      baseline.current = remote
      setOwner(uid)
      setData(final)
      markReady(true)
      if (guest) notify('Đã đồng bộ dữ liệu trên máy này vào tài khoản của bạn.')
    }

    const stop = cloud.current.subscribe(
      uid,
      (ev) => {
        if (first) {
          // Bản chụp rỗng lấy từ bộ nhớ đệm khi chưa nối được máy chủ: chưa đủ tin cậy để quyết định.
          if (ev.fromCache && ev.docs.length === 0) return
          first = false
          initialSync(Object.fromEntries(ev.docs))
          return
        }
        if (!ev.changes.length) return
        for (const c of ev.changes) {
          if (c.tasks === null) delete baseline.current[c.key]
          else baseline.current[c.key] = c.tasks
        }
        setData((prev) => {
          const next = { ...prev }
          for (const c of ev.changes) {
            if (c.tasks === null) delete next[c.key]
            else next[c.key] = c.tasks
          }
          return next
        })
      },
      () => setFailed(true),
    )
    return () => {
      stop()
      baseline.current = {}
      markReady(false)
      setSettled(false)
    }
  }, [uid, setData, notify])

  // Ghi lên tài khoản đúng những ngày đã thay đổi.
  useEffect(() => {
    if (!uid || !ready || !readyRef.current) return
    const { writes, deletes } = diffDays(baseline.current, data)
    const run = (task, key) => {
      setPending((n) => n + 1)
      task
        .then(() => setFailed(false))
        .catch(() => {
          delete baseline.current[key] // thử lại ở lần thay đổi kế tiếp
          setFailed(true)
        })
        .finally(() => setPending((n) => n - 1))
    }
    for (const key of writes) {
      baseline.current[key] = data[key]
      run(cloud.current.writeDay(uid, key, data[key]), key)
    }
    for (const key of deletes) {
      delete baseline.current[key]
      run(cloud.current.deleteDay(uid, key), key)
    }
    setSettled(true)
  }, [data, ready, uid])

  const signIn = useCallback(async () => {
    try {
      await cloud.current.signIn()
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        notify('Đăng nhập không thành công. Hãy thử lại hoặc cho phép cửa sổ bật lên.')
      }
    }
  }, [notify])

  const signOut = useCallback(async () => {
    markReady(false) // chặn việc ghi trước khi xóa dữ liệu trên máy
    await cloud.current.signOut()
    setOwner(null)
    baseline.current = {}
    setData({})
  }, [setData])

  let status = 'off'
  if (cloudEnabled) {
    if (user === undefined) status = 'loading'
    else if (user === null) status = 'signedout'
    else if (failed) status = 'error'
    else if (!ready || !settled) status = online ? 'connecting' : 'offline'
    else if (pending > 0) status = online ? 'syncing' : 'offline'
    else status = 'synced'
  }

  return { enabled: cloudEnabled, user: user ?? null, status, pending, signIn, signOut }
}
