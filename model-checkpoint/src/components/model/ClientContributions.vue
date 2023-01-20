<template>
  <ContentCard>
    <template #title>
      Client Contributions
    </template>
    <template #content>
      <div class="flex flex-col items-center gap-6">
        <CustomButton @click="emit('update')">
          Fetch Contributions
        </CustomButton>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
          <HorizontalLine class="col-span-2" />
          <StatsRow
            :total="totalClients"
            unit="client"
            unit-plural="clients"
            per="client"
          >
            <template #text>
              Number of clients in this round.<br>Clients can contribute multiple times.
            </template>
            <template #icon>
              <PeopleIcon />
            </template>
          </StatsRow>
          <HorizontalLine class="col-span-2" />
          <StatsRow
            :total="totalContribs"
            :average="avgContribs"
            unit="contribution"
            unit-plural="contributions"
            per="client"
          >
            <template #text>
              Number of contributions in this round.<br>Clients can contribute multiple times.
            </template>
            <template #icon>
              <ModelIcon />
            </template>
          </StatsRow>
          <HorizontalLine class="col-span-2" />
          <StatsRow
            :total="totalNewCounts"
            :average="avgNewCounts"
            :max-y="maxNewCounts"
            :max-x="maxNewCountsLabel"
            unit="sample"
            unit-plural="samples"
            per="contribution"
          >
            <template #text>
              Number of visited samples in this round.
            </template>
            <template #icon>
              <ModelIcon />
            </template>
          </StatsRow>
        </div>
      </div>
    </template>
  </ContentCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { List } from 'immutable'

import type { msf } from 'epfl-antibiogo-lib'

import ContentCard from '@/components/ContentCard.vue'
import CustomButton from '@/components/button/CustomButton.vue'
import StatsRow from '@/components/StatsRow.vue'
import HorizontalLine from '@/components/HorizontalLine.vue'

import PeopleIcon from '@/assets/svg/PeopleIcon.vue'
import ModelIcon from '@/assets/svg/ModelIcon.vue'

export interface Props {
  clientContributions: List<msf.Centroids> | undefined
}
const props = defineProps<Props>()

interface Emits {
  (e: 'update'): void
}
const emit = defineEmits<Emits>()

const totalClients = computed(() => props.clientContributions?.size ?? 0)

const totalContribs = computed(() => props.clientContributions?.size ?? 0)

const avgContribs = computed(() => totalContribs.value / Math.max(1, totalContribs.value))

const totalNewCounts = computed(() => props.clientContributions
  ?.map((centroids) => centroids.counts
    // .map((count, idx) => count - (model.value?.counts[idx] ?? 0))
    .reduce((acc: number, count) => acc + count)
  ).reduce((acc: number, count) => acc + count) ?? 0)

const avgNewCounts = computed(() => totalNewCounts.value / Math.max(1, totalContribs.value))

const maxNewCounts = computed(() => props.clientContributions?.map((c) => List(c.counts).max()).max() ?? 0)

const maxNewCountsLabel = computed(() => {
  const [contributionIdx, idx] = props.clientContributions?.map((centroids, contributionIdx) =>
    [contributionIdx, centroids.counts.indexOf(maxNewCounts.value)] as [number, number]).filter(([_, idx]) =>
      idx !== -1).first() ?? [-1, -1]
  return [contributionIdx, idx].includes(-1)
    ? undefined
    : props.clientContributions?.get(contributionIdx)?.labels[idx]
})
</script>
