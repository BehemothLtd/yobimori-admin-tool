<script setup lang="ts">
import { ref, watch } from "vue";
import { ToggleSwitch } from "@/components/base";
import CreateLinkedTenantModal from "./CreateLinkedTenantModal.vue";
import type { Tenant, LinkedTenant } from "@/types/tenant";

interface Props {
  tenantId: string;
  linkedTenants: LinkedTenant[];
  allTenants?: Tenant[];
  loading?: boolean;
}

interface Emits {
  (e: "toggle-realtime", linkedTenant: LinkedTenant): void;
  (e: "delete", linkedTenant: LinkedTenant): void;
  (e: "create", selectedTenant: Tenant, realtime: boolean): void;
  (e: "load-tenants"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isModalOpen = ref(false);
const availableTenants = ref<Tenant[]>([]);

const handleToggleRealtime = (linkedTenant: LinkedTenant) => {
  emit("toggle-realtime", linkedTenant);
};

const handleDeleteLinkedTenant = (linkedTenant: LinkedTenant) => {
  emit("delete", linkedTenant);
};

const handleOpenCreateModal = () => {
  isModalOpen.value = true;

  if (props.allTenants && props.allTenants.length > 0) {
    availableTenants.value = props.allTenants;
  } else {
    availableTenants.value = [];

    emit("load-tenants");
  }
};

watch(
  () => props.allTenants,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      availableTenants.value = newValue;
    }
  }
);

const handleCloseModal = () => {
  isModalOpen.value = false;

  availableTenants.value = [];
};

const handleCreateLinkedTenant = (
  selectedTenant: Tenant,
  realtime: boolean
) => {
  emit("create", selectedTenant, realtime);
  isModalOpen.value = false;
};
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-6 shadow-sm border border-orange-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#ef654d] to-[#ff8a65] shadow-md">
            <span class="text-2xl">🔗</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">
              リンクテナント一覧
            </h3>
            <p class="text-sm text-gray-600 mt-0.5">
              {{ linkedTenants.length }}件のテナントがリンクされています
            </p>
          </div>
        </div>
        <button
          @click="handleOpenCreateModal"
          class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ef654d] to-[#ff8a65] text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:from-[#ff8a65] hover:to-[#ef654d] transition-all duration-200"
        >
          <span class="text-lg">+</span>
          <span>新規作成</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="linkedTenants.length === 0"
      class="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center"
    >
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span class="text-3xl">🔗</span>
        </div>
        <p class="text-gray-600 text-lg font-semibold mb-2">リンクテナントがありません</p>
        <p class="text-gray-500 text-sm mb-6">新しいテナントをリンクして連携を開始しましょう</p>
        <button
          @click="handleOpenCreateModal"
          class="px-6 py-2.5 bg-gradient-to-r from-[#ef654d] to-[#ff8a65] text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all"
        >
          + 最初のリンクテナントを作成
        </button>
      </div>
    </div>

    <!-- Linked Tenants List -->
    <div v-else class="space-y-4">
      <div
        v-for="linkedTenant in linkedTenants"
        :key="linkedTenant.id"
        class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-orange-200"
      >
        <!-- Card Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h4 class="text-lg font-bold text-gray-900 mb-2">
              {{ linkedTenant.tenant.name }}
            </h4>
            <p class="text-sm text-gray-600 flex items-center gap-2">
              <span>📍</span>
              {{ linkedTenant.tenant.address }}
            </p>
          </div>
        </div>

        <!-- Card Details -->
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-gray-500 font-medium">テナントID:</span>
            <span class="text-gray-900 font-mono text-xs break-all flex-1">
              {{ linkedTenant.tenant.id }}
            </span>
          </div>
        </div>

        <!-- Card Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <!-- Realtime Toggle -->
          <div class="flex items-center gap-3">
            <ToggleSwitch
              :model-value="linkedTenant.realtime"
              @update:model-value="handleToggleRealtime(linkedTenant)"
            />
            <span class="text-sm font-semibold text-gray-700">
              即時通知連携
            </span>
          </div>

          <!-- Delete Button -->
          <button
            @click="handleDeleteLinkedTenant(linkedTenant)"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <span>🗑️</span>
            <span>削除</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Create Linked Tenant Modal -->
    <CreateLinkedTenantModal
      :is-open="isModalOpen"
      :tenants="availableTenants"
      :current-tenant-id="tenantId"
      :loading="loading || false"
      @close="handleCloseModal"
      @select="handleCreateLinkedTenant"
    />
  </div>
</template>
