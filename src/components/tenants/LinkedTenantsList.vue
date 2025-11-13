<script setup lang="ts">
import { ref, watch } from "vue";
import { BaseButton, ToggleSwitch } from "@/components/base";
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
  <div class="w-full bg-white rounded-lg shadow-md p-4 sm:p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900">
        リンクテナント一覧
        <span class="text-sm font-normal text-gray-500 ml-2">
          ({{ linkedTenants.length }}件)
        </span>
      </h3>
      <BaseButton variant="primary" size="sm" @click="handleOpenCreateModal">
        + 新規作成
      </BaseButton>
    </div>

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
            <h4 class="text-start text-base font-semibold text-gray-900 mb-1">
              {{ linkedTenant.tenant.name }}
            </h4>
            <p class="text-start text-sm text-gray-600">
              {{ linkedTenant.tenant.address }}
            </p>
          </div>
        </div>

        <!-- Card Details -->
        <div class="space-y-2 mb-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div class="text-start">
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
          <div class="flex items-center gap-x-3">
            <ToggleSwitch
              :model-value="linkedTenant.realtime"
              @update:model-value="handleToggleRealtime(linkedTenant)"
            />
            <span class="text-sm" v-if="linkedTenant.realtime">
              <span
                :class="[
                  'ml-2',
                  linkedTenant.realtime ? 'text-primary' : 'text-gray-500',
                ]"
              >
                即時通知連携
              </span>
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
