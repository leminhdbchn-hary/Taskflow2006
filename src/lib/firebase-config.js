// Cấu hình web app của Firebase (Project settings → Your apps → SDK setup → Config).
// Đây là thông tin định danh công khai, không phải khóa bí mật: dữ liệu được bảo vệ bằng
// quy tắc trong `firestore.rules` và việc đăng nhập. Xem hướng dẫn ở docs/FIREBASE-SETUP.md.
export const firebaseConfig = {
  apiKey: 'AIzaSyAvPrCRBDJnSe_2OdGpn6ZCNDBke4ZqD98',
  authDomain: 'taskflow-a5986.firebaseapp.com',
  projectId: 'taskflow-a5986',
  appId: '1:440653420237:web:14f1d8eceaa86c46edfb84',
}

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
