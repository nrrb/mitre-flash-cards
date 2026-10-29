# attck-cards

Static Vue 3 + Vite PWA: spaced-repetition flashcards for recognizing MITRE ATT&CK techniques in Windows telemetry. See `SPEC.md`.

## Conventions
- Vue 3 Composition API, `<script setup>` only. Use `ref`, never `reactive`.
- JavaScript only, no TypeScript. Single quotes, no semicolons.
- Plain CSS or scoped SFC styles. No UI framework, no Tailwind. Use the Nocturne tokens in `src/style.css`; no emoji or unicode icons, only the SVGs in `src/assets/icons`; severity colors are for severity only.
- State via composables with module-level refs. No Pinia.
- All persistence goes through `src/lib/storage.js`, one key `attck-cards:v1`. Every read/write in try/catch. App must render with empty or corrupt storage.
- `data-testid` (kebab-case, e.g. `grade-pass`) on every interactive element. `npm run build -- --mode release` strips them.
- No runtime network: no fetch, analytics, notifications, or remote fonts. ATT&CK data is bundled only.
- Deck is `src/data/deck.json`. Adding a card = adding an object, no code change.
- No defensive null-checking for values guaranteed by the data model or component contract. Guard only untrusted input (localStorage, imported JSON).
- Commit messages: single line, past tense, no body.

## Commands
- `npm run dev`
- `npm test` (node:test, no deps)
- `npm run build` (must have zero warnings)
- `npm run build -- --mode release` (bundle must contain zero `data-testid`)
