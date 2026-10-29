<script setup>
import { ref } from 'vue'
import CardView from './components/CardView.vue'
import ProgressView from './components/ProgressView.vue'
import SettingsView from './components/SettingsView.vue'

const view = ref('card')
</script>

<template>
  <CardView v-if="view === 'card'" @progress="view = 'progress'" />
  <ProgressView v-else-if="view === 'progress'" @back="view = 'card'" @settings="view = 'settings'" />
  <SettingsView v-else @back="view = 'progress'" />
</template>
