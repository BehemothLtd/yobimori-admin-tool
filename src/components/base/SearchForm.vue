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
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
    <!-- Search Fields -->
    <div
      :class="['gap-3 mb-3', layout === 'row' ? gridClass : 'flex flex-col']"
    >
      <slot name="fields"></slot>
    </div>

    <!-- Action Buttons -->
    <div
      class="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100"
    >
      <slot name="actions"></slot>
    </div>
  </div>
</template>
