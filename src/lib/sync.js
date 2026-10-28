// Logic thuần cho đồng bộ: dữ liệu có dạng { "YYYY-MM-DD": [task, ...] }.

export const hasTasks = (data) => Object.values(data).some((list) => list.length > 0)

// Gộp dữ liệu trên máy vào dữ liệu trên tài khoản; trùng id thì giữ bản trên tài khoản.
export function mergeDays(remote, local) {
  const out = { ...remote }
  for (const [key, list] of Object.entries(local)) {
    const base = remote[key] ?? []
    const ids = new Set(base.map((t) => t.id))
    const extra = list.filter((t) => !ids.has(t.id))
    out[key] = extra.length ? [...base, ...extra] : base
  }
  return out
}

// Những ngày cần ghi/xóa để `baseline` (cloud đã biết) khớp với `data`; so sánh theo tham chiếu.
export function diffDays(baseline, data) {
  return {
    writes: Object.keys(data).filter((key) => data[key] !== baseline[key]),
    deletes: Object.keys(baseline).filter((key) => !(key in data)),
  }
}
