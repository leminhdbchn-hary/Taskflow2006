# Taskflow

Taskflow - quản lý công việc theo ngày. Xây dựng bằng React + Vite.

## Tính năng

- **Hôm nay**: công việc theo ngày (ưu tiên, ngày deadline, giờ hạn, ghi chú; cảnh báo quá hạn / sắp đến hạn), dải tuần, sửa/xóa (có hoàn tác), chuyển việc tồn đọng sang ngày hiện tại
- **Dashboard**: tiến độ hôm nay/tuần/tháng, biểu đồ 14 ngày, cơ cấu ưu tiên, deadline cần chú ý, việc tồn đọng lâu nhất, việc lặp lại nhiều nhất
- **Báo cáo** theo tuần, tháng, năm: thống kê, biểu đồ, danh sách việc đã/chưa hoàn thành, sao chép báo cáo dạng văn bản, in / lưu PDF
- Giao diện sáng/tối, tối ưu cho máy tính, có bản thu gọn cho điện thoại
- Minh họa 3D (banner, trạng thái trống, hoàn thành) trong `src/assets/*.webp`, nạp qua `import` nên tự theo `base` của Vite (`/Taskflow2006/`)
- Xuất / nhập dữ liệu JSON (`taskflow-backup-YYYY-MM-DD.json`)
- Đăng nhập Google (Firebase) để xem cùng dữ liệu trên nhiều thiết bị, tự đồng bộ và dùng được khi mất mạng; chưa đăng nhập thì dữ liệu chỉ lưu trong `localStorage` của trình duyệt. Hướng dẫn cài đặt: [docs/FIREBASE-SETUP.md](docs/FIREBASE-SETUP.md)
- Icon ứng dụng và manifest để thêm vào màn hình chính điện thoại
- Dữ liệu cá nhân không nằm trong repo

## Bắt đầu

```bash
npm install
npm run dev      # chạy môi trường phát triển
npm run build    # build production
npm run lint     # kiểm tra mã nguồn
npm test         # kiểm thử logic đồng bộ
```

## Cấu trúc

- `src/App.jsx` – state chính, điều hướng, xuất/nhập
- `src/views/` – `TodayView`, `DashboardView`, `ReportView`
- `src/components/` – `Sidebar`, `TaskForm`, `TaskList`, `Charts`
- `src/lib/useCloud.js`, `firebaseCloud.js`, `sync.js` – đăng nhập và đồng bộ (Firestore)
- `src/lib/tasks.js` – lưu trữ, sắp xếp, tiện ích ngày; `src/lib/stats.js` – thống kê và báo cáo

## Triển khai

Mỗi lần push vào `main`, workflow `.github/workflows/deploy.yml` build và deploy lên GitHub Pages (cần bật Settings → Pages → Source: GitHub Actions). Trang Pages là công khai nên **không** đưa dữ liệu cá nhân vào mã nguồn.
