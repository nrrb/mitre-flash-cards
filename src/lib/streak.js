import { addDays } from './dates.js'

// reviewDays: ISO dates. A single missing day is bridged; two in a row end the streak.
export const streak = (reviewDays, today) => {
  const days = new Set(reviewDays)
  let cursor = days.has(today) ? today : addDays(today, -1)
  let count = 0
  for (;;) {
    if (days.has(cursor)) {
      count += 1
      cursor = addDays(cursor, -1)
    } else if (days.has(addDays(cursor, -1))) {
      cursor = addDays(cursor, -1)
    } else {
      return count
    }
  }
}

