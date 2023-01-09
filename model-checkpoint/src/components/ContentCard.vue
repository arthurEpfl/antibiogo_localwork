<template>
  <div class="p-8 rounded-lg bg-white text-zinc-600">
    <h2 class="pb-8 text-xl font-bold">
      <slot name="title" />
    </h2>
    <span class="bg-black py-2 w-full" />
    <div>
      <slot name="content" />
    </div>
  </div>
</template>
