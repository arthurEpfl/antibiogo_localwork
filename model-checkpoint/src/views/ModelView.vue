<template>
  <div class="contents">
    <ContentCard>
      <template #title>MODEL UPDATE</template>
      <template #content>
        <div class="flex flex-col items-center gap-8">
          <div class="text-center space-y-4">
            <p>Confirm the <span class="italic">server</span> model update by aggregating contributions received from clients, or discard them</p>
            <p class="text-red-500 font-bold">Discarding the client contributions is not reversible as of yet</p>
            <p>Aggregating the contributions will effectively update the model, whereas discarding them will leave the model as is</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
            <CustomButton @click="aggregate">Aggregate</CustomButton>
            <CustomButton @click="discard">Discard</CustomButton>
          </div>
        </div>
      </template>
    </ContentCard>
    <ServerModel
      :model="model"
      @update="updateServerModel"
    />
    <ClientContributions
      :contributions="contributions"
      @update="updateClientContributions"
    />
    <CentroidsDelta
      :model="model"
      :contributions="contributions"
    />
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { List } from 'immutable'
import axios from 'axios'

import { msf, serialization } from 'epfl-antibiogo-lib'

import { useSettingsStore } from '@/stores/settings'
import notify from '@/notify'

import ServerModel from '@/components/model/ServerModel.vue'
import ClientContributions from '@/components/model/ClientContributions.vue'
import CentroidsDelta from '@/components/model/CentroidsDelta.vue'
import ContentCard from '@/components/ContentCard.vue'
import CustomButton from '@/components/button/CustomButton.vue'

const settingsStore = useSettingsStore()

// async function aggregate (): Promise<void> {
//   let response
//   try {
//     response = await axios.get(settingsStore.serverEndpoint.href)
//   } catch (e: any) {
//     notify.error(e)
//     return
//   }

//   if (response.status === 200) {
//     notify.success()
//   } else {
//     notify.error()
//   }
// }

async function aggregate (): Promise<void> {
  let response
  try {
    response = await axios.get(new URL('antibiogo/trigger-aggregation', settingsStore.serverEndpoint).href)
  } catch (e: any) {
    notify.error(`Error in /antibiogo/trigger-aggregation: ${e.message}`)
    return
  }

  if (response.status === 200) {
    notify.success('Aggregation successful')
  } else if (response.status === 503) {
    notify.error('Aggregation already in progress')
  } else {
    notify.error('Error while aggregating')
  }
}

// function discard (): void {
//   // TODO: command the server to discard contributions
//   notify.error('Not implemented')
// }

async function discard (): Promise<void> {
  let response
  try {
    response = await axios.get(new URL('antibiogo/discard', settingsStore.serverEndpoint).href)
  } catch (e: any) {
    notify.error(`Error in /antibiogo/discard: ${e.message}`)
    return
  }

  if (response.status === 200) {
    notify.success('Buffer discarded successfully')
  } else {
    notify.error('Error while discarding buffer')
  }
}

const model = shallowRef<msf.centroids.Centroids | undefined>(await fetchServerModel())
const contributions = shallowRef<List<msf.centroids.Centroids> | undefined>(await fetchClientContributions())

async function fetchClientContributions(): Promise<List<msf.centroids.Centroids> | undefined> {
  let response
  try {
    response = await axios.get(new URL('antibiogo/centroids', settingsStore.serverEndpoint).href)
  } catch (e: any) {
    notify.error(e)
    return undefined
  }

  const raw = response.data

  if (!(Array.isArray(raw) && raw.every((e) => serialization.weights.isEncoded(e)))) {
    notify.error('Could not parse fetched contributions')
    return undefined
  }

  let centroids: List<msf.centroids.Centroids>
  try {
    centroids = List(raw).map((e) => msf.serialization.weights.decodeCentroids(e))
  } catch (e: any) {
    notify.error('Could not parse fetched contributions')
    return
  }

  notify.success('Successfully fetched contributions')
  return centroids.size > 0
    ? centroids
    : undefined
}

async function fetchServerModel(): Promise<msf.centroids.Centroids | undefined> {
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
    return undefined
  }

  notify.success('Successfully fetched model')
  return centroids
}

async function updateClientContributions (): Promise<void> {
  const fetchedContributions = await fetchClientContributions()
  if (fetchedContributions !== undefined) {
    contributions.value = fetchedContributions
  }
}

async function updateServerModel (): Promise<void> {
  const fetchedModel = await fetchServerModel()
  if (fetchedModel !== undefined) {
    model.value = fetchedModel
  }
}
</script>
