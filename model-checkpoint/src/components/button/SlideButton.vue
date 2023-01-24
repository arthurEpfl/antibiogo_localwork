<template>
  <button @click="toggle" class="flex flex-col items-center gap-4">
    <div>
      <slot />
    </div>
    <div class="relative focus:outline-none">
      <div
        class="
        w-12
        h-6
        transition
        rounded-full
        outline-none
        bg-slate-200
      "
      />
      <div
        class="
        absolute
        top-0
        left-0
        inline-flex
        w-6
        h-6
        transition-all
        duration-200
        ease-in-out
        transform
        scale-110
        rounded-full
        shadow-sm
        bg-red-500
      "
        :class="{
          'translate-x-0':
            !toggled,
          'translate-x-6':
            toggled,
        }"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
  (e: 'toggle'): void
}

const emit = defineEmits<Emits>()

const toggled = ref(false)

function toggle (): void {
  toggled.value = !toggled.value
  emit('toggle')
}
</script>
