
import MSFLogo from '@/assets/img/MSFLogo.vue';

<template>
  <div class="contents">
    <ContentCard>
      <template #title>Quick Tutorial</template>
      <template #content>
        <div class="grid grid-cols-3 gap-8">
          <div class="text-center">
            <h1 class="text-xl">Antibiogo Server</h1>
            <span class="block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
            <p>
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
            </p>
          </div>
          <div class="text-center">
            <h1 class="text-xl">Server Model</h1>
            <span class="block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
            <p>
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
            </p>
          </div>
          <div class="text-center">
            <h1 class="text-xl">Client Contributions</h1>
            <span class="block h-0.5 bg-zinc-200 my-6 w-2/3 mx-auto" />
            <p>
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
              Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum
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
import MSF from '@/assets/img/MSF.vue'
import MLO from '@/assets/img/MLO.vue'
import ContentCard from '@/components/ContentCard.vue'

function msfWebsite (): void {
  window.location.href = 'https://www.msf.org/'
}

function mloWebsite (): void {
  window.location.href = 'https://www.epfl.ch/labs/mlo/'
}
</script>
