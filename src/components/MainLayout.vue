<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
// Authentication disabled - using mock data
// import { signOut } from "aws-amplify/auth";
import DrawerMenu from "./DrawerMenu.vue";
import Sidebar from "./Sidebar.vue";

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
</script>

<template>
  <div
    class="fixed inset-0 flex flex-col bg-gradient-to-br from-orange-50 to-pink-50"
  >
    <!-- Drawer Menu Component -->
    <DrawerMenu :is-open="isDrawerOpen" @close="closeDrawer" />

    <!-- Mobile Header - Only visible on mobile -->
    <header v-if="isMobile" class="flex-shrink-0 bg-[#ef654d] shadow-lg z-30 lg:hidden">
      <div class="w-full px-4 sm:px-6">
        <div class="flex items-center justify-between h-14">
          <!-- Logo as Menu Trigger - Mobile -->
          <button
            @click="toggleDrawer"
            class="flex items-center gap-3"
            aria-label="Open menu"
          >
            <div class="p-1.5 rounded-full bg-white shadow-md">
              <img
                src="@/assets/yobimori.png"
                alt="Yobimori Logo"
                class="h-7 w-7 object-contain"
              />
            </div>
            <span class="text-lg font-bold text-white">
              よびもり管理ツール
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Body Container - Sidebar + Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar - Desktop only, full height -->
      <Sidebar />

      <!-- Main Content Area - Contains scrollable content + footer -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Main Content - Scrollable area -->
        <main class="flex-1 w-full overflow-y-auto overflow-x-hidden">
          <div class="min-h-full py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
            <div class="w-full max-w-7xl mx-auto">
              <slot></slot>
            </div>
          </div>
        </main>

        <!-- Footer - Inside main content area -->
        <footer
          class="flex-shrink-0 w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm"
        >
          <div
            class="max-w-7xl mx-auto text-center text-xs sm:text-sm text-gray-600"
          >
            <p>© 2025 よびもり管理ツール. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>
