<template>
  <ContentCard>
    <template #title>
      Client Contributions
    </template>
    <template #content>
      <div class="flex flex-col items-center gap-8">
        <CustomButton @click="updateClientContributions">
          Fetch Contributions
        </CustomButton>
        <SlideButton @toggle="toggleContribStats">
          <p class="grid grid-cols-2">
            <span class="text-right">Showing&nbsp;</span>
            <span class="text-left underline" v-if="showTotalContribStats">total amounts</span>
            <span class="text-left underline" v-else>average per client</span>
          </p>
        </SlideButton>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <StatsRow :total="nbrTotalClients" unit="client" unit-plural="clients" per="client">
            <template #text>
              Number of clients in this round.<br>Clients can contribute multiple times.
            </template>
            <template #icon>
              <PeopleIcon />
            </template>
          </StatsRow>
          <StatsRow :total="nbrTotalContribs" :average="nbrAvgContribs" :showTotal="showTotalContribStats"
            unit="contribution" unit-plural="contributions" per="client">
            <template #text>
              Number of contributions in this round.<br>Clients can contribute multiple times.
            </template>
            <template #icon>
              <ModelIcon />
            </template>
          </StatsRow>
          <StatsRow :total="nbrTotalNewCounts" :average="nbrAvgNewCounts" :showTotal="showTotalContribStats" unit="sample"
            unit-plural="samples" per="contribution">
            <template #text>
              Number of visited samples in this round.
            </template>
            <template #icon>
              <ModelIcon />
            </template>
          </StatsRow>
        </div>
      </div>
    </template>
  </ContentCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { List } from 'immutable'
import axios from 'axios'

import { useSettingsStore } from '@/stores/settings'
import notify from '@/notify'

import { msf } from 'epfl-antibiogo-lib'

import ContentCard from '@/components/ContentCard.vue'
import CustomButton from '@/components/button/CustomButton.vue'
import StatsRow from '@/components/StatsRow.vue'
import SlideButton from '@/components/button/SlideButton.vue'

import PeopleIcon from '@/assets/svg/PeopleIcon.vue'
import ModelIcon from '@/assets/svg/ModelIcon.vue'

const settingsStore = useSettingsStore()

const showTotalContribStats = ref(true)
const contributions = ref<List<msf.Centroids> | undefined>(await fetchClientContributions())

async function fetchClientContributions(): Promise<List<msf.Centroids> | undefined> {
  let response
  try {
    response = await axios.get(new URL('antibiogo/centroids', settingsStore.serverEndpoint).href)
  } catch (e: any) {
    notify.error(e)
    return undefined
  }

  const raw = response.data
  // TODO: check elements for isCentroids
  if (!(Array.isArray(raw))) {
    throw new Error()
  }

  let centroids
  try {
    // TODO: for lack of better type checking
    centroids = List(raw).map((e) => msf.serialization.weights.decodeCentroids(e.centroids))
  } catch (e: any) {
    notify.error('Could not parse fetched contributions')
    return
  }

  notify.success('Successfully fetched contributions')
  return centroids
}

async function updateClientContributions(): Promise<void> {
  const fetchedContributions = await fetchClientContributions()
  if (fetchedContributions !== undefined) {
    contributions.value = fetchedContributions
  }
}

function toggleContribStats(): void {
  showTotalContribStats.value = !showTotalContribStats.value
}

// total number of contributors (clients)
const nbrTotalClients = computed(() => contributions.value?.size ?? 0)
// total number of contributions
const nbrTotalContribs = computed(() => contributions.value?.size ?? 0)
// average number of contributions per client
const nbrAvgContribs = computed(() => nbrTotalContribs.value / Math.max(1, nbrTotalContribs.value))
// total number of samples used by contributors
const nbrTotalNewCounts = computed(() => contributions
  .value?.map((centroids) => centroids.counts
    // .map((count, idx) => count - (model.value?.counts[idx] ?? 0))
    .reduce((acc: number, count) => acc + count)
  ).reduce((acc: number, count) => acc + count) ?? 0)
// average number of samples used by contributors
const nbrAvgNewCounts = computed(() =>
  nbrTotalNewCounts.value / Math.max(1, nbrTotalContribs.value))
</script>
