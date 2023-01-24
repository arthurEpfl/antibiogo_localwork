<template>
  <img
    src="https://storage.googleapis.com/deai-313515.appspot.com/logos/MLO_logo.png"
    :height="props.size"
    :width="4 * props.size"
  >
</template>

<script setup lang="ts">
export interface Props {
  size: number
}
const props = defineProps<Props>()
</script>
