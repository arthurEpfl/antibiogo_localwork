<template>
  <div class="contents">
    <ContentCard>
      <template #title>
        <p>Antibiogo Server Settings</p>
      </template>
      <template #content>
        <div class="flex flex-col gap-8 items-center">
          <div class="grid grid-cols-2 gap-8 items-center">
            <p class="text-right">
              Current server endpoint
            </p>
            <p class="flex flex-wrap md:text-xl">
              <span>{{ settingsStore.serverEndpoint.protocol }}//</span>
              <span>{{ settingsStore.serverEndpoint.hostname }}</span>
              <span>:{{ settingsStore.serverEndpoint.port }}/</span>
            </p>
            <p class="text-right">
              Enter your custom server endpoint
            </p>
            <input
              class="py-2 px-3 rounded-md bg-zinc-200 outline-red-500"
              v-model="serverEndpointField"
            >
          </div>
          <CustomButton @click="confirm">
            Confirm
          </CustomButton>
        </div>
      </template>
    </ContentCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
    // clear form
    serverEndpointField.value = ''
    return notify.success('Server endpoint was modified')
  } else {
    return notify.error('Please provide a valid endpoint')
  }
}
</script>
