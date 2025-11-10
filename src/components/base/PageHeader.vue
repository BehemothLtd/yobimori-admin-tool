<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
  icon?: any;
}

defineProps<Props>();
</script>

<template>
  <div
    class="mb-8 bg-gradient-to-r from-[#ff8a65] to-[#ff7043] rounded-lg shadow-md p-4 sm:p-6"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
    >
      <!-- Left side: Icon, Title, Description -->
      <div class="flex items-start space-x-4 flex-1 min-w-0">
        <!-- Icon -->
        <div v-if="icon" class="flex-shrink-0">
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <component :is="icon" class="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
        </div>

        <!-- Title and Description -->
        <div class="flex-1 min-w-0">
          <h1
            class="text-2xl flex items-start sm:text-3xl font-bold text-white mb-2"
          >
            {{ title }}
          </h1>
          <p
            v-if="description"
            class="flex items-start text-sm sm:text-base text-white/90"
          >
            {{ description }}
          </p>
        </div>
      </div>

      <!-- Right side: Action buttons slot -->
      <div class="flex-shrink-0">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>
