<template>
  <div class="contents">
    <p class="p-4 bg-zinc-100 rounded-lg text-center">
      <slot name="text" />
    </p>
    <div class="flex flex-col items-center">
      <slot name="icon" />
      <p class="text-4xl text-center space-x-4">
        <span v-if="props.showTotal" class="flex items-center gap-2">
          {{ formatNumber(props.total) }} <span class="text-sm">{{ displayUnit(props.total) }}</span>
        </span>
        <span v-else class="flex items-center gap-2">
          {{ formatNumber(props.average) }} <span class="text-sm">{{ displayUnit(props.average) }} per {{ props.per }}</span>
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  average: {
    type: Number,
    default: 0
  },
  showTotal: {
    type: Boolean,
    default: true
  },
  unit: {
    type: String,
    required: true
  },
  unitPlural: {
    type: String,
    required: false
  },
  per: {
    type: String,
    required: true
  }
})

function formatNumber(nbr: number, decimals: number = 1) {
  let [integer, float] = nbr.toString().split('.')
  if (integer.length >= 5) {
    integer = integer.replace(/(\d)(?=(\d{3})+$)/g, '$1 ')
  }
  if (float !== undefined) {
    float = float.slice(0, decimals)
    return [integer, float].join('.')
  } else {
    return integer
  }
}

function displayUnit (amount: number): string {
  return amount <= 1 || props.unitPlural === undefined ? props.unit : props.unitPlural
}
</script>
