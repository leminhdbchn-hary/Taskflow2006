# Taskflow

Taskflow - quản lý công việc theo ngày. Xây dựng bằng React + Vite.

## Tính năng

- Xem và thêm công việc theo từng ngày (mức ưu tiên, giờ hạn, ghi chú)
- Đánh dấu hoàn thành, xóa công việc
- Chuyển các việc chưa xong từ ngày cũ sang ngày đang xem
- Xuất / nhập dữ liệu dạng JSON (`taskflow-backup-YYYY-MM-DD.json`)
- Dữ liệu chỉ lưu trong `localStorage` của trình duyệt, không nằm trong repo; dùng "Nhập JSON" để khôi phục từ file sao lưu

## Bắt đầu

```bash
npm install
npm run dev      # chạy môi trường phát triển
npm run build    # build production
npm run lint     # kiểm tra mã nguồn
```

## Cấu trúc

- `src/App.jsx` – state chính, chuyển việc tồn đọng, xuất/nhập
- `src/lib/tasks.js` – lưu trữ, sắp xếp, tiện ích ngày
- `src/components/` – `DateBar`, `TaskForm`, `TaskList`

## Triển khai

Mỗi lần push vào `main`, workflow `.github/workflows/deploy.yml` build và deploy lên GitHub Pages (cần bật Settings → Pages → Source: GitHub Actions). Trang Pages là công khai nên **không** đưa dữ liệu cá nhân vào mã nguồn.
