<template>
  <ContentCard>
    <template #title>
      Centroids Delta
    </template>
    <template #content v-if="serverModel !== undefined">
      <div class="flex flex-col items-center gap-6">
        <h2 class="text-lg font-bold uppercase text-center">
          Sample Counts
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-center w-full">
          <div
            v-for="label in labels"
            :key="label" class="contents space-x-4"
          >
            <p class="text-right">{{ label }}</p><p>4</p>
          </div>
        </div>
        <h2 class="text-lg font-bold uppercase text-center">
          Centroid Positions
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-center w-full">
          <div
            v-for="(position, idx) in positions"
            :key="idx"
          >
            {{ position }}
          </div>
        </div>
      </div>
    </template>
  </ContentCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { List } from 'immutable'

import type { msf } from 'epfl-antibiogo-lib'

import type { Weights } from '@/types'

import ContentCard from '@/components/ContentCard.vue'
import StatsRow from '@/components/StatsRow.vue'
import HorizontalLine from '@/components/HorizontalLine.vue'

export interface Props {
  serverModel?: msf.Centroids
  serverModelWeights?: Weights
  clientContributions?: List<msf.Centroids>
  clientContributionsWeights?: List<Weights>
}
const props = defineProps<Props>()

const labels = computed(() => List(props.serverModel?.labels).sort())
const positions = computed(() =>
  props.serverModelWeights
    ?.map((t) => t.join(','))
    .sortBy((t, idx) => labels.value.get(idx)))
</script>
