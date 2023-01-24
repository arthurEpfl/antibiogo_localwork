<template>
  <ContentCard>
    <template #title>
      Centroids Delta
    </template>
    <template #content v-if="model !== undefined && contributions !== undefined">
      <div class="flex flex-col items-center gap-6">
        <h2 class="text-lg font-bold uppercase text-center">
          Sample Counts
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 items-center w-full">
          <div
            v-for="([label, count]) in countsDelta"
            :key="label" class="contents space-x-4"
          >
            <p class="text-right">{{ label }}</p><p>{{ count }}</p>
          </div>
        </div>
        <HorizontalLine />
        <h2 class="text-lg font-bold uppercase text-center">
          Centroid Positions
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 justify-items-center items-center w-full">
          <p
            v-for="([label, distance], idx) in positionsDelta"
            :key="idx"
          >
            <span class="text-sm">&Delta;Distance: </span>
            <span class="text-lg">{{ label }} &#8594; {{ distance }}</span>
          </p>
        </div>
        <HorizontalLine />
        <h2 class="text-lg font-bold uppercase text-center">
          New Labels
        </h2>
        <div
          v-if="newLabels.size > 0"
          class="grid grid-col-2 md:grid-cols-3 lg:grid-cols-4 items-center w-full"
        >
          <div
            v-for="(newLabel, idx) in newLabels"
            :key="idx"
          >
            {{ newLabel }}
          </div>
        </div>
        <div v-else>
          No new label
        </div>
      </div>
    </template>
    <template #content v-else>
      <p class="text-center">
        Could not fetch the server model and client contributions.
      </p>
    </template>
  </ContentCard>
</template>

<script setup lang="ts">
import { computed, } from 'vue'
import { List, Map } from 'immutable'

import { msf } from 'epfl-antibiogo-lib'

import { formatNumber } from '@/utils'
import ContentCard from '@/components/ContentCard.vue'
import HorizontalLine from '@/components/HorizontalLine.vue'

export interface Props {
  model?: msf.centroids.Centroids
  contributions?: List<msf.centroids.Centroids>
}
const props = defineProps<Props>()

const countsDelta = computed(() => Map(List(props.model?.labels)
  .zip(List(props.model?.counts), List(aggregated.value?.counts))
  .map(([label, prev, curr]) => [label, curr - prev] as [string, number])
  .filter(([_, count]) => count > 0)))

const newLabels = computed(() => List())

const positionsDelta = computed(() => Map(List(props.model?.positions.weights)
.zip(List(aggregated.value?.positions.weights), List(props.model?.labels))
.map(([prev, curr, label]) => [label, Math.sqrt(prev.sub(curr).norm().dataSync()[0])] as [string, number])
.filter(([_, distance]) => distance > 0)
.map(([label, distance]) => [label, formatNumber(distance, 8)])))

// only executed client-side for visualization purposes
const aggregated = computed(() => 
  props.model !== undefined && props.contributions !== undefined
  ? msf.centroids.aggregateCentroids(props.model, props.contributions)
  : undefined)
</script>
