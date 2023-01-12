<template>
  <div class="contents">
    <ContentCard>
      <template #title>Aggregate or Discard Client Contributions</template>
      <template #content>
        <div class="flex flex-col items-center gap-8">
          <div class="text-center space-y-4">
            <p>Confirm the <span class="italic">server</span> model update by aggregating contributions received from clients, or discard them</p>
            <p class="text-red-500 font-bold">Discarding the client contributions is not reversible as of yet</p>
            <p>Aggregating the contributions will effectively update the model, whereas discarding them will leave the model as is</p>
          </div>
          <div class="grid grid-cols-2 gap-16">
            <CustomButton @click="aggregate">Aggregate</CustomButton>
            <CustomButton @click="discard">Discard</CustomButton>
          </div>
        </div>
      </template>
    </ContentCard>
    <ContentCard>
      <template #title>Server Model</template>
      <template #content>
        <div class="flex flex-col items-center gap-8">
          <p>
            Test
          </p>
        </div>
      </template>
    </ContentCard>
    <ContentCard>
      <template #title>
        Client Contributions
      </template>
      <template #content>
        <div class="flex flex-col items-center gap-8">
          <CustomButton @click="updateClientContributions">
            Fetch Contributions
          </CustomButton>
          <SlideButton @toggle="toggle">
            <p class="grid grid-cols-2">
              <span class="text-right">Showing&nbsp;</span>
              <span class="text-left underline" v-if="showTotal">total amounts</span>
              <span class="text-left underline" v-else>average per client</span>
            </p>
          </SlideButton>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <StatsRow :total="nbrTotalContribs" :average="nbrAvgContribs" :showTotal="showTotal">
              <template #text>
                Number of contributions in this round<br>Clients can contribute multiple times  
              </template>
              <template #icon>
                <ModelIcon />
              </template>
            </StatsRow>
            <StatsRow :total="nbrTotalClients" :average="nbrAvgClients" :showTotal="showTotal">
              <template #text>
                Number of clients in this round<br>Clients can contribute multiple times
              </template>
              <template #icon>
                <PeopleIcon />
              </template>
            </StatsRow>
            <StatsRow :total="nbrTotalNewCounts" :average="nbrAvgNewCounts" :showTotal="showTotal">
              <template #text>
                Number of visited samples in this round
              </template>
              <template #icon>
                <ModelIcon />
              </template>
            </StatsRow>
          </div>
        </div>
      </template>
    </ContentCard>
    <ContentCard>
      <template #title>
        Centroids Delta
      </template>
      <template #content>
        Test
      </template>
    </ContentCard>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { List } from 'immutable'
import axios from 'axios'

import { useSettingsStore } from '@/stores/settings'
import notify from '@/notify'

import ContentCard from '@/components/ContentCard.vue'
import CustomButton from '@/components/button/CustomButton.vue'
import StatsRow from '@/components/StatsRow.vue'
import SlideButton from '@/components/button/SlideButton.vue'

import PeopleIcon from '@/assets/svg/PeopleIcon.vue'
import ModelIcon from '@/assets/svg/ModelIcon.vue'

const settingsStore = useSettingsStore()

async function aggregate (): Promise<void> {
  let response
  try {
    response = await axios.get(settingsStore.serverEndpoint.href)
  } catch (e: any) {
    notify.error(e)
    return
  }

  if (response.status === 200) {
    notify.success()
  } else {
    notify.error()
  }
}

const showTotal = ref(true)

let model = reactive<any>(await fetchServerModel() ?? {})
let contributions = reactive<List<any>>(await fetchClientContributions() ?? List())

function toggle (): void {
  showTotal.value = !showTotal.value
}

function discard (): void {
  notify.success('Successfully discarded contributions')
}

async function fetchClientContributions (): Promise<List<any> | undefined> {
  let response
  try {
  response = await axios.get(new URL('antibiogo/centroids', settingsStore.serverEndpoint).href)
  } catch (e) {
    notify.error('Could not fetch client contributions')
    return undefined
  }

  const raw = response.data
  // TODO: check elements for isCentroids
  if (!(Array.isArray(raw))) {
    throw new Error()
  }
  
  const centroids = List(raw).map((e) => {
    return {
      positions: e._positions,
      radius: e._radius,
      counts: e._couns,
      labels: e._labels
    }
  })
  
  notify.success('Successfully fetched contributions')
  return centroids
}

async function updateClientContributions (): Promise<void> {
  const fetchedContributions = await fetchClientContributions()
  if (fetchedContributions !== undefined) {
    contributions = fetchedContributions
  }
}

async function fetchServerModel (): Promise<List<any>| undefined> {
  return undefined
}

const nbrTotalContribs = computed(() => {
  return contributions.size
})
const nbrAvgContribs = computed(() => {
  return 0
})

const nbrTotalClients = computed(() => {
  return 0
})
const nbrAvgClients = computed(() => {
  return 0
})

const nbrTotalNewCounts = computed(() => {
  return 0
})
const nbrAvgNewCounts = computed(() => {
  return 0
})
</script>
