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
    class="mb-6 bg-gradient-to-r from-[#ef654d] to-[#ff8a65] rounded-lg shadow-md p-4"
  >
    <div
      class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
    >
      <!-- Left side: Icon, Title, Description -->
      <div class="flex items-start space-x-3 flex-1 min-w-0">
        <!-- Icon -->
        <div v-if="icon" class="flex-shrink-0">
          <div
            class="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          >
            <component :is="icon" class="w-6 h-6" />
          </div>
        </div>

        <!-- Title and Description -->
        <div class="flex-1 min-w-0">
          <h1 class="text-start text-xl sm:text-2xl font-bold text-white">
            {{ title }}
          </h1>
          <p
            v-if="description"
            class="text-start text-sm text-white/90 mt-1 mb-0"
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
