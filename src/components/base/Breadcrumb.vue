<script setup lang="ts">
interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

defineProps<Props>();

// Truncate label to max 50 characters with ellipsis
const truncateLabel = (label: string, maxLength: number = 50): string => {
  if (label.length <= maxLength) return label;
  return label.substring(0, maxLength) + "...";
};
</script>

<template>
  <nav
    class="flex flex-wrap items-center gap-2 text-sm"
    aria-label="Breadcrumb"
  >
    <a
      href="/"
      class="flex-shrink-0 text-gray-500 hover:text-primary transition-colors duration-200"
    >
      <svg
        class="w-4 h-4 sm:w-5 sm:h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
        />
      </svg>
    </a>

    <template v-for="(item, index) in items" :key="index">
      <!-- Separator -->
      <svg
        class="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clip-rule="evenodd"
        />
      </svg>

      <!-- Item -->
      <component
        :is="item.to && index !== items.length - 1 ? 'a' : 'span'"
        :href="item.to"
        :class="[
          'flex items-center gap-1',
          item.to && index !== items.length - 1
            ? 'text-gray-500 hover:text-primary transition-colors duration-200'
            : 'text-gray-900 font-medium',
        ]"
        :aria-current="index === items.length - 1 ? 'page' : undefined"
      >
        <span
          v-if="item.icon"
          v-html="item.icon"
          class="w-4 h-4 flex-shrink-0"
        ></span>
        <span
          class="text-start break-words max-w-[300px] truncate inline-block"
          :title="item.label"
        >
          {{ truncateLabel(item.label) }}
        </span>
      </component>
    </template>
  </nav>
</template>
