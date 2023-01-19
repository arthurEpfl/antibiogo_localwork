<template>
  <ContentCard>
    <template #title>Server Model</template>
    <template #content>
      <div class="flex flex-col items-center gap-8">
        <CustomButton @click="updateServerModel">
          Fetch Model
        </CustomButton>
        <SlideButton @toggle="toggleModelStats">
          <p class="grid grid-cols-2">
            <span class="text-right">Showing&nbsp;</span>
            <span class="text-left underline" v-if="showTotalModelStats">total amounts</span>
            <span class="text-left underline" v-else>average per centroid</span>
          </p>
        </SlideButton>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <StatsRow :total="nbrTotalCentroids" unit="centroid" unit-plural="centroids" per="centroid">
            <template #text>
              Current number of centroids.<br>There is one centroid per class.
            </template>
            <template #icon>
              <ModelIcon />
            </template>
          </StatsRow>
          <StatsRow :total="nbrTotalCounts" :average="nbrAvgCounts" :showTotal="showTotalModelStats" unit="sample"
            unit-plural="samples" per="centroid">
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
import SlideButton from '@/components/button/SlideButton.vue'

import PeopleIcon from '@/assets/svg/PeopleIcon.vue'
import ModelIcon from '@/assets/svg/ModelIcon.vue'

const settingsStore = useSettingsStore()

const model = ref<msf.Centroids | undefined>(await fetchServerModel())
const showTotalModelStats = ref(true)

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

function toggleModelStats(): void {
  showTotalModelStats.value = !showTotalModelStats.value
}

// total number of centroids (labels) in this model
const nbrTotalCentroids = computed(() =>
  model.value?.labels.length ?? 0)
// total number of samples used to aggregate this model
const nbrTotalCounts = computed(() =>
  model.value?.counts.reduce((acc: number, count) => acc + count) ?? 0)
// average number of samples used to aggregate a centroid
const nbrAvgCounts = computed(() =>
  nbrTotalCounts.value / Math.max(1, nbrTotalCentroids.value))
</script>
