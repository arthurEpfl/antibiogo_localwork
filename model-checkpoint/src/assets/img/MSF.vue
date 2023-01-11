<template>
  <img src="./MSF_logo.png" :height="props.size" :width="2 * props.size">
</template>

<script setup lang="ts">
export interface Props {
  size: number
}
const props = defineProps<Props>()
</script>
