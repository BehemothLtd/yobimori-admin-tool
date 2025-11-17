<script setup lang="ts">
import { computed } from "vue";
import BusinessIcon from "@/components/icons/BusinessIcon.vue";

interface Props {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  displayCount: number;
  showPagination?: boolean;
}

interface Emits {
  (e: "change", page: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  showPagination: true,
});

const emit = defineEmits<Emits>();

const totalPages = computed(() => Math.ceil(props.totalCount / props.pageSize));

const handlePageChange = (page: number) => {
  emit("change", page);
};
</script>

<template>
  <div class="bg-gradient-to-r from-orange-50 via-white to-pink-50 rounded-2xl shadow-md border-2 border-orange-100 p-5">
    <div class="flex items-center justify-between gap-6">
      <!-- Left: Icon and Info -->
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <BusinessIcon class="text-white text-2xl" />
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">表示中:</span>
            <span class="text-lg font-bold text-orange-600">{{ displayCount }}</span>
            <span class="text-sm text-gray-600">件</span>
          </div>
          <span class="text-gray-400">•</span>
          <div v-if="showPagination" class="flex items-center gap-2">
            <span class="text-sm text-gray-600">ページ:</span>
            <span class="text-lg font-bold text-orange-600">{{ currentPage }}</span>
            <span class="text-sm text-gray-600">/ {{ totalPages }}</span>
          </div>
          <span v-if="showPagination" class="text-gray-400">•</span>
          <div v-if="showPagination" class="flex items-center gap-2">
            <span class="text-sm text-gray-600">総件数:</span>
            <span class="text-lg font-bold text-blue-600">{{ totalCount }}</span>
            <span class="text-sm text-gray-600">件</span>
          </div>
        </div>
      </div>

      <!-- Right: Pagination -->
      <div v-if="showPagination" class="flex-shrink-0">
        <a-pagination
          :current="currentPage"
          :total="totalCount"
          :page-size="pageSize"
          :show-size-changer="false"
          :show-total="(total: number) => `合計 ${total} 件`"
          @change="handlePageChange"
          simple
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.ant-pagination-simple) {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.ant-pagination-simple .ant-pagination-prev),
:deep(.ant-pagination-simple .ant-pagination-next) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  transition: all 0.25s ease;
  color: #6b7280;
}

:deep(.ant-pagination-simple .ant-pagination-prev:hover),
:deep(.ant-pagination-simple .ant-pagination-next:hover) {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef654d;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgb(239 101 77 / 0.15);
}

:deep(.ant-pagination-simple .ant-pagination-prev.ant-pagination-disabled),
:deep(.ant-pagination-simple .ant-pagination-next.ant-pagination-disabled) {
  opacity: 0.3;
  cursor: not-allowed;
}

:deep(.ant-pagination-simple .ant-pagination-prev.ant-pagination-disabled:hover),
:deep(.ant-pagination-simple .ant-pagination-next.ant-pagination-disabled:hover) {
  background: #f9fafb;
  border-color: #e5e7eb;
  color: #6b7280;
  transform: none;
  box-shadow: none;
}

:deep(.ant-pagination-simple .ant-pagination-simple-pager) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.ant-pagination-simple .ant-pagination-simple-pager input) {
  width: 50px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: white;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
  transition: all 0.25s ease;
}

:deep(.ant-pagination-simple .ant-pagination-simple-pager input:hover) {
  border-color: #fecaca;
  background: #fef2f2;
}

:deep(.ant-pagination-simple .ant-pagination-simple-pager input:focus) {
  outline: none;
  border-color: #ef654d;
  background: white;
  box-shadow: 0 0 0 3px rgb(239 101 77 / 0.1);
}

:deep(.ant-pagination-simple .ant-pagination-slash) {
  font-size: 16px;
  font-weight: 500;
  color: #9ca3af;
}

:deep(.ant-pagination-simple .ant-pagination-total-text) {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}
</style>
