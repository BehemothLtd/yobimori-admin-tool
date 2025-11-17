<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import {
  Breadcrumb,
  PageHeader,
  BaseButton,
  TextField,
  DataTable,
  LoadingSpinner,
  type TableColumn,
} from "@/components/base";
import BusinessIcon from "@/components/icons/BusinessIcon.vue";
import TenantCard from "@/components/tenants/TenantCard.vue";
import Pagination from "@/components/Pagination.vue";
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons-vue";
import useTenants from "@/composable/useTenants";
import type { Tenant } from "@/types/tenant";

const router = useRouter();
const tenantsComposable = useTenants();
const { getTenants, isLoading } = tenantsComposable;

// Breadcrumb data
const breadcrumbItems = [
  { label: "ホーム", to: "/" },
  { label: "テナント管理" },
];

// Data
const tenantsData = ref<Tenant[]>([]);
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = 30;
const nextToken = ref<string | null>(null);
const tokenHistory = ref<(string | null)[]>([null]); // Track tokens for each page
const totalCount = ref(0);
const hasMore = ref(false);

// View mode: 'list' or 'grid'
const viewMode = ref<"list" | "grid">("grid");

// Fetch tenants from API
const fetchTenantsData = async (
  token: string | null = null,
  searchName: string = ""
) => {
  // When searching with nameCont, use limit 10000, otherwise use default pageSize
  const limit = searchName ? 10000 : pageSize;

  const { tenants, nextToken: newNextToken } = await getTenants({
    limit,
    nextToken: token,
    nameCont: searchName || undefined,
    excludeTest: true,
  });

  tenantsData.value = tenants;
  nextToken.value = newNextToken;
  hasMore.value = !!newNextToken;

  // Estimate total count (current page * pageSize + more if hasMore)
  totalCount.value = currentPage.value * pageSize + (hasMore.value ? 1 : 0);
};

// Handlers
const handleSearch = async () => {
  // Reset pagination when searching
  currentPage.value = 1;
  tokenHistory.value = [null];
  await fetchTenantsData(null, searchQuery.value);
};

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
    render: () => "詳細",
  },
];

// Handlers
const handleCreateTenant = () => {
  router.push("/tenants/new");
};

const handleReset = async () => {
  searchQuery.value = "";
  // Reset pagination and reload data with default parameters
  currentPage.value = 1;
  tokenHistory.value = [null];
  await fetchTenantsData();
};

const handleRowClick = (row: Tenant) => {
  router.push(`/tenants/${row.id}`);
};

const handleCellButtonClick = (row: Tenant) => {
  router.push(`/tenants/${row.id}`);
};

const handlePageChange = async (page: number) => {
  currentPage.value = page;

  // If going forward to a new page
  if (page > tokenHistory.value.length) {
    tokenHistory.value.push(nextToken.value);
    await fetchTenantsData(nextToken.value);
  } else {
    // Going back to a previous page
    const token = tokenHistory.value[page - 1];
    await fetchTenantsData(token);
  }
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
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <TextField
            v-model="searchQuery"
            label="テナント名で検索"
            placeholder="テナント名を入力してください"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="flex gap-3 sm:items-end">
          <BaseButton variant="primary" @click="handleSearch" class="flex-1 sm:flex-none">
            <SearchOutlined class="mr-2" />
            検索
          </BaseButton>
          <BaseButton variant="secondary" @click="handleReset" class="flex-1 sm:flex-none">
            リセット
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <!-- View Mode Toggle -->
      <div class="flex gap-2">
        <button
          @click="viewMode = 'list'"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200',
            viewMode === 'list'
              ? 'bg-gradient-to-r from-[#ef654d] to-[#ff8a65] text-white shadow-md shadow-orange-500/30'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          <UnorderedListOutlined class="text-lg" />
          <span class="hidden sm:inline">リスト表示</span>
        </button>
        <button
          @click="viewMode = 'grid'"
          :class="[
            'flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200',
            viewMode === 'grid'
              ? 'bg-gradient-to-r from-[#ef654d] to-[#ff8a65] text-white shadow-md shadow-orange-500/30'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          <AppstoreOutlined class="text-lg" />
          <span class="hidden sm:inline">グリッド表示</span>
        </button>
      </div>

      <!-- Create Button -->
      <button
        @click="handleCreateTenant"
        class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 w-full sm:w-auto justify-center"
      >
        <PlusOutlined class="text-lg" />
        <span>テナント作成</span>
      </button>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" />

    <!-- Top Pagination -->
    <Pagination
      v-if="!isLoading && tenantsData.length > 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      :display-count="tenantsData.length"
      :show-pagination="!searchQuery"
      @change="handlePageChange"
      class="mb-4"
    />

    <!-- List View (Table) -->
    <DataTable
      v-if="!isLoading && viewMode === 'list'"
      :columns="columns"
      :data="tenantsData"
      @row-click="handleRowClick"
      @cell-button-click="handleCellButtonClick"
      empty-text="テナントが見つかりません"
    />

    <!-- Grid View (Cards) -->
    <div v-if="!isLoading && viewMode === 'grid'">
      <a-row :gutter="[24, 24]" v-if="tenantsData.length > 0">
        <a-col
          v-for="tenant in tenantsData"
          :key="tenant.id"
          :xs="24"
          :sm="12"
          :lg="8"
        >
          <TenantCard :tenant="tenant" @click="handleRowClick" />
        </a-col>
      </a-row>
      <div
        v-else
        class="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300"
      >
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <BusinessIcon class="text-3xl text-gray-400" />
          </div>
          <p class="text-gray-600 text-lg font-semibold mb-2">テナントが見つかりません</p>
          <p class="text-gray-500 text-sm">検索条件を変更してお試しください</p>
        </div>
      </div>
    </div>

    <!-- Bottom Pagination -->
    <Pagination
      v-if="!isLoading && tenantsData.length > 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :total-count="totalCount"
      :display-count="tenantsData.length"
      :show-pagination="!searchQuery"
      @change="handlePageChange"
      class="mt-6"
    />
  </MainLayout>
</template>

<style scoped>
/* Styles moved to Pagination component */
</style>
