<template>
  <div class="grid grid-cols-2 gap-16 mx-auto">
    <CustomButton @click="router.push('/aggregate')">Aggregate client updates</CustomButton>
    <CustomButton @click="router.push('/')">Skip this round</CustomButton>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import CustomButton from '@/components/button/CustomButton.vue'

const router = useRouter()
</script>
