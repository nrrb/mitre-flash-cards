# 🃏 attck-cards

**Learn MITRE ATT&CK by recognizing it in the wild, one log line at a time.**

A pocket-sized, offline-first flashcard app. You see a trimmed Windows event, you guess the technique, you flip the card, and a spaced-repetition scheduler decides when you'll see it again. No accounts, no backend, no tracking, no notifications.

> **Personal prototype.**

> 706 cards · every Enterprise technique and sub-technique · 15 tactics · 100% in your browser

---

## ✨ What it does

1. **Open the app, get a card.** No menu, no splash, no dashboard.
2. **Read the log.** A synthetic Sysmon or Windows Security event, cut down to the fields that matter, sized for a 375px phone.
3. **Tap to flip.** The back shows the technique ID and name, its tactic(s), why this log means that technique, and a common false positive, plus a link to the MITRE page.
4. **Grade yourself.** Swipe right or tap **Got it**; swipe left or tap **Missed**. Grading unlocks after you flip, so you can't skip the recall.
5. **Next card, instantly.** There is no session and no "finish" state. Close the tab whenever you like.

One tap away (never on the card screen):

- 🔥 **Streak** with one grace day: miss a day and it survives, miss two in a row and it resets.
- 🗺️ **Tactic map**: every ATT&CK tactic as a column, every card as a little square (empty / started / mastered). Tap a square for that card's stats and its MITRE link.
- 📊 **Counts** of new / learning / mastered.
- ⚙️ **Settings**: new cards per day (1-20), export / import progress as JSON, reset (with confirmation).

---

## 🧠 The learning techniques behind it

The app is built around a few well-studied ideas from memory research.

| Technique | What it means | Where you see it here |
|---|---|---|
| [**Active recall**](https://en.wikipedia.org/wiki/Active_recall) / the [**testing effect**](https://en.wikipedia.org/wiki/Testing_effect) | Pulling an answer out of memory strengthens it more than rereading it. | The front of the card shows only evidence; you commit to an answer before flipping. |
| [**Spaced repetition**](https://en.wikipedia.org/wiki/Spaced_repetition) and the [**spacing effect**](https://en.wikipedia.org/wiki/Spacing_effect) | Reviewing just as you're about to forget beats cramming. | The SM-2 scheduler pushes cards you know further out and brings missed ones back tomorrow. |
| [**The forgetting curve**](https://en.wikipedia.org/wiki/Forgetting_curve) | Memories fade predictably unless reinforced. | Growing intervals are the whole point of the scheduler. |
| **Learning from realistic evidence** | Analysts don't see technique names; they see telemetry. | Cards are log samples, not definitions. The back explains *why* the log implies the technique and what benign activity looks similar. |
| **Low-friction habit loop** | Small, frequent sessions stick. | Instant next card, no session length, and a forgiving streak. |

### ⏱️ The scheduler: SM-2

The scheduler is [SuperMemo's SM-2 algorithm](https://super-memory.com/english/ol/sm2.htm), simplified for two buttons:

- **Got it** counts as quality 4. The first pass is due in 1 day, the second in 6 days, then each interval is multiplied by the card's ease factor (starts at 2.5, never below 1.3).
- **Missed** resets the card: due tomorrow, repetitions back to zero. Missed cards are not re-shown later the same day.
- **Queue order:** overdue cards first (most overdue first), then due today, then up to *N* new cards per day (default 5).
- **Mastered** means an interval of 21 days or more.
- When nothing is due you get a calm "Nothing due" screen with an option to pull new cards early. It never blocks you.

All dates are local-time ISO dates, so midnight and daylight-saving changes don't skew the schedule.

---

## 🔗 Learn more about the material

**MITRE ATT&CK**
- [ATT&CK home](https://attack.mitre.org/) · [Matrix](https://attack.mitre.org/matrices/enterprise/) · [Tactics](https://attack.mitre.org/tactics/enterprise/) · [Techniques](https://attack.mitre.org/techniques/enterprise/)
- [ATT&CK data as STIX](https://github.com/mitre-attack/attack-stix-data): the source the card list was generated from

**Windows telemetry**
- [Sysmon](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon): the System Monitor events (1, 3, 7, 10, 11, 13, 22 and friends) behind most cards
- [Windows security auditing](https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/security-auditing-overview): Security events like 4624, 4688, 4698, 4720

**Public detection content that inspires the "how would I catch this?" mindset**
- [Sigma](https://github.com/SigmaHQ/sigma) · [Elastic detection-rules](https://github.com/elastic/detection-rules) · [EVTX-ATTACK-SAMPLES](https://github.com/sbousseaden/EVTX-ATTACK-SAMPLES)

---

## 🗂️ About the deck

- **One card per technique or sub-technique** (706 in ATT&CK v20). IDs, names, tactics, and URLs come from MITRE's published data, generated once at authoring time. Nothing is fetched at runtime.
- **Log samples are synthetic.** They were written from MITRE's technique descriptions using made-up hosts, users, and reserved example IPs and domains. They are meant to teach the *shape* of the evidence, not to be copied into a detection.
- **Not every technique has a clean Windows event.** For off-host techniques (reconnaissance, resource development and similar), the card shows the closest endpoint-side artifact, and the "why" says so.
- **Review before you rely on it.** The log samples have not been technically reviewed card by card. The `source` field is either "Derived from ATT&CK description" or a public project the pattern resembles; those resemblance labels are unverified.

### ➕ Adding or editing a card

The deck is plain JSON in [`src/data/deck.json`](src/data/deck.json). Add an object and you're done; no code change.

```json
{
  "id": "t1059-001",
  "techniqueId": "T1059.001",
  "techniqueName": "Command and Scripting Interpreter: PowerShell",
  "tactic": "Execution",
  "tactics": ["Execution"],
  "url": "https://attack.mitre.org/techniques/T1059/001",
  "logSample": "Sysmon EventID: 1\nImage: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe\nCommandLine: powershell.exe -NoP -W Hidden -Enc SQBFAFgA...\nParentImage: C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE",
  "why": "Hidden, encoded PowerShell spawned by Word is a classic macro payload launcher.",
  "falsePositive": "Admin scripts that use -EncodedCommand, but not from an Office parent.",
  "source": "Derived from ATT&CK description"
}
```

`npm test` checks that every card is complete, has a unique ID, links to the right MITRE page, belongs to a known tactic, and starts with an allowed event type.

---

## 🚀 Run it

You need Node.js and npm.

```bash
npm install
npm run dev        # develop with hot reload
npm test           # scheduler, queue, streak, storage, and deck checks
npm run build      # production build + service worker
npm run preview    # serve the build locally (try installing it as an app)
```

A **release build** strips every `data-testid` attribute from the bundle:

```bash
npm run build -- --mode release
```

### 🌐 Publish on GitHub Pages

A workflow in `.github/workflows/pages.yml` runs the tests, builds in release mode, and deploys to GitHub Pages on every push to `main`. The build uses relative paths, so it works under `https://<user>.github.io/<repo>/` with no config.

1. Push the repo to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually). The URL appears in the workflow run.

Pages sites are public even when the repo is private on most plans, so check who can see it before you publish.

### 📲 Install and offline

It's a PWA built with [vite-plugin-pwa](https://vite-pwa-org.netlify.app/). After the first load everything is cached, so it works offline and can be added to your home screen. Fonts and icons are bundled; the app makes no network requests of its own.

---

## 🔒 Privacy and where your progress lives

Everything stays in your browser's `localStorage` under one versioned key, `attck-cards:v1`. No accounts, no analytics, no notifications, no server.

- Progress is saved the moment you grade a card.
- Corrupt or missing data simply starts you fresh.
- It doesn't sync across devices or browsers. Use **Settings → Export / Import** to back up or move it.
- Clearing site data erases it.

---

## 🧱 Under the hood

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) and [Vite](https://vitejs.dev/), plain JavaScript, no UI framework
- Pure, tested logic in `src/lib/` (`sm2.js`, `queue.js`, `streak.js`, `dates.js`, `storage.js`)
- State in a small composable (`src/composables/useStore.js`), swipe handling in `useSwipe.js`
- Styled with its own dark "Nocturne" theme: self-hosted [Sora](https://fonts.google.com/specimen/Sora), [Inter](https://rsms.me/inter/) and [JetBrains Mono](https://www.jetbrains.com/lp/mono/), plus original stroke icons

```
src/
  data/        deck.json, tactics.js
  lib/         sm2, queue, streak, dates, storage
  composables/ useStore, useSwipe
  components/  CardView, ProgressView, SettingsView, EmptyState, Icon
test/          core.test.js (node:test)
SPEC.md        full spec and the ambiguities we resolved
```

See [`SPEC.md`](SPEC.md) for the complete behavior spec and design decisions.

---

Happy hunting. 🕵️
