<script setup lang="ts">
import { ref } from "vue";
import EyeIcon from "@/components/icons/EyeIcon.vue";
import EyeSlashIcon from "@/components/icons/EyeSlashIcon.vue";

interface Props {
  encryptedPassword: string;
  getDecryptedPassword?: () => Promise<string>;
}

const props = defineProps<Props>();

const isVisible = ref(false);
const decryptedPassword = ref("");
const isDecrypting = ref(false);
const error = ref("");

const toggleVisibility = async () => {
  if (!isVisible.value) {
    // Show password
    if (props.getDecryptedPassword) {
      isDecrypting.value = true;
      error.value = "";
      try {
        decryptedPassword.value = await props.getDecryptedPassword();
        isVisible.value = true;
      } catch (e) {
        error.value = "パスワードの復号化に失敗しました";
        console.error("Failed to decrypt password:", e);
      } finally {
        isDecrypting.value = false;
      }
    } else {
      // Fallback: show encrypted password if no decrypt function provided
      decryptedPassword.value = props.encryptedPassword;
      isVisible.value = true;
    }
  } else {
    // Hide password
    isVisible.value = false;
    decryptedPassword.value = "";
  }
};
</script>

<template>
  <div class="flex items-center gap-2">
    <span v-if="!isVisible" class="text-gray-600">********</span>
    <span
      v-else
      class="font-mono text-sm break-all max-w-xs"
      :title="decryptedPassword"
    >
      {{ decryptedPassword }}
    </span>

    <button
      type="button"
      @click="toggleVisibility"
      :disabled="isDecrypting"
      class="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      :title="isVisible ? 'パスワードを非表示' : 'パスワードを表示'"
    >
      <component
        :is="isVisible ? EyeSlashIcon : EyeIcon"
        class="h-5 w-5"
        :class="{ 'animate-pulse': isDecrypting }"
      />
    </button>

    <span v-if="error" class="text-xs text-red-600">{{ error }}</span>
  </div>
</template>
