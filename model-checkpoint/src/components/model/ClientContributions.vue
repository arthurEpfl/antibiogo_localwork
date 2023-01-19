<template>
  <ContentCard>
    <template #title>
      Client Contributions
    </template>
    <template #content>
      <div class="flex flex-col items-center gap-6">
        <CustomButton @click="updateClientContributions">
          Fetch Contributions
        </CustomButton>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <span class="col-span-2 block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
          <StatsRow
            :total="totalClients"
            unit="client"
            unit-plural="clients"
            per="client"
          >
            <template #text>
              Number of clients in this round.<br>Clients can contribute multiple times.
            </template>
            <template #icon>
              <PeopleIcon />
            </template>
          </StatsRow>
          <span class="col-span-2 block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
          <StatsRow
            :total="totalContribs"
            :average="avgContribs"
            unit="contribution"
            unit-plural="contributions"
            per="client"
          >
            <template #text>
              Number of contributions in this round.<br>Clients can contribute multiple times.
            </template>
            <template #icon>
              <ModelIcon />
            </template>
          </StatsRow>
          <span class="col-span-2 block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
          <StatsRow
            :total="totalNewCounts"
            :average="avgNewCounts"
            :max-y="maxNewCounts"
            unit="sample"
            unit-plural="samples"
            per="contribution"
          >
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

import PeopleIcon from '@/assets/svg/PeopleIcon.vue'
import ModelIcon from '@/assets/svg/ModelIcon.vue'

const settingsStore = useSettingsStore()

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

const totalClients = computed(() => contributions.value?.size ?? 0)

const totalContribs = computed(() => contributions.value?.size ?? 0)

const avgContribs = computed(() => totalContribs.value / Math.max(1, totalContribs.value))

const totalNewCounts = computed(() => contributions
  .value?.map((centroids) => centroids.counts
    // .map((count, idx) => count - (model.value?.counts[idx] ?? 0))
    .reduce((acc: number, count) => acc + count)
  ).reduce((acc: number, count) => acc + count) ?? 0)

const avgNewCounts = computed(() => totalNewCounts.value / Math.max(1, totalContribs.value))

const maxNewCounts = computed(() => List(contributions.value).map((c) => List(c.counts).max()).max() ?? 0)
</script>
