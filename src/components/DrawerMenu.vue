<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";

interface MenuItem {
  href: string;
  label: string;
  icon: string;
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
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: "/accounts",
    label: "アカウント管理",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    href: "/tenants",
    label: "テナント管理",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
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
          <h2 class="text-xl font-bold text-[#ff8a65]">メニュー</h2>
          <button
            @click="emit('close')"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg
              class="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
                  ? 'bg-[#ff8a65]/10 text-[#ff8a65] font-semibold'
                  : 'text-gray-700 hover:bg-gray-100',
              ]"
            >
              <svg
                class="w-6 h-6 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="item.icon"
                />
              </svg>
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
          <svg
            class="w-6 h-6 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
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
