<script setup lang="ts">
import { ref, computed, onMounted, h } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Row as ARow, Col as ACol, Button as AButton } from "ant-design-vue";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";
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
import AccountCard from "@/components/accounts/AccountCard.vue";
import CreateAccountModal from "@/components/accounts/CreateAccountModal.vue";
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
const viewMode = ref<"list" | "grid">("grid");
const showCreateModal = ref(false);

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
  await loadAccounts();
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
    render: (row: Account) =>
      h(
        "div",
        { class: "line-clamp-3" },
        row.tenants.map((t) => t.name).join(", ") || "-"
      ),
  },
  {
    key: "primaryTenant",
    label: "事故通知先テナント",
    render: (row: Account) =>
      h("div", { class: "line-clamp-3" }, row.tenants[0]?.name || "-"),
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
  // Navigate to detail page
  router.push(`/tenants/${tenantId.value}/accounts/${row.id}`);
};

const handleCreateAccount = () => {
  showCreateModal.value = true;
};

const handleCreateSuccess = (accountId: string) => {
  // Reload accounts list
  loadAccounts();
  // Navigate to detail page
  router.push(`/tenants/${tenantId.value}/accounts/${accountId}`);
};

const loadAccounts = async () => {
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
};
</script>

<style scoped>
.view-toggle-btn,
.create-account-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-toggle-btn :deep(.anticon),
.create-account-btn :deep(.anticon) {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.view-toggle-btn :deep(.anticon svg),
.create-account-btn :deep(.anticon svg) {
  display: block;
}

@media (max-width: 767px) {
  .button-text {
    display: none;
  }

  .view-toggle-btn :deep(.anticon),
  .create-account-btn :deep(.anticon) {
    margin: 0 !important;
  }
}
</style>

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

    <!-- Results Info and View Toggle -->
    <div class="mb-4 flex items-center justify-between">
      <!-- Left side: View Toggle Buttons -->
      <div class="flex gap-2">
        <a-button
          size="large"
          :type="viewMode === 'list' ? 'primary' : 'default'"
          class="view-toggle-btn"
          @click="viewMode = 'list'"
        >
          <UnorderedListOutlined />
          <span class="button-text">リスト表示</span>
        </a-button>
        <a-button
          size="large"
          :type="viewMode === 'grid' ? 'primary' : 'default'"
          class="view-toggle-btn"
          @click="viewMode = 'grid'"
        >
          <AppstoreOutlined />
          <span class="button-text">グリッド表示</span>
        </a-button>
      </div>

      <!-- Right side: Create Account Button -->
      <a-button
        size="large"
        type="primary"
        class="create-account-btn"
        @click="handleCreateAccount"
      >
        <PlusOutlined />
        <span class="button-text">アカウント作成</span>
      </a-button>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" />

    <!-- List View - Data Table -->
    <DataTable
      v-else-if="viewMode === 'list'"
      :columns="columns"
      :data="filteredAccounts"
      @cell-button-click="handleCellButtonClick"
      empty-text="アカウントが見つかりません"
    />

    <!-- Grid View - Cards -->
    <a-row v-else :gutter="[24, 24]">
      <a-col
        v-for="account in filteredAccounts"
        :key="account.id"
        :xs="24"
        :sm="12"
        :lg="6"
      >
        <AccountCard :account="account" @click="handleCellButtonClick" />
      </a-col>
    </a-row>

    <!-- Create Account Modal -->
    <CreateAccountModal
      v-model:open="showCreateModal"
      :tenant-id="tenantId"
      @success="handleCreateSuccess"
    />
  </MainLayout>
</template>
