<script setup lang="ts">
interface Props {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  type?: "date" | "time" | "datetime-local";
  disabled?: boolean;
  required?: boolean;
  error?: string;
  min?: string;
  max?: string;
}

withDefaults(defineProps<Props>(), {
  type: "date",
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Date/Time Input -->
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :min="min"
      :max="max"
      @input="handleInput"
      :class="[
        'w-full px-3 py-2 border rounded-lg',
        'focus:outline-none focus:ring-2 transition-colors duration-200',
        error
          ? 'border-red-500 focus:ring-red-500/50'
          : 'border-gray-300 focus:border-primary focus:ring-primary/50',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      ]"
    />

    <!-- Error Message -->
    <p v-if="error" class="mt-1 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
