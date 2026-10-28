// Cấu hình web app của Firebase (Project settings → Your apps → SDK setup → Config).
// Đây là thông tin định danh công khai, không phải khóa bí mật: dữ liệu được bảo vệ bằng
// quy tắc trong `firestore.rules` và việc đăng nhập. Xem hướng dẫn ở docs/FIREBASE-SETUP.md.
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  appId: '',
}

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
