<template>
  <ContentCard>
    <template #title>
      Server Model
    </template>
    <template #content>
      <div class="flex flex-col items-center gap-6">
        <CustomButton @click="updateServerModel">
          Fetch Model
        </CustomButton>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <span class="col-span-2 block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
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
          <span class="col-span-2 block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
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
import { computed, ref } from 'vue'
import axios from 'axios'

import { msf } from 'epfl-antibiogo-lib'

import { useSettingsStore } from '@/stores/settings'
import notify from '@/notify'

import ContentCard from '@/components/ContentCard.vue'
import CustomButton from '@/components/button/CustomButton.vue'
import StatsRow from '@/components/StatsRow.vue'

import PeopleIcon from '@/assets/svg/PeopleIcon.vue'
import ModelIcon from '@/assets/svg/ModelIcon.vue'
import { List } from 'immutable'

const settingsStore = useSettingsStore()

const model = ref<msf.Centroids | undefined>(await fetchServerModel())

async function fetchServerModel(): Promise<msf.Centroids | undefined> {
  let response
  try {
    response = await axios.get(new URL('tasks/antibiogo', settingsStore.serverEndpoint).href)
  } catch (e: any) {
    notify.error(e)
    return undefined
  }

  const raw = response.data

  let centroids
  try {
    // TODO: for lack of better type checking
    centroids = msf.serialization.weights.decodeCentroids(raw)
  } catch (e) {
    notify.error('Could not parse fetched model')
  }

  notify.success('Successfully fetched model')
  return centroids
}

async function updateServerModel(): Promise<void> {
  const fetchedModel = await fetchServerModel()
  if (fetchedModel !== undefined) {
    model.value = fetchedModel
  }
}

const totalCentroids = computed(() => model.value?.labels.length ?? 0)

const totalCounts = computed(() => model.value?.counts.reduce((acc: number, count) => acc + count) ?? 0)

const avgCounts = computed(() => totalCounts.value / Math.max(1, totalCentroids.value))

const maxCounts = computed(() => List(model.value?.counts).max())

const maxCountsLabel = computed(() => {
  if (maxCounts.value === undefined) {
    return undefined
  }
  const idx = model.value?.counts.indexOf(maxCounts.value)
  return idx !== -1 && idx !== undefined
    ? model.value?.labels[idx]
    : undefined
})

const minCounts = computed(() => 
  List(model.value?.counts).min())
const minCountsLabel = computed(() => {
  if (minCounts.value === undefined) {
    return undefined
  }
  const idx = model.value?.counts.indexOf(minCounts.value)
  return idx !== -1 && idx !== undefined
    ? model.value?.labels[idx]
    : undefined
})
</script>
