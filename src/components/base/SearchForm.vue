<script setup lang="ts">
import { computed } from "vue";

interface Props {
  layout?: "row" | "column";
  columns?: number;
}

const props = withDefaults(defineProps<Props>(), {
  layout: "row",
  columns: 3,
});

const gridClass = computed(() => {
  if (props.layout !== "row") return "";

  if (props.columns === 1) {
    return "grid grid-cols-1";
  } else if (props.columns === 2) {
    return "grid grid-cols-1 sm:grid-cols-2";
  } else if (props.columns === 3) {
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  } else if (props.columns === 4) {
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  }

  return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
    <!-- Search Fields -->
    <div
      :class="['gap-4 mb-4', layout === 'row' ? gridClass : 'flex flex-col']"
    >
      <slot name="fields"></slot>
    </div>

    <!-- Action Buttons -->
    <div
      class="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200"
    >
      <slot name="actions"></slot>
    </div>
  </div>
</template>
