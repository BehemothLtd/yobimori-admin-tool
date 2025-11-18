<template>
  <div
    :class="[
      'stat-card group relative overflow-hidden rounded-lg sm:rounded-xl border sm:border-2 p-2.5 sm:p-6 shadow-sm sm:shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col',
      cardClass,
    ]"
  >
    <!-- Desktop/Tablet Layout (md and up) -->
    <div class="hidden md:flex justify-between flex-1">
      <div class="flex-1 flex flex-col justify-between">
        <p
          class="text-left text-base font-bold text-gray-700 mb-3 min-h-[48px] flex items-start"
        >
          {{ title }}
        </p>
        <div class="flex items-end gap-2">
          <p
            v-if="!loading"
            :class="['text-4xl font-bold transition-all', valueClass]"
          >
            {{ value ?? 0 }}
          </p>
          <div v-else class="h-10 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
      <div class="flex items-center">
        <div
          :class="[
            'flex h-14 w-14 items-center justify-center rounded-full transition-all group-hover:text-white flex-shrink-0',
            iconClass,
          ]"
        >
          <component :is="icon" class="text-2xl" />
        </div>
      </div>
    </div>

    <!-- Mobile Layout (below md) -->
    <div class="flex md:hidden flex-col flex-1">
      <div class="mb-1.5">
        <div
          :class="[
            'flex h-8 w-8 items-center justify-center rounded-full transition-all group-hover:text-white flex-shrink-0',
            iconClass,
          ]"
        >
          <component :is="icon" class="text-sm" />
        </div>
      </div>
      <p
        class="text-left text-xs font-bold text-gray-700 mb-1.5 leading-tight min-h-[28px] flex items-start"
      >
        {{ title }}
      </p>
      <div class="flex items-end gap-1.5">
        <p
          v-if="!loading"
          :class="['text-xl font-bold transition-all', valueClass]"
        >
          {{ value ?? 0 }}
        </p>
        <div v-else class="h-6 w-14 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>

    <div
      :class="[
        'absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full',
        gradientClass,
      ]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

export interface StatCardProps {
  title: string;
  value: number | null;
  loading?: boolean;
  icon: Component;
  cardClass?: string;
  iconClass?: string;
  valueClass?: string;
  gradientClass?: string;
}

withDefaults(defineProps<StatCardProps>(), {
  cardClass:
    "border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-gray-400",
  iconClass: "bg-gray-200 text-gray-600 group-hover:bg-gray-500",
  valueClass: "text-gray-900 group-hover:text-gray-700",
  gradientClass: "bg-gradient-to-r from-gray-400 to-gray-600",
});
</script>

<style scoped>
.stat-card {
  min-height: 140px;
}

.stat-card :deep(.anticon) {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.stat-card :deep(.anticon svg) {
  display: block;
}

@media (max-width: 768px) {
  .stat-card {
    min-height: 85px;
  }
}
</style>
