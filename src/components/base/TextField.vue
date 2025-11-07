<script setup lang="ts">
interface Props {
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
}

withDefaults(defineProps<Props>(), {
  type: "text",
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
    <label
      v-if="label"
      class="text-start block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input -->
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
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

    <!-- Hint Text -->
    <p v-if="hint && !error" class="mt-1 text-xs text-gray-500">
      {{ hint }}
    </p>

    <!-- Error Message -->
    <p v-if="error" class="mt-1 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
