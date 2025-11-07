<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import {
  Breadcrumb,
  PageHeader,
  BaseButton,
  TextField,
  SearchForm,
  DataTable,
  type TableColumn,
} from "@/components/base";
import BusinessIcon from "@/components/icons/BusinessIcon.vue";
import SearchIcon from "@/components/icons/SearchIcon.vue";

interface Tenant {
  id: string;
  name: string;
}

const router = useRouter();

// Breadcrumb data
const breadcrumbItems = [
  { label: "ホーム", to: "/" },
  { label: "テナント管理" },
];

// Mock data
const tenantsData = ref<Tenant[]>([
  {
    id: "d665f4b8-7334-48a6-a6d3-3e00258fd613",
    name: "test-tenant-20230102105523.41",
  },
  {
    id: "6c981d3b-6752-4cab-8d55-273fa3e268a6",
    name: "test-from-tenant-20230513104307.587863982-04c8c83d-b412-4c4e-86de-7ea4cbaa3327",
  },
  {
    id: "760c1dfb-abbb-49f1-9497-3f5721db42b3",
    name: "test-tenant-20230110231344.42",
  },
]);

// Search form
const searchQuery = ref("");

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
    sortable: true,
  },
  {
    key: "name",
    label: "テナント名",
    sortable: true,
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
const handleSearch = () => {
  console.log("Searching for:", searchQuery.value);
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
        <BaseButton variant="primary" :icon="SearchIcon" @click="handleSearch">
          検索
        </BaseButton>
        <BaseButton variant="secondary" @click="handleReset">
          リセット
        </BaseButton>
      </template>
    </SearchForm>

    <!-- Data Table -->
    <DataTable
      :columns="columns"
      :data="filteredTenants"
      @row-click="handleRowClick"
      @cell-button-click="handleCellButtonClick"
      empty-text="テナントが見つかりません"
    />

    <!-- Results Info -->
    <div class="mt-4 text-sm text-gray-600">
      {{ filteredTenants.length }} 件のテナントが見つかりました
    </div>
  </MainLayout>
</template>
