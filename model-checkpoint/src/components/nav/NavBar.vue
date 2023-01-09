<template>
  <nav class="flex flex-wrap gap-16 items-center justify-center">
    <MSFLogo :width="logoSize" :height="logoSize" @click="router.push('/')">Home</MSFLogo>
    <div class="space-x-16">
      <NavButton route="/models">Models</NavButton>
      <NavButton route="/about">About</NavButton>
      <NavButton route="/help">Help</NavButton>
    </div>
  </nav>
</template>

<script setup lang="ts">
import NavButton from './NavButton.vue'
import MSFLogo from '../../assets/img/MSFLogo.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const logoSize = 300
</script>
