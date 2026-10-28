import assert from 'node:assert/strict'
import { test } from 'node:test'
import { computeReminders, scheduleInfo } from './reminders.js'
import { buildIndex, fold, suggest } from './suggest.js'
import { deadlineInfo, fullDate } from './tasks.js'

const task = (o) => ({ id: Math.random(), name: 'x', pri: 'med', done: false, dueTime: '', dueDate: '', note: '', carriedFrom: null, ...o })
const at = (iso) => new Date(`${iso}`)

test('fullDate and deadline labels always include day/month/year', () => {
  assert.equal(fullDate('2026-10-05'), '05/10/2026')
  assert.equal(deadlineInfo(task({ dueDate: '2026-11-20' }), '2026-10-28').label, 'Hạn 20/11/2026')
  assert.equal(deadlineInfo(task({ dueDate: '2026-10-30' }), '2026-10-28').label, 'Hạn 30/10/2026 · còn 2 ngày')
  assert.equal(deadlineInfo(task({ dueDate: '2026-10-28' }), '2026-10-28').tone, 'today')
  assert.equal(deadlineInfo(task({ dueDate: '2026-10-25' }), '2026-10-28').label, 'Hạn 25/10/2026 · quá 3 ngày')
  assert.equal(deadlineInfo(task({ dueDate: '2026-10-25', done: true }), '2026-10-28').tone, 'done')
  assert.equal(deadlineInfo(task({}), '2026-10-28'), null)
})

test('fold ignores diacritics and case', () => {
  assert.equal(fold('  Ý kiến  LS  Đoàn '), 'y kien ls doan')
})

test('suggest ranks prefix before substring, then frequency, and ignores diacritics', () => {
  const d = {
    '2026-10-01': [task({ name: 'Ý kiến LS QLK CN', pri: 'high' }), task({ name: 'Báo cáo HĐRR' })],
    '2026-10-02': [task({ name: 'ý kiến ls qlk cn', pri: 'low' }), task({ name: 'Ý kiến lãi suất' })],
    '2026-10-03': [task({ name: 'Rà soát ý kiến' })],
  }
  const idx = buildIndex(d)
  assert.equal(idx.find((e) => e.key === 'y kien ls qlk cn').count, 2)
  assert.equal(idx.find((e) => e.key === 'y kien ls qlk cn').pri, 'low') // gần nhất
  assert.deepEqual(suggest(idx, 'y kien').map((e) => e.key), ['y kien ls qlk cn', 'y kien lai suat', 'ra soat y kien'])
  assert.deepEqual(suggest(idx, 'hdrr').map((e) => e.name), ['Báo cáo HĐRR'])
  assert.deepEqual(suggest(idx, 'zzz'), [])
  assert.deepEqual(suggest(idx, '').map((e) => e.key), ['y kien ls qlk cn']) // rỗng: việc lặp lại
  assert.equal(suggest(idx, 'Ý kiến LS QLK CN').length, 0) // gõ đúng hệt thì không gợi ý lại
})

test('reminders: overdue, today, soon, hour, late and ordering', () => {
  const d = {
    '2026-10-20': [
      task({ id: 1, name: 'qua han', dueDate: '2026-10-25' }),
      task({ id: 2, name: 'hom nay', dueDate: '2026-10-28' }),
      task({ id: 3, name: 'sap toi', dueDate: '2026-10-30' }),
      task({ id: 4, name: 'xa', dueDate: '2026-11-20' }),
      task({ id: 5, name: 'xong', dueDate: '2026-10-25', done: true }),
      task({ id: 6, name: 'khong han' }),
    ],
  }
  const r = computeReminders(d, at('2026-10-28T09:00:00'), 2)
  assert.deepEqual(r.map((x) => [x.taskId, x.kind]), [[1, 'overdue'], [2, 'today'], [3, 'soon']])
  assert.equal(computeReminders(d, at('2026-10-28T09:00:00'), 1).length, 2)

  const timed = { d: [task({ id: 7, dueDate: '2026-10-28', dueTime: '10:00' })] }
  assert.equal(computeReminders(timed, at('2026-10-28T08:00:00'))[0].kind, 'today')
  const hour = computeReminders(timed, at('2026-10-28T09:30:00'))[0]
  assert.equal(hour.kind, 'hour')
  assert.match(hour.text, /30 phút/)
  assert.equal(computeReminders(timed, at('2026-10-28T10:30:00'))[0].kind, 'late')
})

test('behind schedule only for tasks with progress, a deadline and enough elapsed time', () => {
  const base = { dueDate: '2026-10-30' }
  const today = '2026-10-28'
  // bắt đầu 20/10, hạn 30/10: đã qua 8/10 ngày => kế hoạch 80%
  assert.deepEqual(scheduleInfo(task({ ...base, progress: 30, carriedFrom: '2026-10-20' }), '2026-10-28', today), { expected: 80, elapsed: 8, total: 10, behind: true })
  assert.equal(scheduleInfo(task({ ...base, progress: 70, carriedFrom: '2026-10-20' }), '2026-10-28', today).behind, false) // trong ngưỡng 20 điểm
  assert.equal(scheduleInfo(task({ ...base, carriedFrom: '2026-10-20' }), '2026-10-28', today), null) // chưa theo dõi tiến độ
  assert.equal(scheduleInfo(task({ ...base, progress: 0, done: true }), '2026-10-28', today), null)
  const r = computeReminders({ '2026-10-28': [task({ id: 9, dueDate: '2026-10-30', progress: 10, carriedFrom: '2026-10-20' })] }, at('2026-10-28T09:00:00'), 2)
  assert.deepEqual(r.map((x) => x.kind).sort(), ['behind', 'soon'])
  // đã quá hạn thì chỉ báo quá hạn, không báo chậm tiến độ
  const late = computeReminders({ d: [task({ id: 10, dueDate: '2026-10-25', progress: 0, carriedFrom: '2026-10-20' })] }, at('2026-10-28T09:00:00'))
  assert.deepEqual(late.map((x) => x.kind), ['overdue'])
})
