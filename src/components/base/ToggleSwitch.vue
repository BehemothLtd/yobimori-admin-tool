<script setup lang="ts">
interface Props {
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleToggle = () => {
  if (!props.disabled) {
    emit("update:modelValue", !props.modelValue);
  }
};
</script>

<template>
  <div class="flex items-center gap-x-3">
    <button
      type="button"
      @click="handleToggle"
      :disabled="disabled"
      :class="[
        modelValue ? 'bg-primary' : 'bg-gray-200',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        'group relative inline-flex w-11 h-6 shrink-0 rounded-full p-0.5 outline-offset-2 ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      ]"
      role="switch"
      :aria-checked="modelValue"
      :aria-label="label || 'Toggle switch'"
    >
      <span
        aria-hidden="true"
        :class="[
          modelValue ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-1 ring-gray-900/5 transition duration-200 ease-in-out',
        ]"
      />
    </button>
    <span v-if="label" class="text-sm font-medium text-gray-900">
      {{ label }}
    </span>
  </div>
</template>
