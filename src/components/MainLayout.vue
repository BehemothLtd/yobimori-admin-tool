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
    <header v-if="isMobile" class="flex-shrink-0 bg-gradient-to-r from-[#ef654d] to-[#ff8a65] shadow-md z-30 lg:hidden">
      <div class="w-full px-4">
        <div class="flex items-center justify-between h-14">
          <!-- Logo and Title -->
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm p-1.5">
              <img
                src="@/assets/yobimori.png"
                alt="Yobimori Logo"
                class="w-full h-full object-contain"
              />
            </div>
            <h1 class="text-base font-bold text-white">
              よびもり管理ツール
            </h1>
          </div>

          <!-- Hamburger Menu Button -->
          <button
            @click="toggleDrawer"
            class="flex flex-col items-end justify-center w-11 h-11 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all active:scale-95 p-2 gap-1.5"
            aria-label="Open menu"
          >
            <span class="block w-6 h-[2.5px] bg-[#ef654d] rounded-sm"></span>
            <span class="block w-5 h-[2.5px] bg-[#ef654d] rounded-sm"></span>
            <span class="block w-6 h-[2.5px] bg-[#ef654d] rounded-sm"></span>
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
          <div class="min-h-full py-4 sm:py-8 lg:py-12 px-3 sm:px-6 lg:px-8">
            <div class="w-full max-w-7xl mx-auto">
              <slot></slot>
            </div>
          </div>
        </main>

        <!-- Footer - Inside main content area -->
        <footer
          class="flex-shrink-0 w-full py-2 sm:py-4 px-3 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm"
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
