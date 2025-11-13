<template>
  <div
    class="group relative overflow-hidden rounded-xl border-2 border-orange-100 bg-gradient-to-br from-orange-50/30 via-white to-white p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary hover:-translate-y-1 cursor-pointer h-full flex flex-col"
    @click="$emit('click', tenant)"
  >
    <!-- Hover gradient overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-light/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    ></div>

    <div class="relative flex flex-col h-full">
      <!-- Header with icon -->
      <div class="flex items-start justify-between mb-4">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-110"
        >
          <BusinessIcon class="text-2xl" />
        </div>
        <div
          class="opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
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

      <!-- Tenant Name -->
      <h3
        class="text-left text-lg font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2"
      >
        {{ tenant.name }}
      </h3>

      <!-- Tenant ID -->
      <div class="mb-3">
        <p class="text-left text-xs font-semibold text-gray-500 mb-1">
          テナントID
        </p>
        <p
          class="text-left text-sm font-mono text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 break-all"
        >
          {{ tenant.id }}
        </p>
      </div>

      <!-- Tenant Address -->
      <div class="flex-1">
        <p class="text-left text-xs font-semibold text-gray-500 mb-1">住所</p>
        <p class="text-left text-sm text-gray-700 line-clamp-2">
          {{ tenant.address }}
        </p>
      </div>
    </div>

    <!-- Bottom gradient border -->
    <div
      class="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-primary-light transition-all duration-300 group-hover:w-full"
    ></div>
  </div>
</template>

<script setup lang="ts">
import BusinessIcon from "@/components/icons/BusinessIcon.vue";
import type { Tenant } from "@/types/tenant";

export interface TenantCardProps {
  tenant: Tenant;
}

defineProps<TenantCardProps>();
defineEmits<{
  click: [tenant: Tenant];
}>();
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
