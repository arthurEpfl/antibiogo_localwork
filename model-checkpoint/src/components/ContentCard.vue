<template>
  <div class="p-8 rounded-lg bg-white text-zinc-600">
    <h2 class="text-center lg:text-left pb-8 text-xl font-bold">
      <slot name="title" />
    </h2>
    <div>
      <slot name="content" />
    </div>
  </div>
</template>
