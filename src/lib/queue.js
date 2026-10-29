// cards: { [id]: state }. Returns ordered deck cards to show.
export const buildQueue = (deck, cards, today, newPerDay, newCount) => {
  const seen = deck.filter((c) => cards[c.id])
  const byDue = (a, b) => (cards[a.id].dueDate < cards[b.id].dueDate ? -1 : cards[a.id].dueDate > cards[b.id].dueDate ? 1 : 0)
  const overdue = seen.filter((c) => cards[c.id].dueDate < today).sort(byDue)
  const due = seen.filter((c) => cards[c.id].dueDate === today)
  const fresh = deck.filter((c) => !cards[c.id]).slice(0, Math.max(0, newPerDay - newCount))
  return [...overdue, ...due, ...fresh]
}
