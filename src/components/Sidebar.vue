<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  TeamOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";
import useSwal from "@/composable/useSwal";

const router = useRouter();
const route = useRoute();
const { success, error } = useSwal();

const collapsed = ref(false);

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value;
};

const handleLogout = async () => {
  try {
    await success({ title: "ログアウトしました" });
    router.push("/");
    window.location.reload();
  } catch (err) {
    console.error("Logout error:", err);
    await error({ title: "ログアウトに失敗しました" });
  }
};

const selectedKeys = computed(() => {
  const path = route.path;
  if (path === "/") return ["home"];
  if (path.startsWith("/tenants")) return ["tenants"];
  if (path.startsWith("/bulkOperations")) return ["bulkOperations"];
  if (path.startsWith("/device-search")) return ["deviceSearch"];
  if (path.startsWith("/device-logs")) return ["deviceLogs"];
  return [];
});

const navigate = (path: string, enabled: boolean = true) => {
  if (enabled && path !== "#") {
    router.push(path);
  }
};

const menuItems = [
  {
    key: "home",
    icon: HomeOutlined,
    label: "ホーム",
    path: "/",
    enabled: true,
  },
  {
    key: "tenants",
    icon: TeamOutlined,
    label: "テナント管理",
    path: "/tenants",
    enabled: true,
  },
  {
    key: "bulkOperations",
    icon: CloudUploadOutlined,
    label: "一括操作",
    path: "/bulkOperations",
    enabled: true,
  },
  {
    key: "deviceSearch",
    icon: SearchOutlined,
    label: "デバイス検索",
    path: "/device-search",
    enabled: true,
  },
  {
    key: "deviceLogs",
    icon: HistoryOutlined,
    label: "デバイスログ確認",
    path: "/device-logs",
    enabled: true,
  },
  {
    key: "accidents",
    icon: ExclamationCircleOutlined,
    label: "事故情報管理",
    path: "#",
    enabled: false,
  },
];
</script>

<template>
  <div
    :class="[
      'hidden lg:flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 shadow-md',
      collapsed ? 'w-20' : 'w-64',
    ]"
  >
    <!-- Header -->
    <div
      class="flex items-center border-b border-gray-200 bg-gradient-to-r from-orange-50 to-pink-50 transition-all duration-300"
      :class="collapsed ? 'justify-center p-3' : 'justify-between p-4'"
    >
      <!-- Logo and Title (hidden when collapsed) -->
      <div
        v-if="!collapsed"
        class="flex items-center gap-2 min-w-0"
      >
        <div class="bg-white rounded-full p-1 shadow-sm flex-shrink-0">
          <img
            src="@/assets/yobimori.png"
            alt="Yobimori"
            class="h-6 w-6 object-contain"
          />
        </div>
        <span class="text-sm font-bold text-[#ef654d] whitespace-nowrap overflow-hidden text-ellipsis">
          よびもり
        </span>
      </div>

      <!-- Logo Only (shown when collapsed) - clickable to expand -->
      <button
        v-else
        @click="toggleCollapsed"
        class="bg-white rounded-full p-1.5 shadow-sm hover:shadow-md transition-shadow"
        :title="'メニューを展開'"
      >
        <img
          src="@/assets/yobimori.png"
          alt="Yobimori"
          class="h-7 w-7 object-contain"
        />
      </button>

      <!-- Collapse/Expand Button -->
      <button
        v-if="!collapsed"
        @click="toggleCollapsed"
        class="p-2 rounded-lg hover:bg-white/80 transition-colors text-[#ef654d] hover:text-[#d64632] flex-shrink-0"
        :title="'メニューを折りたたむ'"
      >
        <MenuFoldOutlined class="text-xl" />
      </button>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="space-y-2 px-3">
        <li v-for="item in menuItems" :key="item.key">
          <button
            @click="navigate(item.path, item.enabled)"
            :disabled="!item.enabled"
            :class="[
              'group w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-300',
              !item.enabled
                ? 'cursor-not-allowed'
                : selectedKeys.includes(item.key)
                ? 'bg-gradient-to-br from-[#ef654d] via-[#ff8a65] to-[#ff9575] text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                : 'text-gray-700 hover:bg-white hover:shadow-md hover:scale-[1.02]',
              collapsed ? 'justify-center px-2' : '',
            ]"
            :title="collapsed ? item.label : ''"
          >
            <!-- Icon Container -->
            <div
              :class="[
                'flex items-center justify-center rounded-lg transition-all duration-300',
                collapsed ? 'w-10 h-10' : 'w-9 h-9',
                !item.enabled
                  ? 'bg-gray-100 text-gray-400'
                  : selectedKeys.includes(item.key)
                  ? 'bg-white/20 text-white'
                  : 'bg-gradient-to-br from-orange-50 to-pink-50 text-[#ef654d] group-hover:from-orange-100 group-hover:to-pink-100 group-hover:scale-110',
              ]"
            >
              <component :is="item.icon" class="text-lg" />
            </div>

            <!-- Label and Badge -->
            <div
              v-if="!collapsed"
              class="flex-1 flex items-center justify-between min-w-0"
            >
              <span
                :class="[
                  'font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis',
                  !item.enabled ? 'text-gray-400' : '',
                ]"
              >
                {{ item.label }}
              </span>
              <span
                v-if="!item.enabled"
                class="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium whitespace-nowrap ml-2"
              >
                準備中
              </span>
            </div>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Footer with Logout -->
    <div class="border-t border-gray-200 bg-gradient-to-r from-orange-50 to-pink-50">
      <!-- Logout Button - Expanded State -->
      <div v-if="!collapsed" class="p-3">
        <button
          @click="handleLogout"
          class="group w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-600 transition-all duration-300 hover:shadow-md"
        >
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-600 transition-all duration-300">
            <LogoutOutlined class="text-lg" />
          </div>
          <span class="font-semibold text-sm">ログアウト</span>
        </button>
      </div>

      <!-- Logout Button - Collapsed State -->
      <div v-else class="p-3 flex justify-center">
        <button
          @click="handleLogout"
          class="p-2.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-all duration-300 hover:shadow-md"
          :title="'ログアウト'"
        >
          <LogoutOutlined class="text-lg" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for sidebar */
nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
