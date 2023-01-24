<template>
  <button class="group uppercase transition duration-300 text-red-500">
    <slot />
    <span :class="props.active ? 'max-w-full' : 'max-w-0'" class="block group-hover:max-w-full transition-all duration-500 h-1 bg-red-500" />
  </button>
</template>

<script setup lang="ts">
export interface Props {
  active: boolean
}
const props = defineProps<Props>()
</script>
