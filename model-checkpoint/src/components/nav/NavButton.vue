<template>
  <UnderlinedButton
    @click="router.push(props.route)"
    :active="props.route === route.fullPath"
    class="text-xl sm:text-2xl lg:text-3xl"
  >
    <slot />
  </UnderlinedButton>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

import UnderlinedButton from '@/components/button/UnderlinedButton.vue'

export interface Props {
  route: string
}
const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()
</script>
