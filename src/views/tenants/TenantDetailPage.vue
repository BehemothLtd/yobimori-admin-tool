<script setup lang="ts">
import { ref, onMounted } from "vue";
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
import useSwal from "@/composable/useSwal";
import useTenants from "@/composable/useTenants";
import useCurrentUser from "@/composable/useCurrentUser";
import type { Tenant, LinkedTenant } from "@/types/tenant";

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

const tenant = ref<Tenant | null>(null);
const linkedTenants = ref<LinkedTenant[]>([]);
const allTenants = ref<Tenant[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const isLoadingTenants = ref(false);

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
  linkedTenants.value = await getLinkedTenants(tenantId);
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

  // Get IDs of already linked tenants
  const linkedTenantIds = new Set(
    linkedTenants.value.map((lt) => lt.linkedTenantId)
  );

  // Filter out current tenant and already linked tenants
  allTenants.value = tenants.filter(
    (t) => t.id !== tenant.value!.id && !linkedTenantIds.has(t.id)
  );

  isLoadingTenants.value = false;
};

onMounted(async () => {
  await fetchTenant();
  await fetchLinkedTenants();
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
      <!-- Page Header -->
      <PageHeader
        title="テナント詳細"
        :description="tenant.name"
        :icon="BusinessIcon"
      >
      </PageHeader>

      <!-- Tenant Details Card -->
      <div class="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <h3
          class="text-start text-base sm:text-lg font-semibold text-gray-900 mb-4"
        >
          基本情報
        </h3>

        <div class="space-y-4">
          <!-- Tenant ID (Read-only) -->
          <div>
            <label
              class="text-start block text-sm font-medium text-gray-700 mb-1"
            >
              テナントID
            </label>
            <div
              class="text-start w-full px-3 py-2 text-sm text-gray-900 font-mono bg-gray-50 border border-gray-300 rounded-md break-all"
            >
              {{ tenant.id }}
            </div>
          </div>

          <!-- Tenant Name (Editable) -->
          <div>
            <label
              class="text-start block text-sm font-medium text-gray-700 mb-1"
            >
              テナント名 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="tenantForm.name"
              type="text"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="テナント名を入力してください"
            />
          </div>

          <!-- Tenant Address (Editable) -->
          <div>
            <label
              class="text-start block text-sm font-medium text-gray-700 mb-1"
            >
              住所 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="tenantForm.address"
              type="text"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="住所を入力してください"
            />
          </div>

          <!-- Update Button -->
          <div class="flex justify-end pt-2">
            <BaseButton
              variant="primary"
              @click="handleUpdateTenant"
              :disabled="isSaving || !tenantForm.name || !tenantForm.address"
            >
              <span v-if="isSaving">更新中...</span>
              <span v-else>更新</span>
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Linked Tenants Section -->
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

    <!-- Not Found -->
    <div v-else class="text-center py-12">
      <p class="text-gray-600 mb-4">テナントが見つかりませんでした</p>
      <BaseButton variant="primary" @click="handleBack">
        テナント一覧に戻る
      </BaseButton>
    </div>
  </MainLayout>
</template>
