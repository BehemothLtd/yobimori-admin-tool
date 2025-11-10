<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { MenuOutlined, LogoutOutlined } from "@ant-design/icons-vue";
import DrawerMenu from "./DrawerMenu.vue";

const isDrawerOpen = ref(false);
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024; // lg breakpoint
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
};

const closeDrawer = () => {
  isDrawerOpen.value = false;
};

const handleLogout = () => {
  console.log("Logout clicked");
  alert("ログアウトしました");
};
</script>

<template>
  <div
    class="fixed inset-0 flex flex-col bg-gradient-to-br from-orange-50 to-pink-50"
  >
    <!-- Drawer Menu Component -->
    <DrawerMenu :is-open="isDrawerOpen" @close="closeDrawer" />

    <!-- Header - Fixed at top, full width -->
    <header class="flex-shrink-0 bg-[#ef654d] shadow-lg z-30">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Left side: Menu button (mobile) + Logo -->
          <div class="flex items-center gap-3">
            <!-- Hamburger Menu Button - Only on mobile -->
            <button
              v-if="isMobile"
              @click="toggleDrawer"
              class="p-2 rounded-lg bg-[#ef654d] text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
              aria-label="Open menu"
            >
              <MenuOutlined class="text-xl" />
            </button>

            <!-- Logo / Title -->
            <router-link
              to="/"
              class="text-xl sm:text-2xl font-bold text-white hover:text-white/90 transition-colors"
            >
              Yobimori Admin Tool
            </router-link>
          </div>

          <!-- Logout Button -->
          <div v-if="!isMobile" class="flex items-center">
            <button
              @click="handleLogout"
              class="inline-flex items-center px-3 sm:px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 backdrop-blur-sm"
            >
              <LogoutOutlined class="text-base sm:mr-2" />
              <span class="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content - Scrollable area with fixed dimensions -->
    <main class="flex-1 w-full overflow-y-auto overflow-x-hidden">
      <div class="min-h-full py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-7xl mx-auto">
          <slot></slot>
        </div>
      </div>
    </main>

    <!-- Footer - Fixed at bottom -->
    <footer
      class="flex-shrink-0 w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm"
    >
      <div
        class="max-w-7xl mx-auto text-center text-xs sm:text-sm text-gray-600"
      >
        <p>© 2025 Yobimori Admin Tool. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
