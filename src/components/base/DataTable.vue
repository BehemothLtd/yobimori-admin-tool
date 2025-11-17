<script setup lang="ts">
import { computed, type VNode } from "vue";

export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "image" | "button" | "checkbox" | "custom";
  width?: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (row: any) => string | VNode;
}

interface Props {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  selectable?: boolean;
  selectedRows?: any[];
  emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectable: false,
  selectedRows: () => [],
  emptyText: "データがありません",
});

const emit = defineEmits<{
  "row-click": [row: any];
  "update:selectedRows": [rows: any[]];
  "cell-button-click": [row: any, column: TableColumn];
}>();

const allSelected = computed(() => {
  return (
    props.data.length > 0 && props.selectedRows.length === props.data.length
  );
});

const toggleAll = () => {
  if (allSelected.value) {
    emit("update:selectedRows", []);
  } else {
    emit("update:selectedRows", [...props.data]);
  }
};

const toggleRow = (row: any) => {
  const selected = [...props.selectedRows];
  const index = selected.findIndex((r) => r === row);

  if (index > -1) {
    selected.splice(index, 1);
  } else {
    selected.push(row);
  }

  emit("update:selectedRows", selected);
};

const isRowSelected = (row: any) => {
  return props.selectedRows.includes(row);
};

const getCellValue = (row: any, column: TableColumn) => {
  if (column.render) {
    return column.render(row);
  }
  return row[column.key];
};

const getAlignClass = (align?: string) => {
  switch (align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
};
</script>

<template>
  <div class="w-full bg-white rounded-2xl shadow-md border-2 border-orange-100 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full w-full">
        <!-- Table Head -->
        <thead class="bg-gradient-to-r from-orange-50 via-white to-pink-50 border-b-2 border-orange-100">
          <tr>
            <!-- Checkbox Column -->
            <th v-if="selectable" class="px-6 py-4 w-12">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleAll"
                class="w-4 h-4 rounded border-2 border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer transition-all"
              />
            </th>

            <!-- Data Columns -->
            <th
              v-for="column in columns"
              :key="column.key"
              :style="
                column.width
                  ? { width: column.width, minWidth: column.width }
                  : { minWidth: '150px' }
              "
              :class="[
                'px-6 py-4 text-sm font-bold text-gray-800 uppercase tracking-wide',
                getAlignClass(column.align),
                column.width ? '' : 'w-auto',
              ]"
            >
              <div
                class="flex items-center gap-2"
                :class="getAlignClass(column.align)"
              >
                {{ column.label }}
                <svg
                  v-if="column.sortable"
                  class="w-4 h-4 text-gray-400 hover:text-orange-600 cursor-pointer transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody
          v-if="!loading && data.length > 0"
          class="divide-y divide-gray-100"
        >
          <tr
            v-for="(row, rowIndex) in data"
            :key="rowIndex"
            @click="emit('row-click', row)"
            class="hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition-all duration-200 cursor-pointer group"
          >
            <!-- Checkbox Cell -->
            <td v-if="selectable" class="px-6 py-4">
              <input
                type="checkbox"
                :checked="isRowSelected(row)"
                @click.stop
                @change="toggleRow(row)"
                class="w-4 h-4 rounded border-2 border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer transition-all"
              />
            </td>

            <!-- Data Cells -->
            <td
              v-for="column in columns"
              :key="column.key"
              :style="
                column.width
                  ? { width: column.width, minWidth: column.width }
                  : { minWidth: '150px' }
              "
              :class="[
                'px-6 py-4 text-sm text-gray-800',
                getAlignClass(column.align),
                column.width ? '' : 'w-auto',
              ]"
            >
              <!-- Text -->
              <template v-if="!column.type || column.type === 'text'">
                <component
                  v-if="typeof getCellValue(row, column) === 'object'"
                  :is="getCellValue(row, column)"
                />
                <span v-else class="font-medium">
                  {{ getCellValue(row, column) }}
                </span>
              </template>

              <!-- Image -->
              <img
                v-else-if="column.type === 'image'"
                :src="getCellValue(row, column)"
                :alt="column.label"
                class="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
              />

              <!-- Button -->
              <button
                v-else-if="column.type === 'button'"
                @click.stop="emit('cell-button-click', row, column)"
                class="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
              >
                {{ getCellValue(row, column) }}
              </button>

              <!-- Checkbox -->
              <input
                v-else-if="column.type === 'checkbox'"
                type="checkbox"
                :checked="getCellValue(row, column)"
                class="w-4 h-4 rounded border-2 border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer"
                @click.stop
              />

              <!-- Custom Slot -->
              <div v-else-if="column.type === 'custom'">
                <slot
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="getCellValue(row, column)"
                >
                  {{ getCellValue(row, column) }}
                </slot>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Loading State -->
        <tbody v-else-if="loading">
          <tr>
            <td
              :colspan="columns.length + (selectable ? 1 : 0)"
              class="px-6 py-16 text-center"
            >
              <div class="flex flex-col items-center justify-center gap-3">
                <div class="relative">
                  <div class="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
                  <div class="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <span class="text-gray-600 font-medium">読み込み中...</span>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Empty State -->
        <tbody v-else>
          <tr>
            <td
              :colspan="columns.length + (selectable ? 1 : 0)"
              class="px-6 py-16 text-center"
            >
              <div class="flex flex-col items-center justify-center gap-3">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                </div>
                <span class="text-gray-600 font-semibold text-base">{{ emptyText }}</span>
                <span class="text-gray-500 text-sm">検索条件を変更してお試しください</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
