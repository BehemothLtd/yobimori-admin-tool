<script setup lang="ts">
import { ref, computed } from "vue";
import { BaseButton, TextField, LoadingSpinner } from "@/components/base";
import SearchIcon from "@/components/icons/SearchIcon.vue";

interface Tenant {
  id: string;
  name: string;
  address: string;
}

interface Props {
  isOpen: boolean;
  tenants: Tenant[];
  currentTenantId: string;
  loading?: boolean;
}

interface Emits {
  (e: "close"): void;
  (e: "select", tenant: Tenant, realtime: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const searchQuery = ref("");
const selectedTenant = ref<Tenant | null>(null);
const showConfirmModal = ref(false);
const realtimeEnabled = ref(false);

// Filter tenants (exclude current tenant and apply search)
const filteredTenants = computed(() => {
  return props.tenants
    .filter((t) => t.id !== props.currentTenantId)
    .filter((t) => {
      if (!searchQuery.value) return true;
      const query = searchQuery.value.toLowerCase();
      return (
        t.name.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.address?.toLowerCase().includes(query)
      );
    });
});

const handleSelectTenant = (tenant: Tenant) => {
  selectedTenant.value = tenant;
  showConfirmModal.value = true;
};

const handleConfirm = () => {
  if (selectedTenant.value) {
    emit("select", selectedTenant.value, realtimeEnabled.value);
    handleClose();
  }
};

const handleClose = () => {
  searchQuery.value = "";
  selectedTenant.value = null;
  showConfirmModal.value = false;
  realtimeEnabled.value = false;
  emit("close");
};

const handleCancelConfirm = () => {
  selectedTenant.value = null;
  showConfirmModal.value = false;
  realtimeEnabled.value = false;
};
</script>

<template>
  <!-- Main Modal - Tenant Selection -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen && !showConfirmModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        <!-- Modal Content -->
        <div
          class="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
        >
          <div
            class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl"
          >
            <!-- Header -->
            <div
              class="flex items-center justify-between border-b border-gray-200 px-6 py-4"
            >
              <h3 class="text-lg font-semibold text-gray-900">
                リンクテナント選択
              </h3>
              <button
                @click="handleClose"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Search Bar -->
            <div class="px-6 py-4 border-b border-gray-200">
              <TextField
                v-model="searchQuery"
                placeholder="テナント名、ID、住所で検索"
                :icon="SearchIcon"
              />
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="px-6 py-12">
              <LoadingSpinner />
            </div>

            <!-- Tenant List -->
            <div v-else class="px-6 py-4 max-h-96 overflow-y-auto">
              <div
                v-if="filteredTenants.length === 0"
                class="text-center py-8 text-gray-500"
              >
                {{
                  searchQuery ? "検索結果がありません" : "テナントがありません"
                }}
              </div>

              <div v-else class="space-y-2">
                <button
                  v-for="tenant in filteredTenants"
                  :key="tenant.id"
                  @click="handleSelectTenant(tenant)"
                  class="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-all"
                >
                  <div class="font-semibold text-gray-900 mb-1">
                    {{ tenant.name }}
                  </div>
                  <div class="text-sm text-gray-600 mb-2">
                    {{ tenant.address }}
                  </div>
                  <div class="text-xs text-gray-500 font-mono">
                    ID: {{ tenant.id }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-200 px-6 py-4">
              <div class="flex justify-end">
                <BaseButton variant="secondary" @click="handleClose">
                  キャンセル
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Confirmation Modal -->
    <Transition name="modal">
      <div
        v-if="showConfirmModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleCancelConfirm"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        <!-- Modal Content -->
        <div
          class="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
        >
          <div
            class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                リンク作成確認
              </h3>
            </div>

            <!-- Content -->
            <div class="px-6 py-4">
              <p class="text-sm text-gray-700 mb-4">
                以下のテナントとリンクを作成します。よろしいですか？
              </p>

              <div
                class="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4"
              >
                <div class="font-semibold text-gray-900 mb-1">
                  {{ selectedTenant?.name }}
                </div>
                <div class="text-sm text-gray-600 mb-2">
                  {{ selectedTenant?.address }}
                </div>
                <div class="text-xs text-gray-500 font-mono">
                  ID: {{ selectedTenant?.id }}
                </div>
              </div>

              <!-- Realtime Checkbox -->
              <div class="flex items-center space-x-3">
                <input
                  id="realtime-checkbox"
                  v-model="realtimeEnabled"
                  type="checkbox"
                  class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                />
                <label
                  for="realtime-checkbox"
                  class="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  リアルタイム同期を有効にする
                </label>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-200 px-6 py-4">
              <div class="flex justify-end space-x-3">
                <BaseButton variant="secondary" @click="handleCancelConfirm">
                  キャンセル
                </BaseButton>
                <BaseButton variant="primary" @click="handleConfirm">
                  作成
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
