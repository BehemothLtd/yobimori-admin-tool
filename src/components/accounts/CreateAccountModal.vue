<template>
  <a-modal
    v-model:open="isOpen"
    title="アカウント作成"
    :confirm-loading="isCreating"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form :model="formState" layout="vertical" class="mt-4">
      <a-form-item
        label="アカウント名"
        name="name"
        :rules="[{ required: true, message: 'アカウント名を入力してください' }]"
      >
        <a-input
          v-model:value="formState.name"
          placeholder="アカウント名を入力"
          :disabled="isCreating"
        />
      </a-form-item>

      <a-form-item label="テナントID" name="tenantId">
        <a-input :value="tenantId" disabled />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  Modal as AModal,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
} from "ant-design-vue";
import useSwal from "@/composable/useSwal";
import useAccounts from "@/composable/useAccounts";

export interface CreateAccountModalProps {
  open: boolean;
  tenantId: string;
}

export interface CreateAccountModalEmits {
  (e: "update:open", value: boolean): void;
  (e: "success", accountId: string): void;
}

const props = defineProps<CreateAccountModalProps>();
const emit = defineEmits<CreateAccountModalEmits>();

const { confirming, success, error } = useSwal();
const { createFisherUser } = useAccounts();

const isOpen = ref(props.open);
const isCreating = ref(false);
const formState = ref({
  name: "",
});

// Sync with parent
watch(
  () => props.open,
  (value) => {
    isOpen.value = value;
    if (value) {
      // Reset form when modal opens
      formState.value.name = "";
    }
  }
);

watch(isOpen, (value) => {
  emit("update:open", value);
});

const handleCancel = () => {
  isOpen.value = false;
};

const handleSubmit = async () => {
  if (!formState.value.name.trim()) {
    error({
      title: "エラー",
      text: "アカウント名を入力してください",
    });
    return;
  }

  // Confirm before creating
  const confirmed = await confirming({
    title: "アカウントを作成しますか？",
    text: `アカウント名: ${formState.value.name}`,
    icon: "question",
  });

  if (!confirmed) return;

  isCreating.value = true;

  try {
    const result = await createFisherUser({
      id: props.tenantId,
      name: formState.value.name,
    });

    if (result) {
      await success({
        title: "成功",
        text: "アカウントが作成されました",
      });

      isOpen.value = false;
      emit("success", result.id);
    } else {
      await error({
        title: "エラー",
        text: "アカウントの作成に失敗しました",
      });
    }
  } catch (err) {
    console.error("Failed to create account:", err);
    await error({
      title: "エラー",
      text: "アカウントの作成に失敗しました",
    });
  } finally {
    isCreating.value = false;
  }
};
</script>
