# Bật đăng nhập Google và đồng bộ dữ liệu

Taskflow chạy được ngay mà không cần tài khoản (dữ liệu lưu trong trình duyệt). Để đăng nhập
bằng Gmail và xem cùng dữ liệu trên điện thoại/laptop, hãy tạo một project Firebase (miễn phí,
gói Spark) và dán cấu hình vào ứng dụng.

## 1. Tạo project
1. Vào https://console.firebase.google.com và chọn **Add project**, đặt tên `Taskflow`
   (có thể tắt Google Analytics).

## 2. Bật đăng nhập Google
1. **Build → Authentication → Get started → Sign-in method → Google → Enable**.
2. Chọn email hỗ trợ của bạn rồi **Save**.
3. Mở **Authentication → Settings → Authorized domains → Add domain** và thêm
   `leminhdbchn-hary.github.io` (`localhost` đã có sẵn để chạy thử trên máy).

## 3. Tạo cơ sở dữ liệu
1. **Build → Firestore Database → Create database**, chọn **Production mode** và một vị trí gần
   bạn (ví dụ `asia-southeast1`).
2. Mở tab **Rules**, dán toàn bộ nội dung file [`firestore.rules`](../firestore.rules) rồi **Publish**.
   Quy tắc này chỉ cho mỗi người đọc/ghi dữ liệu của chính tài khoản mình.

## 4. Lấy cấu hình web
1. **Project settings (biểu tượng bánh răng) → General → Your apps → biểu tượng Web `</>`**,
   đặt tên app rồi **Register app**.
2. Sao chép đối tượng `firebaseConfig` và dán các giá trị `apiKey`, `authDomain`, `projectId`,
   `appId` vào [`src/lib/firebase-config.js`](../src/lib/firebase-config.js).
   Các giá trị này là định danh công khai, không phải mật khẩu; dữ liệu được bảo vệ bởi bước 2 và 3.
3. Commit và merge vào `main`: GitHub Pages tự build và deploy lại.

## Cách hoạt động
- Dữ liệu lưu theo ngày tại `users/{uid}/days/{YYYY-MM-DD}`; mỗi lần sửa chỉ ghi ngày bị thay đổi.
- Lần đầu đăng nhập, dữ liệu đang có trên máy được gộp vào tài khoản; những lần sau tài khoản là nguồn chính.
- Thay đổi từ thiết bị khác hiện lên ngay. Khi mất mạng, thay đổi được giữ lại và tự đồng bộ khi có mạng.
- Đăng xuất sẽ xóa dữ liệu khỏi máy đó (dữ liệu vẫn an toàn trên tài khoản).
