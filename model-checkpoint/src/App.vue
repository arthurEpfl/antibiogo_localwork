<template>
  <header>
  </header>
  <body>
    <div class="h-screen px-20 py-10 space-y-24 lg:space-y-32 bg-slate-100 overflow-y-auto">
      <div class="flex justify-center">
        <NavBar />
      </div>
      <main class="flex flex-col gap-16">
        <RouterView />
      </main>
      <footer></footer>
    </div>
  </body>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

import NavBar from './components/nav/NavBar.vue'
</script>
