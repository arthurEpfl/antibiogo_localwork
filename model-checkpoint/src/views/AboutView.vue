
import MSFLogo from '@/assets/img/MSFLogo.vue';

<template>
  <div class="contents">
    <ContentCard>
      <template #title>Quick Tutorial</template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-show="step === 0">
            <h1 class="text-xl text-center">Antibiogo Server</h1>
            <span class="block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
            <p>
              The Antibiogo server is the central server the <span class="font-bold">Antibiogo clients</span> communicate their local work with.
              It also provides them with the most recent centralized version of the <span class="font-bold">server model</span>.
            </p>
          </div>
          <div>
            <h1 class="text-xl text-center">Server Model</h1>
            <span class="block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
            <p>
              The server model is stored on the Antibiogo server. It is downloaded and used by the Antibiogo clients
              to identify their local pellets. The model is regularly updated thanks to the <span class="font-bold">client contributions</span>.
            </p>
          </div>
          <div>
            <h1 class="text-xl text-center">Antibiogo Clients</h1>
            <span class="block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
            <p>
              With their own local data, clients can contribute to the <span class="font-bold">server model</span> by first
              downloading it and using it to identify pellets.
              The model learns thanks to this new data it has never seen before. Then, clients push their local (updated) version
              of the model
              to the <span class="font-bold">Antibiogo server</span>.
            </p>
          </div>
          <div>
            <h1 class="text-xl text-center">Client Contributions</h1>
            <span class="block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
            <p>
              With their own local data, clients can contribute to the <span class="font-bold">server model</span> by first downloading it and using it to identify pellets.
              The model learns thanks to this new data it has never seen before. Then, clients push their local (updated) version of the model
              to the <span class="font-bold">Antibiogo server</span>.
            </p>
          </div>
        </div>
      </template>
    </ContentCard>
    <div class="flex flex-col gap-16 items-center mt-8">
      <h1 class="text-center text-3xl text-zinc-600 uppercase">
        A collaboration between
      </h1>
      <div class="flex flex-wrap gap-8 justify-center items-center">
        <MSF class="hover:cursor-pointer" @click="msfWebsite" :size="200" />
        <MLO class="hover:cursor-pointer group/mlo" @click="mloWebsite" :size="100" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import MSF from '@/assets/img/MSF.vue'
import MLO from '@/assets/img/MLO.vue'

import ContentCard from '@/components/ContentCard.vue'
import PrevButton from '@/components/button/PrevButton.vue'
import NextButton from '@/components/button/NextButton.vue'

const step = ref(0)

function msfWebsite (): void {
  window.location.href = 'https://www.msf.org/'
}

function mloWebsite (): void {
  window.location.href = 'https://www.epfl.ch/labs/mlo/'
}
</script>
