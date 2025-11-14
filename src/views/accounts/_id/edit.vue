<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
} from "ant-design-vue";
import type { Rule } from "ant-design-vue/es/form";
import MainLayout from "@/components/MainLayout.vue";
import {
  Breadcrumb,
  PageHeader,
  LoadingSpinner,
  BaseButton,
} from "@/components/base";
import AccountBoxIcon from "@/components/icons/AccountBoxIcon.vue";
import useAccounts from "@/composable/useAccounts";
import useSwal from "@/composable/useSwal";
import type { FisherUser as Account } from "@/types/account";

const router = useRouter();
const route = useRoute();
const {
  getFisherUserById,
  updateFisherUserNickname,
  updateFisherUserPassword,
} = useAccounts();
const { confirming, success, error } = useSwal();

// Get IDs from route params
const accountId = computed(() => route.params.id as string);
const tenantId = computed(() => route.params.tenantId as string);

// State
const account = ref<Account | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);

// Form state with reactive
const formState = reactive({
  nickname: "",
  password: "",
});

// Form rules
const formRules: Record<string, Rule[]> = {
  nickname: [
    {
      required: true,
      message: "ユーザー名を入力してください",
      trigger: "blur",
    },
  ],
};

// Breadcrumb data
const breadcrumbItems = computed(() => [
  { label: "ホーム", to: "/" },
  { label: "テナント管理", to: "/tenants" },
  {
    label: "テナント詳細",
    to: `/tenants/${tenantId.value}`,
  },
  {
    label: "アカウント・デバイス管理",
    to: `/tenants/${tenantId.value}/accounts`,
  },
  {
    label: "アカウント詳細",
    to: `/tenants/${tenantId.value}/accounts/${accountId.value}`,
  },
  { label: "編集" },
]);

// Load account data
const loadAccount = async () => {
  if (!accountId.value) return;

  isLoading.value = true;

  try {
    const data = await getFisherUserById(accountId.value);
    if (data) {
      account.value = data;
      formState.nickname = data.nickname || "";
    }
  } catch (err) {
    console.error("Failed to load account:", err);
    await error({
      title: "エラー",
      text: "アカウント情報の読み込みに失敗しました",
    });
  } finally {
    isLoading.value = false;
  }
};

// Handle save
const handleSave = async () => {
  if (!account.value) return;

  const hasNicknameChange = formState.nickname !== account.value.nickname;
  const hasPasswordChange = !!formState.password;

  if (!hasNicknameChange && !hasPasswordChange) {
    await error({
      title: "変更なし",
      text: "変更する項目がありません",
    });
    return;
  }

  const confirmText = [];
  if (hasNicknameChange) {
    confirmText.push(`新しいユーザー名: ${formState.nickname}`);
  }
  if (hasPasswordChange) {
    confirmText.push(`パスワードを更新します`);
  }

  const confirmed = await confirming({
    title: "アカウント情報を更新しますか？",
    text: confirmText.join("\n"),
    icon: "question",
  });

  if (!confirmed) return;

  isSaving.value = true;

  try {
    let success1 = true;
    let success2 = true;

    // Update nickname if changed
    if (hasNicknameChange) {
      const result = await updateFisherUserNickname({
        id: account.value.id,
        nickname: formState.nickname,
      });
      success1 = !!result;
    }

    // Update password if provided
    if (hasPasswordChange) {
      const result = await updateFisherUserPassword({
        id: account.value.id,
        password: formState.password,
      });
      success2 = !!result;
    }

    if (success1 && success2) {
      await success({
        title: "成功",
        text: "アカウント情報が更新されました",
      });

      // Navigate back to detail page
      router.push(`/tenants/${tenantId.value}/accounts/${accountId.value}`);
    } else {
      await error({
        title: "エラー",
        text: "アカウント情報の更新に失敗しました",
      });
    }
  } catch (err) {
    console.error("Failed to update account:", err);
    await error({
      title: "エラー",
      text: "アカウント情報の更新に失敗しました",
    });
  } finally {
    isSaving.value = false;
  }
};

// Handle cancel
const handleCancel = () => {
  router.push(`/tenants/${tenantId.value}/accounts/${accountId.value}`);
};

onMounted(() => {
  loadAccount();
});
</script>

<template>
  <MainLayout>
    <!-- Breadcrumb -->
    <div class="mb-6">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Page Header -->
    <PageHeader
      title="アカウント編集"
      description="ユーザー名とパスワードを編集できます"
      :icon="AccountBoxIcon"
    />

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" />

    <!-- Edit Form -->
    <div v-else-if="account">
      <div class="bg-white rounded-lg shadow p-6">
        <AForm :model="formState" :rules="formRules" layout="vertical">
          <!-- Nickname Field -->
          <AFormItem label="ユーザー名" name="nickname">
            <AInput
              v-model:value="formState.nickname"
              placeholder="ユーザー名を入力"
              size="large"
            />
          </AFormItem>

          <!-- Password Field -->
          <AFormItem label="新しいパスワード" name="password">
            <AInput
              v-model:value="formState.password"
              type="password"
              placeholder="新しいパスワードを入力（変更する場合のみ）"
              size="large"
            />
            <p class="text-sm text-gray-500 mt-1">
              ※ パスワードを変更しない場合は空欄のままにしてください
            </p>
          </AFormItem>

          <!-- Action Buttons -->
          <div class="flex gap-3 justify-end mt-6">
            <BaseButton @click="handleCancel" :disabled="isSaving">
              キャンセル
            </BaseButton>
            <BaseButton @click="handleSave" :loading="isSaving">
              保存
            </BaseButton>
          </div>
        </AForm>
      </div>
    </div>

    <!-- No Account Found -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">アカウントが見つかりません</p>
    </div>
  </MainLayout>
</template>
