<template>
  <nav class="flex flex-wrap gap-16">
    <NavButton route="/">Home</NavButton>
    <NavButton route="/about">About</NavButton>
    <NavButton route="/aggregate">Aggregate</NavButton>
    <NavButton route="/help">Help</NavButton>
  </nav>
</template>

<script setup lang="ts">
import NavButton from './NavButton.vue'
</script>
