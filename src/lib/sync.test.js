import assert from 'node:assert/strict'
import { test } from 'node:test'
import { diffDays, hasTasks, mergeDays } from './sync.js'

const t = (id, name = `t${id}`) => ({ id, name })

test('hasTasks ignores empty days', () => {
  assert.equal(hasTasks({}), false)
  assert.equal(hasTasks({ a: [] }), false)
  assert.equal(hasTasks({ a: [], b: [t(1)] }), true)
})

test('mergeDays keeps remote copy on id clash and adds local-only tasks', () => {
  const remote = { d1: [{ id: 1, name: 'remote' }], d2: [t(2)] }
  const local = { d1: [{ id: 1, name: 'local' }, t(3)], d3: [t(4)] }
  const merged = mergeDays(remote, local)
  assert.deepEqual(merged.d1.map((x) => x.name), ['remote', 't3'])
  assert.deepEqual(merged.d2, remote.d2)
  assert.deepEqual(merged.d3, local.d3)
})

test('mergeDays does not mutate inputs and keeps untouched day references', () => {
  const remote = { d1: [t(1)] }
  const local = { d1: [t(1)] }
  const merged = mergeDays(remote, local)
  assert.equal(merged.d1, remote.d1)
  assert.deepEqual(Object.keys(remote), ['d1'])
})

test('diffDays reports only changed and removed days', () => {
  const d1 = [t(1)]
  const d2 = [t(2)]
  const baseline = { d1, d2, gone: [t(9)] }
  const data = { d1, d2: [t(2), t(5)], fresh: [] }
  assert.deepEqual(diffDays(baseline, data), { writes: ['d2', 'fresh'], deletes: ['gone'] })
  assert.deepEqual(diffDays({ d1 }, { d1 }), { writes: [], deletes: [] })
})
