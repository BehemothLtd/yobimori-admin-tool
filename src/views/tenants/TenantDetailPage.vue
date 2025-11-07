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
import useSwal from "@/composable/useSwal";

const route = useRoute();
const router = useRouter();
const { confirming, success, error } = useSwal();

interface Tenant {
  id: string;
  name: string;
  address: string;
}

interface LinkedTenant {
  id: string;
  tenantId: string;
  linkedTenantId: string;
  realtime: boolean;
  createdAt: number;
  createdBy: string;
  tenant: {
    id: string;
    name: string;
    address: string;
    createdAt: number;
    updatedAt: number;
    topicArn: string;
  };
}

const tenant = ref<Tenant | null>(null);
const linkedTenants = ref<LinkedTenant[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);

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

// Mock fetch tenant data
const fetchTenant = async () => {
  isLoading.value = true;

  // Mock data - normally would fetch from API
  const mockTenants = [
    {
      id: "d665f4b8-7334-48a6-a6d3-3e00258fd613",
      name: "test-tenant-20230102105523.41",
      address: "岐阜漁港第五埠頭三番地",
      linkedTenants: [
        {
          id: "0432c100-190b-4f5f-bdff-6e2a27a04778",
          tenantId: "d665f4b8-7334-48a6-a6d3-3e00258fd613",
          linkedTenantId: "46120abb-acb4-4f32-86e1-5d5349ccfaec",
          realtime: false,
          createdAt: 1759905921560,
          createdBy: "test123",
          tenant: {
            address: "岐阜漁港第五埠頭三番地 26091539",
            createdAt: 1758875992541,
            id: "46120abb-acb4-4f32-86e1-5d5349ccfaec",
            name: "tesuto-btenant-2025-26091539",
            updatedAt: 1761037831582,
            topicArn: "dummy-topic-arn",
          },
        },
        {
          id: "cd938755-ee7c-4d84-a515-cf5fee7f5df6",
          tenantId: "d665f4b8-7334-48a6-a6d3-3e00258fd613",
          linkedTenantId: "6d136363-64f7-44bb-9a38-9ee4f0d16162",
          realtime: true,
          createdAt: 1761663856889,
          createdBy: "d8afbb09-7482-4e01-b04b-c35bd41f86bf",
          tenant: {
            address: "岐阜漁港第五埠頭三番地-2",
            createdAt: 1758855571500,
            id: "6d136363-64f7-44bb-9a38-9ee4f0d16162",
            name: "tesuto-btenant-2025-2609",
            updatedAt: 1761037797955,
            topicArn: "dummy-topic-arn",
          },
        },
      ],
    },
    {
      id: "6c981d3b-6752-4cab-8d55-273fa3e268a6",
      name: "test-from-tenant-20230513104307.587863982-04c8c83d-b412-4c4e-86de-7ea4cbaa3327",
      address: "東京都港区六本木1-2-3",
      linkedTenants: [
        {
          id: "abc12345-1234-5678-90ab-cdef12345678",
          tenantId: "6c981d3b-6752-4cab-8d55-273fa3e268a6",
          linkedTenantId: "def67890-abcd-1234-5678-90abcdef6789",
          realtime: true,
          createdAt: 1758900000000,
          createdBy: "admin001",
          tenant: {
            address: "大阪府大阪市北区梅田1-1-1",
            createdAt: 1758800000000,
            id: "def67890-abcd-1234-5678-90abcdef6789",
            name: "test-tenant-osaka-001",
            updatedAt: 1761000000000,
            topicArn: "dummy-topic-arn",
          },
        },
      ],
    },
    {
      id: "760c1dfb-abbb-49f1-9497-3f5721db42b3",
      name: "test-tenant-20230110231344.42",
      address: "神奈川県横浜市中区本町5-6-7",
      linkedTenants: [],
    },
  ];

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const tenantId = route.params.id as string;
  const foundTenant = mockTenants.find((t) => t.id === tenantId);

  if (foundTenant) {
    tenant.value = {
      id: foundTenant.id,
      name: foundTenant.name,
      address: foundTenant.address,
    };
    linkedTenants.value = foundTenant.linkedTenants || [];
    tenantForm.value = {
      name: foundTenant.name,
      address: foundTenant.address,
    };
    if (breadcrumbItems.value[2]) {
      breadcrumbItems.value[2].label = foundTenant.name;
    }
  }

  isLoading.value = false;
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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update tenant data
    if (tenant.value) {
      tenant.value.name = tenantForm.value.name;
      tenant.value.address = tenantForm.value.address;
      if (breadcrumbItems.value[2]) {
        breadcrumbItems.value[2].label = tenantForm.value.name;
      }
    }

    await success({
      title: "更新成功",
      text: "テナント情報が正常に更新されました。",
    });
  } catch (err) {
    await error({
      title: "更新失敗",
      text: "テナント情報の更新に失敗しました。",
    });
  } finally {
    isSaving.value = false;
  }
};

const handleToggleRealtime = async (linkedTenant: LinkedTenant) => {
  const newStatus = !linkedTenant.realtime;
  const confirmed = await confirming({
    title: "リアルタイム設定を変更しますか？",
    text: `リアルタイム設定を「${newStatus ? "有効" : "無効"}」に変更します。`,
    icon: "question",
  });

  if (!confirmed) return;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    linkedTenant.realtime = newStatus;

    await success({
      title: "更新成功",
      text: "リアルタイム設定が正常に更新されました。",
    });
  } catch (err) {
    await error({
      title: "更新失敗",
      text: "リアルタイム設定の更新に失敗しました。",
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

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    linkedTenants.value = linkedTenants.value.filter(
      (lt) => lt.id !== linkedTenant.id
    );

    await success({
      title: "削除成功",
      text: "リンクが正常に削除されました。",
    });
  } catch (err) {
    await error({
      title: "削除失敗",
      text: "リンクの削除に失敗しました。",
    });
  }
};

const handleBack = () => {
  router.push("/tenants");
};

onMounted(() => {
  fetchTenant();
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
        <template #actions>
          <BaseButton variant="secondary" @click="handleBack">
            戻る
          </BaseButton>
        </template>
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
      <div class="w-full bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          リンクテナント一覧
          <span class="text-sm font-normal text-gray-500 ml-2">
            ({{ linkedTenants.length }}件)
          </span>
        </h3>

        <!-- Empty State -->
        <div
          v-if="linkedTenants.length === 0"
          class="text-center py-8 text-gray-500"
        >
          リンクテナントがありません
        </div>

        <!-- Linked Tenants List -->
        <div v-else class="space-y-4">
          <div
            v-for="linkedTenant in linkedTenants"
            :key="linkedTenant.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h4
                  class="flex items-start text-base font-semibold text-gray-900 mb-1"
                >
                  {{ linkedTenant.tenant.name }}
                </h4>
                <p class="flex items-start text-sm text-gray-600">
                  {{ linkedTenant.tenant.address }}
                </p>
              </div>
            </div>

            <!-- Card Details -->
            <div class="space-y-2 mb-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-gray-600">テナントID:</span>
                  <span class="ml-2 text-gray-900 font-mono text-xs break-all">
                    {{ linkedTenant.tenant.id }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div
              class="flex items-center justify-between pt-3 border-t border-gray-200"
            >
              <!-- Realtime Toggle -->
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-700 font-medium">
                  リアルタイム:
                </span>
                <button
                  @click="handleToggleRealtime(linkedTenant)"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    linkedTenant.realtime ? 'bg-primary' : 'bg-gray-300',
                  ]"
                  type="button"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      linkedTenant.realtime ? 'translate-x-6' : 'translate-x-1',
                    ]"
                  />
                </button>
                <span
                  :class="[
                    'text-sm font-medium',
                    linkedTenant.realtime ? 'text-primary' : 'text-gray-500',
                  ]"
                >
                  {{ linkedTenant.realtime ? "有効" : "無効" }}
                </span>
              </div>

              <!-- Delete Button -->
              <BaseButton
                variant="danger"
                size="sm"
                @click="handleDeleteLinkedTenant(linkedTenant)"
              >
                削除
              </BaseButton>
            </div>
          </div>
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
