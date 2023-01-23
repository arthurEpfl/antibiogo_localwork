<template>
  <ContentCard>
    <template #title>
      Centroids Delta
    </template>
    <template #content v-if="model !== undefined">
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
        <HorizontalLine />
        <h2 class="text-lg font-bold uppercase text-center">
          Centroid Positions
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-center w-full">
          <div
            v-for="([label, distance], idx) in positionsDelta"
            :key="idx"
            class="contents space-x-4"
          >
            <span>{{ label }}</span><span>{{ distance }}</span>
          </div>
        </div>
        <HorizontalLine />
        <h2 class="text-lg font-bold uppercase text-center">
          New Labels
        </h2>
        <div class="grid grid-col-2 md:grid-cols-3 lg:grid-cols-4 items-center w-full">
          <div
            v-for="(newLabel, idx) in newLabels"
            :key="idx"
          >
            {{ newLabel }}
          </div>
        </div>
      </div>
    </template>
  </ContentCard>
</template>

<script setup lang="ts">
import { computed, } from 'vue'
import { List, Map } from 'immutable'

import { msf } from 'epfl-antibiogo-lib'

import ContentCard from '@/components/ContentCard.vue'
import HorizontalLine from '@/components/HorizontalLine.vue'

export interface Props {
  model?: msf.centroids.Centroids
  contributions?: List<msf.centroids.Centroids>
}
const props = defineProps<Props>()

const labels = computed(() => List(props.model?.labels).sort())
const newLabels = computed(() => [1, 2, 3])
const positionsDelta = computed(() => Map(List(props.model?.positions.weights)
  .zip(List(aggregated.value?.positions.weights), List(props.model?.labels))
  .map(([prev, curr, label]) => [label, Math.sqrt(prev.sub(curr).norm().dataSync()[0])] as [string, number])))

// only executed client-side for visualization purposes
const aggregated = computed(() => 
  props.model !== undefined && props.contributions !== undefined
  ? msf.centroids.aggregateCentroids(props.model, props.contributions)
  : undefined)
</script>
