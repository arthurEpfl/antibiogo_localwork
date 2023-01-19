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
    <ServerModel />
    <ClientContributions />
    <CentroidsDelta />
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'

import { useSettingsStore } from '@/stores/settings'
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
</script>
