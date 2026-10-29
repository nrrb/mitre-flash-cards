<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from '../composables/useStore.js'
import { useSwipe } from '../composables/useSwipe.js'
import { TACTICS } from '../data/tactics.js'
import EmptyState from './EmptyState.vue'
import Icon from './Icon.vue'

defineEmits(['progress'])

const { current, hasUnseen, grade, pullNew } = useStore()
const flipped = ref(false)
const tacticLinks = computed(() => TACTICS.filter((t) => current.value.tactics.includes(t.name)))

watch(current, () => {
  flipped.value = false
})

const flip = () => {
  flipped.value = !flipped.value
}
const submit = (passed) => {
  if (flipped.value) grade(passed)
}
const { dx, handlers } = useSwipe({ onTap: flip, onSwipe: submit })
</script>

<template>
  <header class="bar">
    <span class="brand">attck-cards</span>
    <button class="icon" aria-label="Progress" data-testid="open-progress" @click="$emit('progress')"><Icon name="dashboard" /></button>
  </header>

  <EmptyState v-if="!current" :has-unseen="hasUnseen" @pull="pullNew" />

  <template v-else>
    <main class="stage">
      <div
        class="card glass"
        :class="{ flipped }"
        :style="{ transform: `translateX(${dx}px) rotate(${dx / 30}deg)` }"
        data-testid="card"
        v-bind="handlers"
      >
        <template v-if="!flipped">
          <div class="overline">Log sample</div>
          <pre class="log">{{ current.logSample }}</pre>
        </template>
        <div v-else class="answer">
          <div class="overline">{{ current.techniqueId }}</div>
          <h2>{{ current.techniqueName }}</h2>
          <div class="tactic">
            <a v-for="t in tacticLinks" :key="t.name" :href="t.url" target="_blank" rel="noopener" data-testid="tactic-link" @pointerdown.stop @pointerup.stop>{{ t.name }}</a>
          </div>
          <p><b class="overline">Why</b> {{ current.why }}</p>
          <p><b class="overline">False positive</b> {{ current.falsePositive }}</p>
          <a :href="current.url" target="_blank" rel="noopener" data-testid="mitre-link" @click.stop @pointerdown.stop @pointerup.stop>View on MITRE ATT&amp;CK</a>
        </div>
        <div class="hint">{{ flipped ? 'tap to flip back' : 'tap to reveal' }}</div>
      </div>
    </main>

    <footer class="grades">
      <button class="danger" :disabled="!flipped" data-testid="grade-fail" @click="submit(false)">Missed</button>
      <button class="primary" :disabled="!flipped" data-testid="grade-pass" @click="submit(true)">Got it</button>
    </footer>
  </template>
</template>

<style scoped>
.brand {
  font-family: var(--font-display);
  font-size: 0.875rem;
  letter-spacing: -0.01em;
  color: var(--text-muted);
}
.stage {
  flex: 1;
  min-height: 0;
  display: flex;
  padding: 0 16px;
}
.card {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 20px 36px;
  touch-action: pan-y;
  user-select: none;
  cursor: pointer;
}
.log {
  margin: 10px 0 0;
  font: 500 12px/1.6 var(--font-mono);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
h2 {
  margin: 6px 0 4px;
  font-size: 1.375rem;
}
.tactic {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-bottom: 14px;
  font-size: 0.875rem;
}
.tactic a {
  color: var(--text-muted);
}
.tactic a:hover {
  color: var(--action-hover);
}
p {
  margin: 14px 0 0;
  font-size: 0.875rem;
}
b.overline {
  display: block;
  margin-bottom: 2px;
}
.hint {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  font: 500 11px var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
  pointer-events: none;
}
.grades {
  display: flex;
  gap: 12px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
}
.grades button {
  flex: 1;
  padding: 14px;
  font-size: 1rem;
}
</style>
