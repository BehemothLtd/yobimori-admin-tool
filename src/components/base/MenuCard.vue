<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  href: string;
  enabled: boolean;
}

defineProps<Props>();
</script>

<template>
  <a
    :href="enabled ? href : '#'"
    :class="[
      'block p-4 sm:p-6 rounded-lg border-2 transition-all duration-300',
      enabled
        ? 'border-gray-200 bg-white hover:border-primary hover:shadow-xl hover:-translate-y-1 cursor-pointer'
        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed',
    ]"
    :aria-disabled="!enabled"
  >
    <div class="flex flex-col items-center text-center space-y-3 sm:space-y-4">
      <!-- Icon slot -->
      <div
        :class="[
          'transition-colors duration-300',
          enabled ? 'text-primary' : 'text-gray-400',
        ]"
      >
        <slot name="icon"></slot>
      </div>

      <!-- Title -->
      <h3
        :class="[
          'text-base sm:text-lg font-bold transition-colors duration-300',
          enabled ? 'text-gray-900' : 'text-gray-500',
        ]"
      >
        {{ title }}
      </h3>

      <!-- Description -->
      <p
        :class="[
          'text-xs sm:text-sm transition-colors duration-300',
          enabled ? 'text-gray-600' : 'text-gray-400',
        ]"
      >
        {{ description }}
      </p>

      <!-- Disabled badge -->
      <div v-if="!enabled" class="mt-2">
        <span
          class="inline-block px-3 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-full"
        >
          準備中
        </span>
      </div>
    </div>
  </a>
</template>
