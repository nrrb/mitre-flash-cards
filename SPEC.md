# attck-cards SPEC

Mobile-first, offline-capable PWA for learning MITRE ATT&CK by recognizing techniques in Windows telemetry. Static, no backend, no accounts. Vue 3 + Vite + vite-plugin-pwa, JavaScript only.

## Core loop (only screen on open)
1. On load, one card is shown immediately. No menu, dashboard, or splash.
2. Front: a log sample (Sysmon or Windows Security event, trimmed to relevant fields), monospace, readable at 375px with no horizontal scroll.
3. Tap anywhere on the card to flip. Back: technique ID + name, tactic, one-line "why", one-line "common false positive".
4. Swipe right or "Got it" = pass. Swipe left or "Missed" = fail. Next card loads instantly.
5. No session length, no finish state. Closing mid-card loses only that card's grade.

## Scheduler (SM-2)
Per-card state: `interval` (days), `ease`, `reps`, `dueDate` (local ISO date), `lastReviewed`.
Queue: overdue (most overdue first) -> due today -> up to N new cards (default 5, range 1-20).
Empty queue shows a single "Nothing due" state with "Pull new cards early". Never blocks.

## Deck
`src/data/deck.json`: one card per Enterprise ATT&CK technique and sub-technique (706 cards, ATT&CK v20, 15 tactics). Card: `{ id, techniqueId, techniqueName, tactic, tactics, url, logSample, why, falsePositive, source }`. `tactic` is the first tactic in matrix order (map column); `tactics` is all of them. `url` is the attack.mitre.org technique page; tactic links come from `src/data/tactics.js`.
Names, IDs, tactics and URLs were generated once from MITRE's `enterprise-attack.json` STIX bundle (authoring time only; nothing is fetched at runtime). Log samples are synthetic, derived from each technique's MITRE description, using Sysmon 1-26 (common subset), Security 4624/4625/4648/4672/4688/4697/4698/4702/4720/4722/4728/4732/4738/4768/4769/4776/1102/5136/5140/5145/4657, or System 7045. Off-host techniques show the endpoint-side artifact. `source` is "Derived from ATT&CK description" or a named public reference (Sigma, Elastic detection-rules, EVTX-ATTACK-SAMPLES) that the pattern resembles; those labels are unverified. Cards are bundled at build time.

## Progress (one tap from the card screen)
- Streak: consecutive days with at least one review, with one grace day.
- Tactic map: ATT&CK tactics as columns, each card a cell (empty / started / mastered). Tap a cell for that card's stats.
- Counts: new / learning / mastered.

## Settings (reached from Progress)
New cards per day, reset progress (with confirm), export JSON download, import JSON.

## Must not
No notifications, no runtime network requests, no runtime ATT&CK fetch, no analytics.

## Acceptance criteria
- `npm run build` succeeds with zero warnings.
- Lighthouse PWA installability passes.
- 375x667 fresh load: card, flip, and grade controls reachable without scrolling.
- Grade 5 cards, close, reopen: those 5 are not shown again that day; streak = 1.
- localStorage value set to `"garbage"`: app loads with fresh state, no console errors.
- `npm run build -- --mode release` produces a bundle with zero `data-testid`.

## Ambiguities resolved
1. Grading is binary, mapped to SM-2 quality: Got it = q4, Missed = q1.
2. A miss is not relearned the same day: reps=0, interval=1, due tomorrow. Same-day relearn would contradict "the same 5 are not shown again that day".
3. Ease starts 2.5, floor 1.3. Updated with the SM-2 formula on pass only (q4 leaves it unchanged); unchanged on a miss, as in original SM-2.
4. Grading requires a flip. Grade buttons are always visible but disabled until flipped; swipes are ignored until flipped.
5. Tap vs swipe: pointer travel under 10px is a tap (flip); horizontal travel of 80px or more is a swipe grade; vertical-dominant moves are ignored.
6. "Today" is recomputed on every queue build (local `YYYY-MM-DD`), so crossing midnight works with the app open.
7. The new-card cap is per local day via `newToday = { date, count }`. "Pull new early" ignores the cap and bumps the count. Changing N applies immediately.
8. Queue order: overdue (`dueDate < today`, most overdue first), due today, then new in deck order up to `N - newToday.count`. Ties break by deck order. Cards graded today have `dueDate >= tomorrow`, so they never reappear.
9. Streak: walk back from today (from yesterday if today has no review). An isolated single missing day is bridged; two consecutive missing days end the streak. Only review days count toward the number. Streak is 0 if the latest review day is 3 or more days ago.
10. Status: new = no state; learning = interval < 21; mastered = interval >= 21. Map cell: empty = new, started = learning, mastered = mastered.
11. Tactic map: 15 Enterprise tactics (ATT&CK v20 matrix order, each linking to its MITRE page) as columns, empty columns still shown, one cell per card. The map scrolls horizontally inside its own container; the no-horizontal-scroll rule applies to the card screen.
12. Navigation has no router: a `view` ref in `App.vue` (`card` | `progress` | `settings`). A small icon on the card screen opens Progress; Settings is a button inside Progress.
13. Storage key `attck-cards:v1`, shape `{ v: 1, cards: { [id]: { interval, ease, reps, dueDate, lastReviewed } }, reviewDays: [iso], settings: { newPerDay }, newToday: { date, count } }`. Unparsable or wrong-shape data gives fresh state silently. Card ids not in the deck are dropped on load. Grades persist at grade time.
14. Import validates with the same check as load; invalid file shows an inline error and leaves state untouched, valid file replaces state. Export is `Blob` + `<a download>` named `attck-cards-YYYY-MM-DD.json`.
15. Release mode strips `data-testid` via a Vue compiler `nodeTransform` enabled only when `mode === 'release'`; it is still a production build.
16. Installability: committed PNG icons (192, 512, maskable 512), `registerType: 'autoUpdate'`, `display: standalone`. The service worker precaches everything.
17. Zero warnings: the deck is small, so no chunk-size warning is expected; verified at build time.
18. Log samples are plain text, one `Field: value` per line, rendered `white-space: pre-wrap; overflow-wrap: anywhere` so 375px never scrolls. Values are synthetic (hosts like `WKS-0142`, users like `jdoe`, RFC 5737 / RFC 1918 IPs).
19. Deck rules: unique `id`, event IDs limited to the list above, `source` is one of the three named references. Technique IDs/names are real ATT&CK; payloads are original.
20. Tests: one dependency-free `node:test` file covering SM-2, queue order, streak, and deck sanity (unique ids, at least 25 cards, at least 6 tactics). No component tests.

## File layout
```
index.html
package.json            vue, vite, @vitejs/plugin-vue, vite-plugin-pwa only
vite.config.js          vue plugin (+ testid-stripping nodeTransform in release), VitePWA manifest
public/icons/           icon-192.png, icon-512.png, icon-maskable-512.png
src/
  main.js
  App.vue               view switch
  style.css             tokens, resets, 375px-first layout
  data/deck.json
  data/tactics.js       ordered ATT&CK tactic list
  lib/sm2.js            pure review(card, passed, today)
  lib/dates.js          toISO, today, addDays, diffDays (local time)
  lib/queue.js          pure buildQueue(deck, cards, today, newCap, newToday)
  lib/streak.js         pure streak(reviewDays, today)
  lib/storage.js        load, save, clear, validate (shared with import)
  composables/useStore.js   module-level refs; grade, setNewPerDay, reset, importState
  composables/useSwipe.js   pointer-event tap/swipe detection
  components/CardView.vue, ProgressView.vue, SettingsView.vue, EmptyState.vue
test/core.test.js
```

## Scheduler design
A card with no state is new, treated as `reps=0, interval=0, ease=2.5`. `review(card, passed, today)` is pure and returns the next state.

- Pass (q=4): `reps += 1`. Interval is 1 day at reps 1, 6 days at reps 2, then `round(interval * ease)`. Ease is updated with `ease + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))` (+0 at q4), clamped to at least 1.3. The formula stays in code so the grade mapping can change later.
- Fail (q=1): `reps = 0`, `interval = 1`, ease unchanged, due tomorrow.
- Both: `lastReviewed = today`, `dueDate = today + interval`, as local ISO dates. Date math uses `new Date(y, m, d + n)` on local components, never UTC or `toISOString`, to avoid midnight/DST off-by-one.
- `buildQueue` partitions cards with state by `dueDate` vs today, sorts overdue ascending by `dueDate`, appends due-today, then stateless deck cards in deck order sliced to `max(0, newPerDay - newToday.count)`. `CardView` shows `queue[0]`; the queue is a computed over state, so the next card appears synchronously after grading.
- Empty queue: `EmptyState` offers "Pull new cards early", which shows the next stateless card ignoring the cap and increments `newToday.count`. If the whole deck is introduced it says so. It never blocks.
- `useStore.grade` updates the card, adds today to `reviewDays` (deduped), bumps `newToday` if the card was new, then saves.

## Build order
Scaffold and vite config, then `lib/*` with `core.test.js` green, then storage and store, then CardView/useSwipe/EmptyState, then the deck, then Progress/Settings, then icons, then verify the acceptance criteria.

## Design
Skinned with the Nocturne design system (dark only): violet-ink surfaces with glass panels, amber action color, lavender overlines, rose for misses. Tokens live in `src/style.css`; self-hosted Sora / Inter / JetBrains Mono in `src/assets/fonts`; original stroke icons in `src/assets/icons`. The map uses the action color for status. No logos.
