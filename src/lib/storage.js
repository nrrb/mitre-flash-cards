const KEY = 'attck-cards:v1'

export const fresh = () => ({
  v: 1,
  cards: {},
  reviewDays: [],
  settings: { newPerDay: 5 },
  newToday: { date: '', count: 0 }
})

const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const isNum = (n) => typeof n === 'number' && Number.isFinite(n)

// Returns a clean state object, or null when raw is not a valid state.
export const validate = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.v !== 1) return null
  const { cards, reviewDays, settings, newToday } = raw
  if (!cards || typeof cards !== 'object' || !Array.isArray(reviewDays) || !settings || !newToday) return null
  if (!isNum(settings.newPerDay) || settings.newPerDay < 1 || settings.newPerDay > 20) return null
  if (typeof newToday.date !== 'string' || !isNum(newToday.count)) return null
  if (!reviewDays.every(isDate)) return null
  const clean = {}
  for (const [id, c] of Object.entries(cards)) {
    if (!c || !isNum(c.interval) || !isNum(c.ease) || !isNum(c.reps) || !isDate(c.dueDate) || !isDate(c.lastReviewed)) return null
    clean[id] = { interval: c.interval, ease: c.ease, reps: c.reps, dueDate: c.dueDate, lastReviewed: c.lastReviewed }
  }
  return {
    v: 1,
    cards: clean,
    reviewDays: [...reviewDays],
    settings: { newPerDay: Math.round(settings.newPerDay) },
    newToday: { date: newToday.date, count: newToday.count }
  }
}

export const load = () => {
  try {
    return validate(JSON.parse(localStorage.getItem(KEY))) ?? fresh()
  } catch {
    return fresh()
  }
}

export const save = (state) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage unavailable or full; state stays in memory
  }
}

export const clear = () => {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // nothing to clear
  }
}
