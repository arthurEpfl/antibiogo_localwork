<template>
  <ContentCard>
    <template #title>
      Server Model
    </template>
    <template #content>
      <div class="flex flex-col items-center gap-6">
        <CustomButton @click="emit('update')">
          Fetch Model
        </CustomButton>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <HorizontalLine class="col-span-2" />
          <StatsRow
            :total="totalCentroids"
            unit="centroid"
            unit-plural="centroids"
            per="centroid"
          >
            <template #text>
              Current number of centroids.<br>There is one centroid per class.
            </template>
            <template #icon>
              <ModelIcon />
            </template>
          </StatsRow>
          <HorizontalLine class="col-span-2" />
          <StatsRow
            :total="totalCounts"
            :average="avgCounts"
            :max-y="maxCounts"
            :max-x="maxCountsLabel"
            :min-y="minCounts"
            :min-x="minCountsLabel"
            unit="sample"
            unit-plural="samples"
            per="centroid"
          >
            <template #text>
              Current number of samples per centroid.<br>Samples are used to compute centroids.
            </template>
            <template #icon>
              <PeopleIcon />
            </template>
          </StatsRow>
        </div>
      </div>
    </template>
  </ContentCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { List } from 'immutable'

import type { msf } from 'epfl-antibiogo-lib'

import ContentCard from '@/components/ContentCard.vue'
import CustomButton from '@/components/button/CustomButton.vue'
import StatsRow from '@/components/StatsRow.vue'
import HorizontalLine from '@/components/HorizontalLine.vue'

import PeopleIcon from '@/assets/svg/PeopleIcon.vue'
import ModelIcon from '@/assets/svg/ModelIcon.vue'

export interface Props {
  model: msf.centroids.Centroids | undefined
}
const props = defineProps<Props>()

interface Emits {
  (e: 'update'): void
}
const emit = defineEmits<Emits>()

const totalCentroids = computed(() => props.model?.labels.length ?? 0)

const totalCounts = computed(() => props.model?.counts.reduce((acc: number, count) => acc + count) ?? 0)

const avgCounts = computed(() => totalCounts.value / Math.max(1, totalCentroids.value))

const maxCounts = computed(() => List(props.model?.counts).max())

const maxCountsLabel = computed(() => {
  if (maxCounts.value === undefined) {
    return undefined
  }
  const idx = props.model?.counts.indexOf(maxCounts.value)
  return idx !== -1 && idx !== undefined
    ? props.model?.labels[idx]
    : undefined
})

const minCounts = computed(() => 
  List(props.model?.counts).min())
const minCountsLabel = computed(() => {
  if (minCounts.value === undefined) {
    return undefined
  }
  const idx = props.model?.counts.indexOf(minCounts.value)
  return idx !== -1 && idx !== undefined
    ? props.model?.labels[idx]
    : undefined
})
</script>
