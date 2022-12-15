<template>
  <header>
  </header>
  <body>
    <div class="h-screen mx-20 my-10 space-y-16">
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
