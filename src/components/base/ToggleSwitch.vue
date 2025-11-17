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

const handleChange = (event: Event) => {
  if (!props.disabled) {
    const target = event.target as HTMLInputElement;
    emit("update:modelValue", target.checked);
  }
};
</script>

<template>
  <div class="flex items-center gap-x-3">
    <label class="toggle-switch">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="handleChange"
        class="toggle-input"
      />
      <span class="toggle-slider"></span>
    </label>
    <span v-if="label" class="text-sm font-medium text-gray-900">
      {{ label }}
    </span>
  </div>
</template>

<style scoped>
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-slider {
  background: linear-gradient(to right, #ef654d, #ff8a65);
}

.toggle-input:focus + .toggle-slider {
  box-shadow: 0 0 0 2px white, 0 0 0 4px #ef654d;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
