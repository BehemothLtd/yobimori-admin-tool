<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import {
  Breadcrumb,
  PageHeader,
  BaseButton,
  LoadingSpinner,
} from "@/components/base";
import BusinessIcon from "@/components/icons/BusinessIcon.vue";
import LinkedTenantsList from "@/components/tenants/LinkedTenantsList.vue";
import TenantStatisticsCards from "@/components/TenantStatisticsCards.vue";
import useSwal from "@/composable/useSwal";
import useTenants from "@/composable/useTenants";
import useCurrentUser from "@/composable/useCurrentUser";
import useStatistics from "@/composable/useStatistics";
import type { Tenant, LinkedTenant } from "@/types/tenant";

// Active tab state
const activeTab = ref<"overview" | "links">("overview");

const route = useRoute();
const router = useRouter();
const { confirming, success, error } = useSwal();
const {
  getTenantById,
  getLinkedTenants,
  updateTenant: updateTenantAPI,
  updateTenantLink,
  deleteTenantLink,
  createTenantLink,
  getTenants,
} = useTenants();
const { getUserId } = useCurrentUser();
const { getTenantStats } = useStatistics();

const tenant = ref<Tenant | null>(null);
const linkedTenants = ref<LinkedTenant[]>([]);
const allTenants = ref<Tenant[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const isLoadingTenants = ref(false);

// Tenant statistics
const tenantStats = ref({
  fisherUserCount: 0,
  openAccidentCount: 0,
  totalAccidentCount: 0,
  linkedTenantsCount: 0,
});
const isLoadingStats = ref(true);

// Form data
const tenantForm = ref({
  name: "",
  address: "",
});

// Breadcrumb data
const breadcrumbItems = ref([
  { label: "ホーム", to: "/" },
  { label: "テナント管理", to: "/tenants" },
  { label: "詳細" },
]);

// Fetch tenant data from API
const fetchTenant = async () => {
  isLoading.value = true;

  const tenantId = route.params.id as string;
  const result = await getTenantById(tenantId);

  if (result) {
    tenant.value = result;
    tenantForm.value = {
      name: result.name,
      address: result.address,
    };
    if (breadcrumbItems.value[2]) {
      breadcrumbItems.value[2].label = result.name;
    }
  }

  isLoading.value = false;
};

// Fetch linked tenants
const fetchLinkedTenants = async () => {
  const tenantId = route.params.id as string;
  const result = await getLinkedTenants(tenantId);
  linkedTenants.value = result || [];
};

const handleUpdateTenant = async () => {
  const confirmed = await confirming({
    title: "テナント情報を更新しますか？",
    text: "この操作を実行すると、テナント情報が更新されます。",
    icon: "question",
  });

  if (!confirmed) return;

  isSaving.value = true;

  try {
    const result = await updateTenantAPI({
      id: tenant.value!.id,
      name: tenantForm.value.name,
      address: tenantForm.value.address,
    });

    if (result) {
      tenant.value!.name = result.name;
      tenant.value!.address = result.address;
      if (breadcrumbItems.value[2]) {
        breadcrumbItems.value[2].label = result.name;
      }

      await success({
        title: "更新成功",
        text: "テナント情報が正常に更新されました。",
      });
    }
  } catch (err) {
    await error({
      title: "更新失敗",
      text: "テナント情報の更新に失敗しました。",
    });
  } finally {
    isSaving.value = false;
  }
};

const handleBack = () => {
  router.push("/tenants");
};

// Handle linked tenants events
const handleToggleRealtime = async (linkedTenant: LinkedTenant) => {
  const newStatus = !linkedTenant.realtime;
  const confirmed = await confirming({
    title: "リアルタイム設定を変更しますか？",
    text: `リアルタイム設定を「${newStatus ? "有効" : "無効"}」に変更します。`,
    icon: "question",
  });

  if (!confirmed) return;

  const result = await updateTenantLink({
    tenantId: linkedTenant.tenantId,
    linkedTenantId: linkedTenant.linkedTenantId,
  });

  if (result) {
    await fetchLinkedTenants();

    await success({
      title: "更新成功",
      text: `リアルタイム設定が「${
        result.realtime ? "有効" : "無効"
      }」に更新されました。`,
    });
  }
};

const handleDeleteLinkedTenant = async (linkedTenant: LinkedTenant) => {
  const confirmed = await confirming({
    title: "リンクを削除しますか？",
    text: `「${linkedTenant.tenant.name}」とのリンクを削除します。この操作は元に戻せません。`,
    icon: "warning",
    confirmButtonText: "削除",
  });

  if (!confirmed) return;

  const result = await deleteTenantLink({
    tenantId: linkedTenant.tenantId,
    linkedTenantId: linkedTenant.linkedTenantId,
  });

  if (result) {
    await fetchLinkedTenants();

    await success({
      title: "削除成功",
      text: "リンクが正常に削除されました。",
    });
  }
};

const handleCreateLinkedTenant = async (
  selectedTenant: Tenant,
  realtime: boolean
) => {
  const userId = await getUserId();

  const result = await createTenantLink({
    tenantId: tenant.value!.id,
    linkedTenantId: selectedTenant.id,
    createdBy: userId,
    realtime,
  });

  if (result) {
    await fetchLinkedTenants();

    await success({
      title: "作成成功",
      text: "リンクテナントが正常に作成されました。",
    });
  }
};

const handleLoadTenants = async () => {
  if (allTenants.value.length > 0) return;

  isLoadingTenants.value = true;

  const { tenants } = await getTenants({ excludeTest: true });

  const linkedTenantIds = new Set(
    linkedTenants.value.map((lt) => lt.linkedTenantId)
  );

  allTenants.value = tenants.filter(
    (t) => t.id !== tenant.value!.id && !linkedTenantIds.has(t.id)
  );

  isLoadingTenants.value = false;
};

// Fetch tenant statistics
const fetchTenantStats = async () => {
  if (!tenant.value) return;

  isLoadingStats.value = true;
  try {
    const stats = await getTenantStats(tenant.value.id);
    if (stats) {
      tenantStats.value = {
        fisherUserCount: stats.fisherUserCount ?? 0,
        openAccidentCount: stats.openAccidentCount ?? 0,
        totalAccidentCount: stats.totalAccidentCount ?? 0,
        linkedTenantsCount: (linkedTenants.value || []).length,
      };
    } else {
      tenantStats.value = {
        fisherUserCount: 0,
        openAccidentCount: 0,
        totalAccidentCount: 0,
        linkedTenantsCount: (linkedTenants.value || []).length,
      };
    }
  } catch (err) {
    console.error("Failed to load tenant statistics:", err);
    tenantStats.value = {
      fisherUserCount: 0,
      openAccidentCount: 0,
      totalAccidentCount: 0,
      linkedTenantsCount: (linkedTenants.value || []).length,
    };
  } finally {
    isLoadingStats.value = false;
  }
};

onMounted(async () => {
  await fetchTenant();
  await fetchLinkedTenants();
  await fetchTenantStats();
});
</script>

<template>
  <MainLayout>
    <!-- Breadcrumb -->
    <div class="mb-6">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" />

    <!-- Content -->
    <div v-else-if="tenant">
      <!-- Page Header with Actions -->
      <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-8 shadow-md border border-orange-100">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#ef654d] to-[#ff8a65] shadow-lg">
              <BusinessIcon class="text-3xl text-white" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{{ tenant.name }}</h1>
              <p class="text-sm text-gray-600">テナント詳細情報</p>
              <div class="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 shadow-sm">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                アクティブ
              </div>
            </div>
          </div>
          <div class="flex gap-3">
            <BaseButton
              variant="primary"
              @click="router.push(`/tenants/${tenant.id}/accounts`)"
              class="shadow-md hover:shadow-lg transition-all"
            >
              アカウント一覧
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
          <nav class="flex gap-2" aria-label="Tabs">
            <button
              @click="activeTab = 'overview'"
              :class="[
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-[#ef654d] to-[#ff8a65] text-white shadow-md shadow-orange-500/30'
                  : 'text-gray-600 hover:bg-gray-100',
                'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200'
              ]"
            >
              <span class="text-lg">📋</span>
              <span>基本情報</span>
            </button>
            <button
              @click="activeTab = 'links'"
              :class="[
                activeTab === 'links'
                  ? 'bg-gradient-to-r from-[#ef654d] to-[#ff8a65] text-white shadow-md shadow-orange-500/30'
                  : 'text-gray-600 hover:bg-gray-100',
                'flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 relative'
              ]"
            >
              <span class="text-lg">🔗</span>
              <span>リンクテナント</span>
              <span
                :class="[
                  activeTab === 'links'
                    ? 'bg-white text-orange-600'
                    : 'bg-orange-100 text-orange-600',
                  'ml-1 px-2 py-0.5 text-xs rounded-full font-bold'
                ]"
              >
                {{ linkedTenants.length }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="mt-6">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Info Card -->
            <div class="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="w-1 h-6 bg-gradient-to-b from-[#ef654d] to-[#ff8a65] rounded-full"></span>
                基本情報
              </h3>

              <div class="space-y-5">
                <!-- Tenant ID -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2 text-left">
                    テナントID
                  </label>
                  <div class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-900 break-all">
                    {{ tenant.id }}
                  </div>
                </div>

                <!-- Tenant Name -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2 text-left">
                    テナント名 <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="tenantForm.name"
                    type="text"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all hover:border-gray-300"
                    placeholder="テナント名を入力"
                  />
                </div>

                <!-- Tenant Address -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2 text-left">
                    住所 <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="tenantForm.address"
                    type="text"
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all hover:border-gray-300"
                    placeholder="住所を入力"
                  />
                </div>

                <!-- Update Button -->
                <div class="flex justify-end pt-2">
                  <BaseButton
                    variant="primary"
                    @click="handleUpdateTenant"
                    :disabled="isSaving || !tenantForm.name || !tenantForm.address"
                    class="px-6 py-2.5 font-semibold shadow-md hover:shadow-lg transition-shadow"
                  >
                    <span v-if="isSaving">更新中...</span>
                    <span v-else>更新する</span>
                  </BaseButton>
                </div>
              </div>
            </div>

            <!-- Quick Stats Card -->
            <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-md border border-orange-100 p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span class="w-1 h-6 bg-gradient-to-b from-[#ef654d] to-[#ff8a65] rounded-full"></span>
                クイック統計
              </h3>

              <div class="space-y-4">
                <div class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" @click="activeTab = 'links'">
                  <div class="text-2xl font-bold text-orange-600">{{ tenantStats.linkedTenantsCount }}</div>
                  <div class="text-xs text-gray-600 mt-1">リンクテナント数</div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <div class="text-2xl font-bold text-green-600">{{ tenantStats.fisherUserCount }}</div>
                  <div class="text-xs text-gray-600 mt-1">ユーザー数</div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <div class="text-2xl font-bold text-amber-600">{{ tenantStats.openAccidentCount }}</div>
                  <div class="text-xs text-gray-600 mt-1">未解決事故</div>
                </div>

                <div class="bg-white rounded-lg p-4 shadow-sm">
                  <div class="text-2xl font-bold text-purple-600">{{ tenantStats.totalAccidentCount }}</div>
                  <div class="text-xs text-gray-600 mt-1">総事故数</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Links Tab -->
        <div v-if="activeTab === 'links'">
          <LinkedTenantsList
            :tenant-id="tenant.id"
            :linked-tenants="linkedTenants"
            :all-tenants="allTenants"
            :loading="isLoadingTenants"
            @toggle-realtime="handleToggleRealtime"
            @delete="handleDeleteLinkedTenant"
            @create="handleCreateLinkedTenant"
            @load-tenants="handleLoadTenants"
          />
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-12">
      <p class="text-gray-600 mb-4">テナントが見つかりませんでした</p>
      <BaseButton variant="primary" @click="handleBack">
        テナント一覧に戻る
      </BaseButton>
    </div>
  </MainLayout>
</template>
