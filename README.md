# Taskflow

Taskflow - quản lý công việc theo ngày. Xây dựng bằng React + Vite.

## Tính năng

- **Hôm nay**: công việc theo ngày (ưu tiên, giờ hạn, ghi chú), dải tuần, sửa/xóa (có hoàn tác), chuyển việc tồn đọng sang ngày hiện tại
- **Dashboard**: tiến độ hôm nay/tuần/tháng, biểu đồ 14 ngày, cơ cấu ưu tiên, việc tồn đọng lâu nhất, việc lặp lại nhiều nhất
- **Báo cáo** theo tuần, tháng, năm: thống kê, biểu đồ, danh sách việc đã/chưa hoàn thành, sao chép báo cáo dạng văn bản, in / lưu PDF
- Giao diện sáng/tối, tối ưu cho máy tính
- Xuất / nhập dữ liệu JSON (`taskflow-backup-YYYY-MM-DD.json`)
- Dữ liệu chỉ lưu trong `localStorage` của trình duyệt, không nằm trong repo

## Bắt đầu

```bash
npm install
npm run dev      # chạy môi trường phát triển
npm run build    # build production
npm run lint     # kiểm tra mã nguồn
```

## Cấu trúc

- `src/App.jsx` – state chính, điều hướng, xuất/nhập
- `src/views/` – `TodayView`, `DashboardView`, `ReportView`
- `src/components/` – `Sidebar`, `TaskForm`, `TaskList`, `Charts`
- `src/lib/tasks.js` – lưu trữ, sắp xếp, tiện ích ngày; `src/lib/stats.js` – thống kê và báo cáo

## Triển khai

Mỗi lần push vào `main`, workflow `.github/workflows/deploy.yml` build và deploy lên GitHub Pages (cần bật Settings → Pages → Source: GitHub Actions). Trang Pages là công khai nên **không** đưa dữ liệu cá nhân vào mã nguồn.
