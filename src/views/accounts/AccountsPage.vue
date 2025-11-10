<script setup lang="ts">
import { ref, computed, onMounted, h } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import {
  Breadcrumb,
  PageHeader,
  BaseButton,
  TextField,
  SelectField,
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
const { getTenants, getTenantWithMembers } = useTenants();
const { decryptPassword } = useDecryptPassword();

// Breadcrumb data
const breadcrumbItems = [
  { label: "ホーム", to: "/" },
  { label: "アカウント・デバイス管理" },
];

// State
const tenantsData = ref<Tenant[]>([]);
const selectedTenantId = ref("");
const filterText = ref("");
const accounts = ref<Account[]>([]);
const isLoading = ref(false);

// Load tenants on mount (filter out test tenants)
onMounted(async () => {
  const result = await getTenants({ excludeTest: true });
  tenantsData.value = result.tenants;
});

// Tenant options for select
const tenantOptions = computed(() =>
  tenantsData.value.map((t) => ({ value: t.id, label: t.name }))
);

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
    sortable: true,
  },
  {
    key: "nickname",
    label: "ユーザー名",
    sortable: true,
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
      row.devices.devices.map((d) => d.imei).join(", ") || "-",
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
const handleTenantChange = async () => {
  if (!selectedTenantId.value) {
    accounts.value = [];
    return;
  }

  isLoading.value = true;

  try {
    const { members } = await getTenantWithMembers(selectedTenantId.value);
    accounts.value = members;
  } catch (error) {
    console.error("Failed to load tenant members:", error);
    accounts.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleReset = () => {
  filterText.value = "";
};

const handleCellButtonClick = (row: Account) => {
  // Navigate to edit page
  router.push(`/accounts/${row.id}/edit`);
};

// Result count message
const resultMessage = computed(() => {
  if (!selectedTenantId.value) {
    return "";
  }

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
    <SearchForm :columns="2">
      <template #fields>
        <SelectField
          v-model="selectedTenantId"
          label="テナント"
          :options="tenantOptions"
          placeholder="テナントを選択してください"
          required
          @change="handleTenantChange"
        />
        <TextField
          v-model="filterText"
          label="ユーザー名"
          placeholder="ユーザー名で検索"
          :disabled="!selectedTenantId"
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
