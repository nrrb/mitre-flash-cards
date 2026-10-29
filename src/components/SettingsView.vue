<script setup>
import { ref } from 'vue'
import { useStore } from '../composables/useStore.js'
import { today } from '../lib/dates.js'
import Icon from './Icon.vue'

defineEmits(['back'])

const { state, setNewPerDay, reset, importState, exportJSON } = useStore()
const confirming = ref(false)
const message = ref('')

const onNewPerDay = (e) => {
  const n = Number(e.target.value)
  if (Number.isInteger(n) && n >= 1 && n <= 20) setNewPerDay(n)
}

const doReset = () => {
  reset()
  confirming.value = false
  message.value = 'Progress reset.'
}

const doExport = () => {
  const url = URL.createObjectURL(new Blob([exportJSON()], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `attck-cards-${today()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const doImport = async (e) => {
  const file = e.target.files[0]
  e.target.value = ''
  message.value = importState(await file.text()) ? 'Progress imported.' : 'Import failed: not a valid attck-cards export.'
}
</script>

<template>
  <header class="bar">
    <button class="icon" aria-label="Back" data-testid="back" @click="$emit('back')"><Icon name="back" /></button>
    <h1 class="title">Settings</h1>
    <span class="spacer"></span>
  </header>

  <main class="body">
    <label class="row glass">
      New cards per day
      <input type="number" min="1" max="20" :value="state.settings.newPerDay" data-testid="new-per-day" @change="onNewPerDay" />
    </label>

    <button class="row-btn" data-testid="export" @click="doExport">Export progress</button>
    <label class="row-btn file">
      Import progress
      <input type="file" accept="application/json,.json" hidden data-testid="import" @change="doImport" />
    </label>

    <div v-if="!confirming">
      <button class="row-btn danger" data-testid="reset" @click="confirming = true">Reset progress</button>
    </div>
    <div v-else class="confirm">
      <span>Erase all progress?</span>
      <button class="danger" data-testid="reset-confirm" @click="doReset">Erase</button>
      <button data-testid="reset-cancel" @click="confirming = false">Cancel</button>
    </div>

    <p v-if="message" class="msg" data-testid="message">{{ message }}</p>
  </main>
</template>

<style scoped>
.title {
  margin: 0;
  font-size: 1.125rem;
}
.spacer {
  width: 40px;
}
.body {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 0.875rem;
  color: var(--text-muted);
}
input[type='number'] {
  width: 72px;
}
.row-btn {
  display: block;
  width: 100%;
  text-align: center;
}
.file {
  display: block;
  text-align: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text);
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-btn);
  padding: 9px 20px;
  cursor: pointer;
  transition: all 140ms ease;
}
.file:hover {
  background: var(--surface-3);
  border-color: var(--action);
}
.confirm {
  display: flex;
  align-items: center;
  gap: 8px;
}
.confirm span {
  flex: 1;
  font-size: 0.875rem;
}
.msg {
  margin: 0;
  font: 500 12px var(--font-mono);
  color: var(--text-muted);
}
</style>
