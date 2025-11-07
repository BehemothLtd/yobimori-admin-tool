<script setup lang="ts">
interface Props {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: any;
  iconPosition?: "left" | "right";
}

withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  loading: false,
  disabled: false,
  type: "button",
  iconPosition: "left",
});

const variantClasses = {
  primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary/50",
  secondary:
    "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400/50",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50",
  success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500/50",
  outline:
    "border-2 border-primary text-primary bg-transparent hover:bg-primary/10 focus:ring-primary/50",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

const iconSizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
    ]"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-5 w-5"
      :class="iconSizeClasses[size]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <!-- Icon Left -->
    <component
      v-if="icon && iconPosition === 'left' && !loading"
      :is="icon"
      :class="[iconSizeClasses[size], { 'mr-2': $slots.default }]"
    />

    <!-- Default Slot (Text) -->
    <slot></slot>

    <!-- Icon Right -->
    <component
      v-if="icon && iconPosition === 'right' && !loading"
      :is="icon"
      :class="[iconSizeClasses[size], { 'ml-2': $slots.default }]"
    />
  </button>
</template>
