<script setup>
defineProps({ hasUnseen: Boolean })
defineEmits(['pull'])
</script>

<template>
  <div class="empty">
    <h1>Nothing due</h1>
    <p v-if="hasUnseen">You're caught up. Come back later, or pull new cards early.</p>
    <p v-else>You're caught up and have started every card in the deck.</p>
    <button v-if="hasUnseen" class="primary" data-testid="pull-new" @click="$emit('pull')">Pull new cards early</button>
  </div>
</template>

<style scoped>
.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  padding: 24px;
}
h1 {
  margin: 0;
  font-size: 1.75rem;
}
p {
  margin: 0;
  color: var(--text-muted);
}
</style>
