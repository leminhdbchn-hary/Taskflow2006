// Máy chủ giả trong bộ nhớ trình duyệt, chỉ dùng khi build với VITE_FAKE_CLOUD=1 để kiểm thử.
const STORE = 'fake.cloud'
const USER = 'fake.user'

const read = () => JSON.parse(localStorage.getItem(STORE) ?? '{}')
const write = (store) => localStorage.setItem(STORE, JSON.stringify(store))

export function createCloud() {
  let userCb = null
  const subs = new Set()
  const log = { writes: [], deletes: [] }
  window.__fake = {
    log,
    // Mô phỏng thay đổi từ thiết bị khác.
    remote(uid, key, tasks) {
      const store = read()
      store[uid] ??= {}
      if (tasks === null) delete store[uid][key]
      else store[uid][key] = tasks
      write(store)
      for (const s of subs) if (s.uid === uid) s.cb({ fromCache: false, docs: [], changes: [{ key, tasks }] })
    },
  }
  const user = () => JSON.parse(sessionStorage.getItem(USER) ?? 'null')

  return {
    onUser(cb) {
      userCb = cb
      setTimeout(() => cb(user()), 20)
      return () => {}
    },
    async signIn() {
      sessionStorage.setItem(USER, JSON.stringify({ uid: 'u1', name: 'Hary Test', email: 'hary@example.com', photo: '' }))
      userCb(user())
    },
    async signOut() {
      sessionStorage.removeItem(USER)
      userCb(null)
    },
    subscribe(uid, cb) {
      const sub = { uid, cb }
      subs.add(sub)
      setTimeout(() => cb({ fromCache: false, docs: Object.entries(read()[uid] ?? {}), changes: [] }), 30)
      return () => subs.delete(sub)
    },
    async writeDay(uid, key, tasks) {
      log.writes.push(key)
      await new Promise((r) => setTimeout(r, 30))
      const store = read()
      store[uid] ??= {}
      store[uid][key] = tasks
      write(store)
    },
    async deleteDay(uid, key) {
      log.deletes.push(key)
      const store = read()
      delete store[uid]?.[key]
      write(store)
    },
  }
}
