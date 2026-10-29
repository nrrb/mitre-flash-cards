import { ref, computed } from 'vue'
import deck from '../data/deck.json'
import { load, save, clear, fresh, validate } from '../lib/storage.js'
import { today as getToday } from '../lib/dates.js'
import { newCardState, review, statusOf } from '../lib/sm2.js'
import { buildQueue } from '../lib/queue.js'
import { streak } from '../lib/streak.js'

const ids = new Set(deck.map((c) => c.id))
const prune = (s) => {
  for (const id of Object.keys(s.cards)) if (!ids.has(id)) delete s.cards[id]
  return s
}

const state = ref(prune(load()))
const today = ref(getToday())
const extraNew = ref(0) // cards pulled early this view session, shown ahead of an empty queue

const refreshToday = () => {
  today.value = getToday()
}
document.addEventListener('visibilitychange', refreshToday)

const newCount = computed(() => (state.value.newToday.date === today.value ? state.value.newToday.count : 0))

const queue = computed(() => {
  const q = buildQueue(deck, state.value.cards, today.value, state.value.settings.newPerDay, newCount.value)
  if (q.length || !extraNew.value) return q
  return deck.filter((c) => !state.value.cards[c.id]).slice(0, 1)
})

const current = computed(() => queue.value[0] ?? null)
const hasUnseen = computed(() => deck.some((c) => !state.value.cards[c.id]))

const commit = () => save(state.value)

const grade = (passed) => {
  const card = current.value
  const t = getToday()
  const wasNew = !state.value.cards[card.id]
  state.value.cards[card.id] = review(state.value.cards[card.id] ?? newCardState(), passed, t)
  if (!state.value.reviewDays.includes(t)) state.value.reviewDays.push(t)
  if (wasNew) state.value.newToday = { date: t, count: (state.value.newToday.date === t ? state.value.newToday.count : 0) + 1 }
  today.value = t
  commit()
}

// "Nothing due" -> show the next unseen card regardless of the daily cap
const pullNew = () => {
  extraNew.value += 1
}

const setNewPerDay = (n) => {
  state.value.settings.newPerDay = n
  commit()
}

const reset = () => {
  clear()
  state.value = fresh()
}

const importState = (text) => {
  let raw
  try {
    raw = JSON.parse(text)
  } catch {
    return false
  }
  const next = validate(raw)
  if (!next) return false
  state.value = prune(next)
  commit()
  return true
}

const exportJSON = () => JSON.stringify(state.value, null, 2)

const counts = computed(() => {
  const c = { new: 0, learning: 0, mastered: 0 }
  for (const card of deck) c[statusOf(state.value.cards[card.id])] += 1
  return c
})

const streakCount = computed(() => streak(state.value.reviewDays, today.value))

export const useStore = () => ({
  deck,
  state,
  current,
  hasUnseen,
  counts,
  streakCount,
  grade,
  pullNew,
  setNewPerDay,
  reset,
  importState,
  exportJSON
})
