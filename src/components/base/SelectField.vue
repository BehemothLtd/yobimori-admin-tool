<script setup lang="ts">
interface SelectOption {
  label: string;
  value: string | number;
}

interface Props {
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
}>();

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
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

    <!-- Select -->
    <select
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      @change="handleChange"
      :class="[
        'w-full px-3 py-2 border rounded-lg',
        'focus:outline-none focus:ring-2 transition-colors duration-200',
        error
          ? 'border-red-500 focus:ring-red-500/50'
          : 'border-gray-300 focus:border-primary focus:ring-primary/50',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      ]"
    >
      <option value="" disabled selected>
        {{ placeholder || "選択してください" }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Error Message -->
    <p v-if="error" class="mt-1 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
