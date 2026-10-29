<script setup>
import { ref, computed } from 'vue'
import { useStore } from '../composables/useStore.js'
import { TACTICS } from '../data/tactics.js'
import { statusOf } from '../lib/sm2.js'
import Icon from './Icon.vue'

defineEmits(['back', 'settings'])

const { deck, state, counts, streakCount } = useStore()
const selected = ref(null)

const columns = computed(() =>
  TACTICS.map((t) => ({
    name: t.name,
    url: t.url,
    cells: deck.filter((c) => c.tactic === t.name).map((c) => ({ card: c, status: statusOf(state.value.cards[c.id]) }))
  }))
)

const stats = computed(() => state.value.cards[selected.value.id])
</script>

<template>
  <header class="bar">
    <button class="icon" aria-label="Back" data-testid="back" @click="$emit('back')"><Icon name="back" /></button>
    <h1 class="title">Progress</h1>
    <button class="icon" aria-label="Settings" data-testid="open-settings" @click="$emit('settings')"><Icon name="settings" /></button>
  </header>

  <main class="body">
    <section class="tiles">
      <div class="tile glass"><b data-testid="streak">{{ streakCount }}</b><span class="overline">streak</span></div>
      <div class="tile glass"><b>{{ counts.new }}</b><span class="overline">new</span></div>
      <div class="tile glass"><b>{{ counts.learning }}</b><span class="overline">learning</span></div>
      <div class="tile glass"><b>{{ counts.mastered }}</b><span class="overline">mastered</span></div>
    </section>

    <h3 class="overline">Tactic map</h3>
    <div class="map">
      <div v-for="col in columns" :key="col.name" class="col">
        <a class="head" :href="col.url" target="_blank" rel="noopener" :data-testid="`tactic-${col.name}`">{{ col.name }}</a>
        <div class="cells">
          <button
            v-for="cell in col.cells"
            :key="cell.card.id"
            class="cell"
            :class="cell.status"
            :aria-label="`${cell.card.techniqueId} ${cell.status}`"
            :data-testid="`cell-${cell.card.id}`"
            @click="selected = cell.card"
        ></button>
        </div>
      </div>
    </div>
    <div class="legend"><i class="cell new"></i>new <i class="cell learning"></i>started <i class="cell mastered"></i>mastered</div>

    <section v-if="selected" class="detail glass" data-testid="card-stats">
      <div class="overline">{{ selected.techniqueId }}</div>
      <strong>{{ selected.techniqueName }}</strong>
      <div class="muted">{{ selected.tactics.join(' · ') }}</div>
      <a :href="selected.url" target="_blank" rel="noopener" data-testid="stats-mitre-link">View on MITRE ATT&amp;CK</a>
      <p v-if="!stats" class="muted">Not started yet.</p>
      <p v-else class="muted">
        Interval {{ stats.interval }}d · ease {{ stats.ease.toFixed(2) }} · reps {{ stats.reps }}<br />
        Due {{ stats.dueDate }} · last reviewed {{ stats.lastReviewed }}
      </p>
    </section>
  </main>
</template>

<style scoped>
.title {
  margin: 0;
  font-size: 1.125rem;
}
.body {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 24px;
}
.tiles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.tile {
  padding: 12px 4px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tile b {
  font: 600 1.75rem/1.15 var(--font-display);
  letter-spacing: -0.02em;
}
.tile .overline {
  color: var(--text-subtle);
  font-size: 10px;
}
h3.overline {
  margin: 24px 0 8px;
  color: var(--text-subtle);
}
.map {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
}
.col {
  flex: 0 0 84px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.head {
  font-size: 0.65rem;
  color: var(--text-muted);
  min-height: 2.6em;
}
.cells {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}
.cell {
  display: block;
  width: 10px;
  height: 10px;
  padding: 0;
  border-radius: 3px;
  border: 1px solid var(--border-strong);
  background: transparent;
}
.cell.learning {
  background: rgba(var(--action-rgb), 0.35);
  border-color: var(--action);
}
.cell.mastered {
  background: var(--action);
  border-color: var(--action);
}
.legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font: 500 11px var(--font-mono);
  color: var(--text-muted);
}
.legend .cell {
  display: inline-block;
  width: 12px;
  height: 12px;
}
.detail {
  margin-top: 16px;
  padding: 16px;
}
.muted {
  color: var(--text-muted);
  font-size: 0.875rem;
}
strong {
  font-family: var(--font-display);
}
p {
  margin: 8px 0 0;
}
</style>
