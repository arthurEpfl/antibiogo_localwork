<template>
  <img src="./MSF_logo.png" :width="props.width" :height="props.height">
</template>

<script setup lang="ts">
export interface Props {
  width: number
  height: number
}
const props = defineProps<Props>()
</script>
