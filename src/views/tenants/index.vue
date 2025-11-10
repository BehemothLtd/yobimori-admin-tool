<script setup lang="ts">
import { ref, onMounted } from "vue";
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
    <SearchForm :columns="1">
      <template #fields>
        <TextField
          v-model="searchQuery"
          label="テナント名で検索"
          placeholder="テナント名を入力してください"
          @keyup.enter="handleSearch"
        />
      </template>
      <template #actions>
        <BaseButton variant="primary" @click="handleSearch"> 検索 </BaseButton>
        <BaseButton variant="secondary" @click="handleReset">
          リセット
        </BaseButton>
      </template>
    </SearchForm>

    <div class="flex justify-end mb-4">
      <BaseButton variant="primary" @click="handleCreateTenant">
        テナント作成
      </BaseButton>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" />

    <!-- Data Table -->
    <DataTable
      v-else
      :columns="columns"
      :data="tenantsData"
      @row-click="handleRowClick"
      @cell-button-click="handleCellButtonClick"
      empty-text="テナントが見つかりません"
    />

    <!-- Pagination -->
    <div v-if="!isLoading && !searchQuery" class="mt-4 flex justify-center">
      <a-pagination
        v-model:current="currentPage"
        :total="totalCount"
        :page-size="pageSize"
        :show-size-changer="false"
        :show-total="(total: number) => `合計 ${total} 件以上`"
        @change="handlePageChange"
      />
    </div>

    <!-- Results Info -->
    <div v-if="!isLoading && searchQuery" class="mt-4 text-sm text-gray-600">
      {{ tenantsData.length }} 件のテナントが見つかりました
    </div>
  </MainLayout>
</template>
