import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  setDoc,
} from 'firebase/firestore'

// Lưu mỗi ngày một document: users/{uid}/days/{YYYY-MM-DD} = { tasks: [...] }.
export function createCloud(config) {
  const app = initializeApp(config)
  const auth = getAuth(app)
  const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
  const dayRef = (uid, key) => doc(db, 'users', uid, 'days', key)

  return {
    onUser: (cb) =>
      onAuthStateChanged(auth, (u) =>
        cb(u ? { uid: u.uid, name: u.displayName ?? '', email: u.email ?? '', photo: u.photoURL ?? '' } : null),
      ),
    signIn: () => {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      return signInWithPopup(auth, provider)
    },
    signOut: () => signOut(auth),
    // cb nhận { fromCache, docs: [[key, tasks]], changes: [{ key, tasks|null }] }; bỏ qua thay đổi do chính máy này vừa ghi.
    subscribe: (uid, cb, onError) =>
      onSnapshot(
        collection(db, 'users', uid, 'days'),
        { includeMetadataChanges: true },
        (snap) =>
          cb({
            fromCache: snap.metadata.fromCache,
            docs: snap.docs.map((d) => [d.id, d.data().tasks ?? []]),
            changes: snap
              .docChanges()
              .filter((c) => !c.doc.metadata.hasPendingWrites)
              .map((c) => ({ key: c.doc.id, tasks: c.type === 'removed' ? null : (c.doc.data().tasks ?? []) })),
          }),
        onError,
      ),
    writeDay: (uid, key, tasks) => setDoc(dayRef(uid, key), { tasks }),
    deleteDay: (uid, key) => deleteDoc(dayRef(uid, key)),
  }
}
