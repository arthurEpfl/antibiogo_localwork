<template>
  <div class="contents">
    <p class="p-4 bg-zinc-100 rounded-lg text-center">
      <slot name="text" />
    </p>
    <div class="grid grid-cols-2 items-center text-4xl gap-4">
      <p class="text-right">{{ formatNumber(props.total) }}</p>
      <p class="text-left text-sm">total {{ displayUnit(props.total) }}</p>
      <div v-if="props.average !== undefined" class="contents">
        <p class="text-right">{{ formatNumber(props.average) }}</p>
        <p class="text-left text-sm">{{ displayUnit(props.average) }}<span v-if="props.per !== undefined"> per {{ props.per }}</span></p>
      </div>
      <div v-if="props.maxY !== undefined" class="contents">
        <p class="text-right">{{ formatNumber(props.maxY) }}</p>
        <p class="text-left text-sm">
          {{ displayUnit(props.total) }} <span v-if="props.maxX" class="text-sm"> from {{ props.maxX.slice(0, LABEL_MAX_LENGTH) }}</span>
        </p>
      </div>
      <div v-if="props.minY !== undefined" class="contents">
        <p class="text-right">{{ formatNumber(props.minY) }}</p>
        <p class="text-left text-sm">
          {{ displayUnit(props.total) }} <span v-if="props.minX" class="text-sm"> from {{ props.minX.slice(0, LABEL_MAX_LENGTH) }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatNumber } from '@/utils'
const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  average: {
    type: Number,
    required: false
  },
  maxY: {
    type: Number,
    required: false
  },
  maxX: {
    type: String,
    required: false
  },
  minY: {
    type: Number,
    required: false
  },
  minX: {
    type: String,
    required: false
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
    required: false
  }
})

const LABEL_MAX_LENGTH = 6

function displayUnit (amount: number): string {
  return amount <= 1 || props.unitPlural === undefined ? props.unit : props.unitPlural
}
</script>
