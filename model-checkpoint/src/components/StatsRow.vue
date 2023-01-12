<template>
  <div class="contents">
    <p class="p-4 bg-zinc-100 rounded-lg text-center">
      <slot name="text" />
    </p>
    <div class="flex flex-col items-center">
      <slot name="icon" />
      <p class="text-4xl text-center space-x-4">
        <span v-if="props.showTotal">
          {{ props.total }}
        </span>
        <span class="flex items-center gap-2" v-else>
          {{ props.average }}<span class="text-sm">per client</span>
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  total: number
  average: number
  showTotal: boolean
}

const props = defineProps<Props>()
</script>
