<template>
  <div class="content">
    <ContentCard>
    <template #title>
      Aggregate or Discard Client Contributions
    </template>
    <template #content>
      <div class="flex flex-col items-center gap-16">
        <p class="text-center">
          Confirm the model update by aggregating contributions received from clients, or discard them
        </p>
        <div class="grid grid-cols-2 gap-16">
          <CustomButton @click="aggregate">Aggregate</CustomButton>
          <CustomButton @click="discard">Discard</CustomButton>
        </div>
      </div>
    </template>
  </ContentCard>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'

import { useSettingsStore } from '@/stores/settings'
import notify from '@/notify'
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

function discard (): void {}
</script>
