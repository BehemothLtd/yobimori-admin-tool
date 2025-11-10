<script setup lang="ts">
import { ref, computed, onMounted, h } from "vue";
import { useRouter, useRoute } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import {
  Breadcrumb,
  PageHeader,
  BaseButton,
  TextField,
  SearchForm,
  DataTable,
  LoadingSpinner,
  HidablePassword,
  type TableColumn,
} from "@/components/base";
import AccountBoxIcon from "@/components/icons/AccountBoxIcon.vue";
import useTenants from "@/composable/useTenants";
import useDecryptPassword from "@/composable/useDecryptPassword";
import type { Tenant } from "@/types/tenant";
import type { FisherUser as Account } from "@/types/account";

const router = useRouter();
const route = useRoute();
const { getTenantWithMembers } = useTenants();
const { decryptPassword } = useDecryptPassword();

// Get tenantId from route params
const tenantId = computed(() => route.params.id as string);

console.log("tenant id", tenantId.value);
// State
const currentTenant = ref<Tenant | null>(null);
const filterText = ref("");
const accounts = ref<Account[]>([]);
const isLoading = ref(false);

// Breadcrumb data
const breadcrumbItems = computed(() => [
  { label: "ホーム", to: "/" },
  { label: "テナント管理", to: "/tenants" },
  {
    label: currentTenant.value?.name || "テナント詳細",
    to: `/tenants/${tenantId.value}`,
  },
  { label: "アカウント・デバイス管理" },
]);

// Load tenant data and members on mount
onMounted(async () => {
  if (!tenantId.value) return;

  isLoading.value = true;

  try {
    const { tenant, members } = await getTenantWithMembers(tenantId.value);
    currentTenant.value = tenant;
    accounts.value = members;
  } catch (error) {
    console.error("Failed to load tenant data:", error);
  } finally {
    isLoading.value = false;
  }
});

// Filter accounts based on filterText
const filteredAccounts = computed(() => {
  if (!filterText.value) {
    return accounts.value;
  }

  const query = filterText.value.toLowerCase();
  return accounts.value.filter((account) =>
    account.nickname.toLowerCase().includes(query)
  );
});

// Table columns
const columns: TableColumn[] = [
  {
    key: "name",
    label: "ユーザーID",
    sortable: false,
  },
  {
    key: "nickname",
    label: "ユーザー名",
    sortable: false,
  },
  {
    key: "password",
    label: "パスワード",
    render: (row: Account) =>
      h(HidablePassword, {
        encryptedPassword: row.encryptedPassword,
        getDecryptedPassword: () => decryptPassword(row.encryptedPassword),
      }),
  },
  {
    key: "tenants",
    label: "所属テナント",
    render: (row: Account) => row.tenants.map((t) => t.name).join(", ") || "-",
  },
  {
    key: "primaryTenant",
    label: "事故通知先テナント",
    render: (row: Account) => row.tenants[0]?.name || "-",
  },
  {
    key: "devices",
    label: "所持デバイス",
    render: (row: Account) =>
      row.devices.devices.map((d) => `${d.imei}(${d.deviceType})`).join(", ") ||
      "-",
  },
  {
    key: "lineUsers",
    label: "連携LINEユーザー",
    render: (row: Account) =>
      row.lineUsers?.map((u) => u.displayName).join(", ") || "-",
  },
  {
    key: "action",
    label: "操作",
    type: "button",
    width: "100px",
    align: "center",
    render: () => "編集",
  },
];

// Handlers
const handleReset = () => {
  filterText.value = "";
};

const handleCellButtonClick = (row: Account) => {
  // Navigate to edit page
  router.push(`/accounts/${row.id}/edit`);
};

// Result count message
const resultMessage = computed(() => {
  if (filterText.value) {
    return `「${filterText.value}」の検索結果: ${filteredAccounts.value.length}件`;
  }

  return `検索結果: ${filteredAccounts.value.length}件`;
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
      title="アカウント・デバイス管理"
      description="ユーザー・テナントの情報を確認したり変更できます"
      :icon="AccountBoxIcon"
    />

    <!-- Search Form -->
    <SearchForm :columns="1">
      <template #fields>
        <TextField
          v-model="filterText"
          label="ユーザー名"
          placeholder="ユーザー名で検索"
        />
      </template>
      <template #actions>
        <BaseButton
          variant="secondary"
          @click="handleReset"
          :disabled="!filterText"
        >
          リセット
        </BaseButton>
      </template>
    </SearchForm>

    <!-- Results Info -->
    <div v-if="resultMessage" class="mb-4 text-sm text-gray-600">
      {{ resultMessage }}
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" />

    <!-- Data Table -->
    <DataTable
      v-else
      :columns="columns"
      :data="filteredAccounts"
      @cell-button-click="handleCellButtonClick"
      empty-text="アカウントが見つかりません"
    />
  </MainLayout>
</template>
