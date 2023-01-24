<template>
  <div class="p-8 rounded-lg bg-white text-zinc-600 w-full border border-zinc-200 lg:w-3/4 xl:w-2/3 2xl:w-1/2">
    <h2 class="text-center pb-8 text-xl font-bold uppercase">
      <slot name="title" />
    </h2>
    <div>
      <slot name="content" />
    </div>
  </div>
</template>
