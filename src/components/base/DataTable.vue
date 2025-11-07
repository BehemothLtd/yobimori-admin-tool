<script setup lang="ts">
import { computed } from "vue";

export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "image" | "button" | "checkbox" | "custom";
  width?: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (row: any) => string;
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
  <div class="w-full bg-white rounded-lg shadow-md overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full w-full">
        <!-- Table Head -->
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <!-- Checkbox Column -->
            <th v-if="selectable" class="px-4 py-3 w-12">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleAll"
                class="rounded border-gray-300 text-primary focus:ring-primary"
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
                'px-4 py-3 text-sm font-semibold text-gray-700',
                getAlignClass(column.align),
                column.width ? '' : 'w-auto',
              ]"
            >
              <div
                class="flex items-center"
                :class="getAlignClass(column.align)"
              >
                {{ column.label }}
                <svg
                  v-if="column.sortable"
                  class="w-4 h-4 ml-1 text-gray-400"
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
          class="divide-y divide-gray-200"
        >
          <tr
            v-for="(row, rowIndex) in data"
            :key="rowIndex"
            @click="emit('row-click', row)"
            class="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
          >
            <!-- Checkbox Cell -->
            <td v-if="selectable" class="px-4 py-3">
              <input
                type="checkbox"
                :checked="isRowSelected(row)"
                @click.stop
                @change="toggleRow(row)"
                class="rounded border-gray-300 text-primary focus:ring-primary"
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
                'px-4 py-3 text-sm text-gray-900',
                getAlignClass(column.align),
                column.width ? '' : 'w-auto',
              ]"
            >
              <!-- Text -->
              <span v-if="!column.type || column.type === 'text'">
                {{ getCellValue(row, column) }}
              </span>

              <!-- Image -->
              <img
                v-else-if="column.type === 'image'"
                :src="getCellValue(row, column)"
                :alt="column.label"
                class="w-12 h-12 object-cover rounded"
              />

              <!-- Button -->
              <button
                v-else-if="column.type === 'button'"
                @click.stop="emit('cell-button-click', row, column)"
                class="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              >
                {{ getCellValue(row, column) }}
              </button>

              <!-- Checkbox -->
              <input
                v-else-if="column.type === 'checkbox'"
                type="checkbox"
                :checked="getCellValue(row, column)"
                class="rounded border-gray-300 text-primary focus:ring-primary"
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
              class="px-4 py-12 text-center"
            >
              <div class="flex items-center justify-center">
                <svg
                  class="animate-spin h-8 w-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span class="ml-2 text-gray-600">読み込み中...</span>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Empty State -->
        <tbody v-else>
          <tr>
            <td
              :colspan="columns.length + (selectable ? 1 : 0)"
              class="px-4 py-12 text-center text-gray-500"
            >
              {{ emptyText }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
