<script setup lang="ts">
import { ref, computed } from "vue";

interface SelectOption {
  label: string;
  value: string | number;
}

interface Props {
  modelValue?: (string | number)[];
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: (string | number)[]];
}>();

const isOpen = ref(false);

const selectedLabels = computed(() => {
  const props = defineProps<Props>();
  if (!props.modelValue || props.modelValue.length === 0)
    return props.placeholder || "選択してください";
  return props.options
    .filter((opt) => props.modelValue?.includes(opt.value))
    .map((opt) => opt.label)
    .join(", ");
});

const toggleOption = (value: string | number) => {
  const props = defineProps<Props>();
  const currentValues = [...(props.modelValue || [])];
  const index = currentValues.indexOf(value);

  if (index > -1) {
    currentValues.splice(index, 1);
  } else {
    currentValues.push(value);
  }

  emit("update:modelValue", currentValues);
};

const isSelected = (value: string | number) => {
  const props = defineProps<Props>();
  return props.modelValue?.includes(value) || false;
};
</script>

<template>
  <div class="w-full relative">
    <!-- Label -->
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Dropdown Button -->
    <button
      type="button"
      :disabled="disabled"
      @click="isOpen = !isOpen"
      :class="[
        'w-full px-3 py-2 border rounded-lg text-left',
        'focus:outline-none focus:ring-2 transition-colors duration-200',
        'flex items-center justify-between',
        error
          ? 'border-red-500 focus:ring-red-500/50'
          : 'border-gray-300 focus:border-primary focus:ring-primary/50',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      ]"
    >
      <span
        :class="
          modelValue && modelValue.length > 0
            ? 'text-gray-900'
            : 'text-gray-400'
        "
      >
        {{ selectedLabels }}
      </span>
      <svg
        class="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Dropdown Options -->
    <div
      v-if="isOpen && !disabled"
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
    >
      <div
        v-for="option in options"
        :key="option.value"
        @click="toggleOption(option.value)"
        class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
      >
        <input
          type="checkbox"
          :checked="isSelected(option.value)"
          class="rounded border-gray-300 text-primary focus:ring-primary"
          @click.stop
        />
        <span>{{ option.label }}</span>
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="mt-1 text-xs text-red-500">
      {{ error }}
    </p>

    <!-- Backdrop -->
    <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 z-0"></div>
  </div>
</template>
