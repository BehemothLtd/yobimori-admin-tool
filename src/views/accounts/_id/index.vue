<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  UserOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons-vue";
import MainLayout from "@/components/MainLayout.vue";
import {
  Breadcrumb,
  PageHeader,
  LoadingSpinner,
  BaseButton,
} from "@/components/base";
import AccountBoxIcon from "@/components/icons/AccountBoxIcon.vue";
import useAccounts from "@/composable/useAccounts";
import useDecryptPassword from "@/composable/useDecryptPassword";
import useSwal from "@/composable/useSwal";
import type { FisherUser as Account } from "@/types/account";

const router = useRouter();
const route = useRoute();
const { getFisherUserById } = useAccounts();
const { decryptPassword } = useDecryptPassword();
const { error } = useSwal();

// Get IDs from route params
const accountId = computed(() => route.params.id as string);
const tenantId = computed(() => route.params.tenantId as string);

// State
const account = ref<Account | null>(null);
const isLoading = ref(false);
const decryptedPassword = ref<string>("");
const showPassword = ref(false);

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
  { label: "アカウント詳細" },
]);

// Load account data
const loadAccount = async () => {
  if (!accountId.value) return;

  isLoading.value = true;

  try {
    const data = await getFisherUserById(accountId.value);
    if (data) {
      account.value = data;

      // Decrypt password
      if (data.encryptedPassword) {
        try {
          decryptedPassword.value = await decryptPassword(
            data.encryptedPassword
          );
        } catch (err) {
          console.error("Failed to decrypt password:", err);
        }
      }
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

// Navigate to edit page
const handleEdit = () => {
  router.push(`/tenants/${tenantId.value}/accounts/${accountId.value}/edit`);
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
      title="アカウント詳細"
      description="アカウントの詳細情報を表示します"
      :icon="AccountBoxIcon"
    >
      <template #actions>
        <div class="flex gap-2">
          <BaseButton @click="handleEdit"> 編集 </BaseButton>
        </div>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" />

    <!-- Account Details -->
    <div v-else-if="account" class="space-y-6">
      <!-- Account Information -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4 text-left">
          アカウント情報
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="text-left">
            <p class="text-sm text-gray-500 mb-1">ユーザーID</p>
            <p class="text-base font-medium text-gray-800">
              {{ account.name }}
            </p>
          </div>

          <div class="text-left">
            <p class="text-sm text-gray-500 mb-1">ユーザー名</p>
            <p class="text-base font-medium text-gray-800">
              {{ account.nickname || "-" }}
            </p>
          </div>

          <div class="text-left">
            <p class="text-sm text-gray-500 mb-1">現在のパスワード</p>
            <div class="flex items-center gap-2">
              <p class="text-base font-medium text-gray-800 mb-0">
                {{ showPassword ? decryptedPassword || "-" : "••••••••" }}
              </p>
              <button
                @click="showPassword = !showPassword"
                class="hover:text-gray-600 transition-colors flex items-center justify-center"
                type="button"
                aria-label="Toggle password visibility"
              >
                <EyeOutlined v-if="!showPassword" class="text-sm" />
                <EyeInvisibleOutlined v-else class="text-sm" />
              </button>
            </div>
          </div>

          <div class="text-left">
            <p class="text-sm text-gray-500 mb-1">所属テナント</p>
            <p class="text-base font-medium text-gray-800">
              {{ account.tenants.map((t) => t.name).join(", ") || "-" }}
            </p>
          </div>

          <div class="text-left">
            <p class="text-sm text-gray-500 mb-1">事故通知先テナント</p>
            <p class="text-base font-medium text-gray-800">
              {{ account.tenants[0]?.name || "-" }}
            </p>
          </div>

          <div class="text-left">
            <p class="text-sm text-gray-500 mb-1">所持デバイス</p>
            <p class="text-base font-medium text-gray-800">
              {{
                account.devices.devices
                  .map((d) => `${d.imei}(${d.deviceType})`)
                  .join(", ") || "-"
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- LINE Users Section -->
      <div
        v-if="account.lineUsers && account.lineUsers.length > 0"
        class="bg-white rounded-lg shadow p-6"
      >
        <h3 class="text-lg font-bold text-gray-800 mb-4 text-left">
          連携LINEユーザー
        </h3>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <div
            v-for="lineUser in account.lineUsers"
            :key="lineUser.userId"
            class="bg-gray-50 rounded-lg p-4 flex items-center gap-3 hover:bg-gray-100 transition-colors h-20"
          >
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <img
                v-if="lineUser.pictureUrl"
                :src="lineUser.pictureUrl"
                :alt="lineUser.displayName || 'LINE User'"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div
                v-else
                class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"
              >
                <UserOutlined class="text-xl text-blue-600" />
              </div>
            </div>

            <!-- Name -->
            <div class="flex-1 min-w-0 text-left">
              <p class="text-sm font-medium text-gray-800 truncate">
                {{ lineUser.displayName }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- No LINE Users -->
      <div v-else class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4 text-left">
          連携LINEユーザー
        </h3>
        <p class="text-gray-500 text-left">
          連携されているLINEユーザーはありません
        </p>
      </div>
    </div>

    <!-- No Account Found -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">アカウントが見つかりません</p>
    </div>
  </MainLayout>
</template>
