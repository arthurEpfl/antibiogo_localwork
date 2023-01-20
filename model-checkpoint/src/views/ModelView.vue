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
          <div class="grid grid-cols-2 gap-16">
            <CustomButton @click="aggregate">Aggregate</CustomButton>
            <CustomButton @click="discard">Discard</CustomButton>
          </div>
        </div>
      </template>
    </ContentCard>
    <ServerModel
      :server-model="(model as msf.Centroids)"
      @update="updateServerModel"
    />
    <ClientContributions
      :client-contributions="contributions"
      @update="updateClientContributions"
    />
    <CentroidsDelta
      :server-model="(model as msf.Centroids)"
      :server-model-weights="modelWeights"
      :client-contributions="contributions"
      :client-contributions-weights="contributionsWeights"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { List } from 'immutable'
import axios from 'axios'

import { msf } from 'epfl-antibiogo-lib'

import { useSettingsStore } from '@/stores/settings'
import type { Weights } from '@/types'
import notify from '@/notify'

import ServerModel from '@/components/model/ServerModel.vue'
import ClientContributions from '@/components/model/ClientContributions.vue'
import CentroidsDelta from '@/components/model/CentroidsDelta.vue'
import ContentCard from '@/components/ContentCard.vue'
import CustomButton from '@/components/button/CustomButton.vue'

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

function discard (): void {
  // TODO: command the server to discard contributions
  notify.error('Not implemented')
}

const model = ref<msf.Centroids | undefined>()
const modelWeights = ref<Weights | undefined>()
const contributions = ref<List<msf.Centroids> | undefined>()
const contributionsWeights = ref<List<Weights> | undefined>()

await updateServerModel()
await updateClientContributions()

async function fetchClientContributions(): Promise<[List<msf.Centroids>, List<Weights>] | undefined> {
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

  const weights = centroids.map((c) => List(c.positions.weights.map((t) => List(t.arraySync() as number[]))))

  notify.success('Successfully fetched contributions')
  return [centroids, weights]
}

async function updateClientContributions(): Promise<void> {
  const fetchedContributions = await fetchClientContributions()
  if (fetchedContributions !== undefined) {
    [contributions.value, contributionsWeights.value] = fetchedContributions
  }
}

async function fetchServerModel(): Promise<[msf.Centroids, Weights] | undefined> {
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

  const weights = List(centroids.positions.weights.map((t) => List(t.arraySync() as number[])))

  notify.success('Successfully fetched model')
  return [centroids, weights]
}

async function updateServerModel(): Promise<void> {
  const fetchedModel = await fetchServerModel()
  if (fetchedModel !== undefined) {
    [model.value, modelWeights.value] = fetchedModel
  }
}
</script>
