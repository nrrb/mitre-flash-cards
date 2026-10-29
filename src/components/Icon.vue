<script setup>
import back from '../assets/icons/icon-back.svg?raw'
import settings from '../assets/icons/icon-settings.svg?raw'
import dashboard from '../assets/icons/icon-dashboard.svg?raw'

const icons = { back, settings, dashboard }
defineProps({ name: String })
</script>

<template>
  <span class="icon-svg" aria-hidden="true" v-html="icons[name]"></span>
</template>

<style scoped>
.icon-svg {
  display: block;
  width: 1.1em;
  height: 1.1em;
}
.icon-svg :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
