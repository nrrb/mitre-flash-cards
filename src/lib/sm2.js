import { addDays } from './dates.js'

const PASS_Q = 4

export const newCardState = () => ({ interval: 0, ease: 2.5, reps: 0, dueDate: null, lastReviewed: null })

export const review = (card, passed, today) => {
  let { interval, ease, reps } = card
  if (passed) {
    reps += 1
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(interval * ease)
    const d = 5 - PASS_Q
    ease = Math.max(1.3, ease + (0.1 - d * (0.08 + d * 0.02)))
  } else {
    reps = 0
    interval = 1
  }
  return { interval, ease, reps, dueDate: addDays(today, interval), lastReviewed: today }
}

export const MASTERED_DAYS = 21
export const statusOf = (card) => (!card ? 'new' : card.interval >= MASTERED_DAYS ? 'mastered' : 'learning')
