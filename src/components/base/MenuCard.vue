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
      'group block relative overflow-hidden p-6 sm:p-8 rounded-xl border-2 transition-all duration-300 shadow-md',
      enabled
        ? 'border-orange-100 bg-gradient-to-br from-orange-50/30 via-white to-white hover:border-primary hover:shadow-2xl hover:-translate-y-2 cursor-pointer'
        : 'border-gray-200 bg-gradient-to-br from-gray-100 to-gray-50 opacity-70 cursor-not-allowed',
    ]"
    :aria-disabled="!enabled"
  >
    <!-- Hover gradient overlay -->
    <div
      v-if="enabled"
      class="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-light/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    ></div>

    <div class="relative flex flex-col items-center text-center space-y-4">
      <!-- Icon slot with background circle -->
      <div
        :class="[
          'flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full transition-all duration-300',
          enabled
            ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110'
            : 'bg-gray-200 text-gray-400',
        ]"
      >
        <div class="text-3xl sm:text-4xl">
          <slot name="icon"></slot>
        </div>
      </div>

      <!-- Title -->
      <h3
        :class="[
          'text-lg sm:text-xl font-bold transition-colors duration-300',
          enabled ? 'text-gray-900 group-hover:text-primary' : 'text-gray-500',
        ]"
      >
        {{ title }}
      </h3>

      <!-- Description -->
      <p
        :class="[
          'text-sm sm:text-base leading-relaxed transition-colors duration-300 min-h-[48px]',
          enabled ? 'text-gray-600 group-hover:text-gray-700' : 'text-gray-400',
        ]"
      >
        {{ description }}
      </p>

      <!-- Disabled badge -->
      <div v-if="!enabled" class="mt-2">
        <span
          class="inline-block px-4 py-1.5 text-xs font-semibold bg-gray-300 text-gray-600 rounded-full"
        >
          準備中
        </span>
      </div>

      <!-- Arrow indicator for enabled cards -->
      <div
        v-if="enabled"
        class="absolute bottom-4 right-4 opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
      >
        <svg
          class="w-5 h-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>

    <!-- Bottom gradient border -->
    <div
      v-if="enabled"
      class="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-primary-light transition-all duration-300 group-hover:w-full"
    ></div>
  </a>
</template>
