<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
// Authentication disabled - using mock data
// import { signOut } from "aws-amplify/auth";
import {
  HomeOutlined,
  TeamOutlined,
  CloudUploadOutlined,
  SearchOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
  CloseOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";
import useSwal from "@/composable/useSwal";

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  enabled: boolean;
}

interface Props {
  isOpen: boolean;
}

interface Emits {
  (e: "close"): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();
const router = useRouter();
const route = useRoute();
const { success, error } = useSwal();

const menuItems: MenuItem[] = [
  {
    href: "/",
    label: "ホーム",
    icon: HomeOutlined,
    enabled: true,
  },
  {
    href: "/tenants",
    label: "テナント管理",
    icon: TeamOutlined,
    enabled: true,
  },
  {
    href: "/bulkOperations",
    label: "一括操作",
    icon: CloudUploadOutlined,
    enabled: true,
  },
  {
    href: "/device-search",
    label: "デバイス検索",
    icon: SearchOutlined,
    enabled: true,
  },
  {
    href: "/device-logs",
    label: "デバイスログ確認",
    icon: HistoryOutlined,
    enabled: true,
  },
  {
    href: "#",
    label: "事故情報管理",
    icon: ExclamationCircleOutlined,
    enabled: false,
  },
];

const isCurrentPage = (href: string) => {
  if (href === "/" && route.path === "/") return true;
  if (href !== "/" && route.path.startsWith(href)) return true;
  return false;
};

const handleNavigation = (href: string, enabled: boolean) => {
  if (enabled && href !== "#") {
    router.push(href);
    emit("close");
  }
};

const handleLogout = async () => {
  try {
    // Mock logout - no actual signOut needed
    emit("close");
    await success({ title: "ログアウトしました" });
    // Redirect to home page
    router.push("/");
    // Reload to clear any cached data
    window.location.reload();
  } catch (err) {
    console.error("Logout error:", err);
    await error({ title: "ログアウトに失敗しました" });
  }
};
</script>

<template>
  <!-- Backdrop Overlay -->
  <Transition name="backdrop">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="emit('close')"
    ></div>
  </Transition>

  <!-- Drawer Menu -->
  <Transition name="drawer">
    <aside
      v-if="isOpen"
      class="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 lg:hidden flex flex-col"
    >
      <!-- Drawer Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-primary">メニュー</h2>
          <button
            @click="emit('close')"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <CloseOutlined class="text-xl text-gray-600" />
          </button>
        </div>
      </div>

      <!-- Menu Items -->
      <nav class="flex-1 overflow-y-auto p-3">
        <ul class="space-y-2">
          <li v-for="item in menuItems" :key="item.href">
            <button
              @click="handleNavigation(item.href, item.enabled)"
              :disabled="!item.enabled"
              :class="[
                'group w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-left transition-all duration-300',
                !item.enabled
                  ? 'cursor-not-allowed'
                  : isCurrentPage(item.href)
                  ? 'bg-gradient-to-br from-[#ef654d] via-[#ff8a65] to-[#ff9575] text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 hover:shadow-md hover:scale-[1.02]',
              ]"
            >
              <!-- Icon Container -->
              <div
                :class="[
                  'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300',
                  !item.enabled
                    ? 'bg-gray-100 text-gray-400'
                    : isCurrentPage(item.href)
                    ? 'bg-white/20 text-white'
                    : 'bg-gradient-to-br from-orange-50 to-pink-50 text-[#ef654d] group-hover:from-orange-100 group-hover:to-pink-100 group-hover:scale-110',
                ]"
              >
                <component :is="item.icon" class="text-lg" />
              </div>

              <!-- Label and Badge -->
              <div class="flex-1 flex items-center justify-between min-w-0">
                <span
                  :class="[
                    'font-semibold text-sm',
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

      <!-- Drawer Footer with Logout -->
      <div class="p-3 border-t border-gray-200">
        <button
          @click="handleLogout"
          class="group w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-left text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-600 transition-all duration-300 hover:shadow-md"
        >
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-600 transition-all duration-300">
            <LogoutOutlined class="text-lg" />
          </div>
          <span class="font-semibold text-sm">ログアウト</span>
        </button>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
/* Backdrop transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Drawer transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}
</style>
