<template>
  <div class="contents">
    <ContentCard>
      <template #title>
        <p>Antibiogo Server Settings</p>
      </template>
      <template #content>
        <div class="flex flex-col gap-6 items-center">
          <p class="text-center">Enter your custom server endpoint</p>
          <input class="py-2 px-3 rounded-md" v-model="serverEndpointField">
          <CustomButton @click="confirm">Confirm</CustomButton>
      </div>
      </template>
    </ContentCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { List } from 'immutable'

import type { msf } from 'epfl-antibiogo-lib'

import { useSettingsStore } from '@/stores/settings'
import notify from '@/notify'

import ContentCard from '@/components/ContentCard.vue'
import CustomButton from '@/components/button/CustomButton.vue'

const settingsStore = useSettingsStore()

const serverEndpointField = ref<string>()

async function confirm (): Promise<void> {
  if (serverEndpointField.value === undefined) {
    return notify.error('Please provide an endpoint')
  }
  const success = await settingsStore.editServerEndpoint(serverEndpointField.value)
  if (success) {
    serverEndpointField.value = ''
    return notify.success('Server endpoint was modified')
  } else {
    return notify.error('Please provide a valid endpoint')
  }
}

async function fetchClientContributions (): Promise<msf.Centroids> {
  return undefined as any
}

async function fetchServerModel (): Promise<List<msf.Centroids>> {
  return List()
}
</script>
