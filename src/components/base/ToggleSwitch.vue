<script setup lang="ts">
import { Switch } from '@headlessui/vue';
import { computed } from 'vue';

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

const enabled = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    if (!props.disabled) {
      emit("update:modelValue", value);
    }
  }
});
</script>

<template>
  <div class="flex items-center gap-x-3">
    <Switch
      v-model="enabled"
      :disabled="disabled"
      :class="[
        enabled ? 'bg-gradient-to-r from-[#ef654d] to-[#ff8a65]' : 'bg-gray-200',
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2'
      ]"
    >
      <span
        :class="[
          enabled ? 'translate-x-6' : 'translate-x-1',
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition'
        ]"
      />
    </Switch>
    <span v-if="label" class="text-sm font-medium text-gray-900">
      {{ label }}
    </span>
  </div>
</template>
