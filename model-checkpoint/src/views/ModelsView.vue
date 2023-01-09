<template>
  <div class="content">
    <ContentCard>
    <template #title>
      Aggregate or Discard Client Contributions
    </template>
    <template #content>
      <div class="flex flex-col items-center gap-16">
        <p class="text-center">
          Confirm the model update by aggregating contributions received from clients, or discard them
        </p>
        <div class="grid grid-cols-2 gap-16">
          <CustomButton @click="aggregate">Aggregate</CustomButton>
          <CustomButton @click="discard">Discard</CustomButton>
        </div>
      </div>
    </template>
  </ContentCard>
  </div>
</template>

<script setup lang="ts">
import ContentCard from '@/components/ContentCard.vue'
import CustomButton from '@/components/button/CustomButton.vue'

function aggregate (): void {}

function discard (): void {}
</script>
