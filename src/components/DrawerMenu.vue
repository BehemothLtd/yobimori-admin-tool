<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import {
  HomeOutlined,
  ShopOutlined,
  CloseOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";

interface MenuItem {
  href: string;
  label: string;
  icon: any;
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

const menuItems: MenuItem[] = [
  {
    href: "/",
    label: "ホーム",
    icon: HomeOutlined,
  },
  {
    href: "/tenants",
    label: "テナント管理",
    icon: ShopOutlined,
  },
];

const isCurrentPage = (href: string) => {
  if (href === "/" && route.path === "/") return true;
  if (href !== "/" && route.path.startsWith(href)) return true;
  return false;
};

const handleNavigation = (href: string) => {
  router.push(href);
  emit("close");
};

const handleLogout = () => {
  console.log("Logout clicked");
  alert("ログアウトしました");
  emit("close");
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
      <nav class="flex-1 overflow-y-auto p-2">
        <ul class="space-y-1">
          <li v-for="item in menuItems" :key="item.href">
            <button
              @click="handleNavigation(item.href)"
              :class="[
                'w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200',
                isCurrentPage(item.href)
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-700 hover:bg-gray-100',
              ]"
            >
              <component :is="item.icon" class="text-xl mr-3 flex-shrink-0" />
              <span>{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Drawer Footer with Logout -->
      <div class="p-2 border-t border-gray-200">
        <button
          @click="handleLogout"
          class="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          <LogoutOutlined class="text-xl mr-3" />
          <span>ログアウト</span>
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
