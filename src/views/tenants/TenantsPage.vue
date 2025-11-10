<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import {
  Breadcrumb,
  PageHeader,
  BaseButton,
  TextField,
  SearchForm,
  DataTable,
  LoadingSpinner,
  type TableColumn,
} from "@/components/base";
import BusinessIcon from "@/components/icons/BusinessIcon.vue";
import useTenants from "@/composable/useTenants";
import type { Tenant } from "@/types/tenant";

const router = useRouter();
const { getTenants, isLoading } = useTenants();

// Breadcrumb data
const breadcrumbItems = [
  { label: "ホーム", to: "/" },
  { label: "テナント管理" },
];

// Data
const tenantsData = ref<Tenant[]>([]);
const searchQuery = ref("");

// Fetch tenants from API
const fetchTenantsData = async () => {
  const { tenants } = await getTenants({ excludeTest: true });
  tenantsData.value = tenants;
};

// Filter data based on search
const filteredTenants = computed(() => {
  if (!searchQuery.value) {
    return tenantsData.value;
  }

  const query = searchQuery.value.toLowerCase();
  return tenantsData.value.filter((tenant) =>
    tenant.name.toLowerCase().includes(query)
  );
});

// Table columns
const columns: TableColumn[] = [
  {
    key: "id",
    label: "テナントID",
    width: "350px",
    sortable: false,
  },
  {
    key: "name",
    label: "テナント名",
    sortable: false,
  },
  {
    key: "action",
    label: "アクション",
    type: "button",
    width: "150px",
    align: "center",
    render: () => "詳細",
  },
];

// Handlers
const handleCreateTenant = () => {
  router.push("/tenants/new");
};

const handleReset = () => {
  searchQuery.value = "";
};

const handleRowClick = (row: Tenant) => {
  router.push(`/tenants/${row.id}`);
};

const handleCellButtonClick = (row: Tenant) => {
  router.push(`/tenants/${row.id}`);
};

// Fetch tenants on mount
onMounted(() => {
  fetchTenantsData();
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
      title="テナント管理"
      description="テナントの詳細情報や設定を管理できます"
      :icon="BusinessIcon"
    />

    <!-- Search Form -->
    <SearchForm :columns="1">
      <template #fields>
        <TextField
          v-model="searchQuery"
          label="テナント名で検索"
          placeholder="テナント名を入力してください"
        />
      </template>
      <template #actions>
        <BaseButton variant="primary" @click="handleCreateTenant">
          テナント作成
        </BaseButton>
        <BaseButton variant="secondary" @click="handleReset">
          リセット
        </BaseButton>
      </template>
    </SearchForm>

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" />

    <!-- Data Table -->
    <DataTable
      v-else
      :columns="columns"
      :data="filteredTenants"
      @row-click="handleRowClick"
      @cell-button-click="handleCellButtonClick"
      empty-text="テナントが見つかりません"
    />

    <!-- Results Info -->
    <div v-if="!isLoading" class="mt-4 text-sm text-gray-600">
      {{ filteredTenants.length }} 件のテナントが見つかりました
    </div>
  </MainLayout>
</template>
