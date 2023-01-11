<template>
  <nav class="flex flex-col md:flex-row flex-wrap gap-16 items-center justify-center">
    <MSFLogo
      :width="logoSize"
      :height="logoSize"
      @click="router.push('/')"
      class="hover:cursor-pointer"
    >
      Home
    </MSFLogo>
    <div class="flex flex-col md:flex-row gap-6 md:gap-16">
      <NavButton
        v-for="button in buttons"
        :key="button"
        :route="button"
      >
        {{ button }}
      </NavButton>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { routes } from '@/router'

import NavButton from './NavButton.vue'
import MSFLogo from '@/assets/img/MSFLogo.vue'

const router = useRouter()
const logoSize = 300

const buttons = routes.map((r) => r.name).filter((r) => r !== 'home')
</script>
