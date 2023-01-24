<template>
  <img src="./MLO_logo.png" :height="props.size" :width="4 * props.size">
</template>

<script setup lang="ts">
export interface Props {
  size: number
}
const props = defineProps<Props>()
</script>
