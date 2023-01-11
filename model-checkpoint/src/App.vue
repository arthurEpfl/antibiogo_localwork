<template>
  <header>
  </header>
  <body class="h-screen">
    <Notifications position="bottom left" />
    <div class="relative min-h-full bg-zinc-100">
      <div class="px-20 pt-10 pb-32 space-y-24 lg:space-y-32">
        <NavBar />
        <main>
          <RouterView />
        </main>
      </div>
      <CustomFooter class="absolute left-0 bottom-0 w-full bg-white" />
    </div>
  </body>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import NavBar from '@/components/nav/NavBar.vue'
import CustomFooter from '@/components/CustomFooter.vue'
</script>
