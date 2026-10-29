import { test } from 'node:test'
import assert from 'node:assert/strict'
import { review, newCardState, statusOf } from '../src/lib/sm2.js'
import { buildQueue } from '../src/lib/queue.js'
import { streak } from '../src/lib/streak.js'
import { addDays } from '../src/lib/dates.js'
import { validate, fresh } from '../src/lib/storage.js'
import { TACTICS } from '../src/data/tactics.js'
import deck from '../src/data/deck.json' with { type: 'json' }

test('sm2: pass sequence 1, 6, then ease-scaled', () => {
  let c = review(newCardState(), true, '2026-01-01')
  assert.equal(c.interval, 1)
  assert.equal(c.dueDate, '2026-01-02')
  c = review(c, true, '2026-01-02')
  assert.equal(c.interval, 6)
  c = review(c, true, '2026-01-08')
  assert.equal(c.interval, 15)
  assert.equal(c.ease, 2.5)
})

test('sm2: fail resets to 1 day, keeps ease', () => {
  const c = review({ interval: 15, ease: 2.3, reps: 3, dueDate: '2026-01-01', lastReviewed: '2025-12-20' }, false, '2026-01-01')
  assert.deepEqual([c.reps, c.interval, c.ease, c.dueDate], [0, 1, 2.3, '2026-01-02'])
})

test('dates: addDays crosses DST and month ends', () => {
  assert.equal(addDays('2026-03-07', 1), '2026-03-08')
  assert.equal(addDays('2026-03-08', 1), '2026-03-09')
  assert.equal(addDays('2026-01-31', 1), '2026-02-01')
})

test('queue: overdue (oldest first), due, then capped new', () => {
  const d = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id }))
  const cards = {
    a: { dueDate: '2026-01-10' },
    b: { dueDate: '2026-01-08' },
    c: { dueDate: '2026-01-12' },
    d: { dueDate: '2026-01-20' }
  }
  assert.deepEqual(buildQueue(d, cards, '2026-01-12', 1, 0).map((c) => c.id), ['b', 'a', 'c', 'e'])
  assert.deepEqual(buildQueue(d, cards, '2026-01-12', 5, 5).map((c) => c.id), ['b', 'a', 'c'])
})

test('streak: grace day bridges one gap, two end it', () => {
  assert.equal(streak(['2026-01-10'], '2026-01-10'), 1)
  assert.equal(streak(['2026-01-08', '2026-01-10'], '2026-01-10'), 2)
  assert.equal(streak(['2026-01-07', '2026-01-10'], '2026-01-10'), 1)
  assert.equal(streak(['2026-01-09'], '2026-01-10'), 1)
  assert.equal(streak(['2026-01-08'], '2026-01-10'), 1)
  assert.equal(streak(['2026-01-07'], '2026-01-10'), 0)
  assert.equal(streak([], '2026-01-10'), 0)
})

test('storage: garbage and wrong shapes are rejected, fresh state is valid', () => {
  assert.equal(validate('garbage'), null)
  assert.equal(validate(null), null)
  assert.equal(validate({ v: 2 }), null)
  assert.deepEqual(validate(fresh()), fresh())
})

test('status thresholds', () => {
  assert.equal(statusOf(undefined), 'new')
  assert.equal(statusOf({ interval: 20 }), 'learning')
  assert.equal(statusOf({ interval: 21 }), 'mastered')
})

test('deck: every card complete, unique, linked, allowed events only', () => {
  const names = new Set(TACTICS.map((t) => t.name))
  const ok = /^(Sysmon EventID: (1|2|3|5|6|7|8|9|10|11|12|13|14|15|17|18|19|20|21|22|23|25|26)|Security EventID: (1102|4624|4625|4648|4672|4688|4697|4698|4702|4720|4722|4728|4732|4738|4768|4769|4776|5136|5140|5145|4657)|System EventID: 7045)\n/
  assert.ok(deck.length >= 25)
  assert.equal(new Set(deck.map((c) => c.id)).size, deck.length)
  assert.equal(new Set(deck.map((c) => c.techniqueId)).size, deck.length)
  for (const c of deck) {
    assert.match(c.logSample, ok, c.id)
    assert.ok(c.why && c.falsePositive && c.source, c.id)
    assert.ok(names.has(c.tactic) && c.tactics.every((t) => names.has(t)), c.id)
    assert.equal(c.url, `https://attack.mitre.org/techniques/${c.techniqueId.replace('.', '/')}`, c.id)
  }
  for (const t of TACTICS) assert.ok(deck.some((c) => c.tactics.includes(t.name)), t.name)
})
