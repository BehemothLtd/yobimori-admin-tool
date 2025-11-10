<script setup lang="ts">
const handleLogout = () => {
  // TODO: Implement logout logic
  console.log("Logout clicked");
  alert("ログアウトしました");
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br">
    <!-- Header - Fixed at top, full width -->
    <header class="fixed top-0 left-0 right-0 bg-[#ff8a65] shadow-lg z-50">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo / Title -->
          <div class="flex items-center">
            <router-link
              to="/"
              class="text-2xl font-bold text-white hover:text-white"
            >
              Yobimori Admin Tool
            </router-link>
          </div>

          <!-- Logout Button -->
          <div class="flex items-center">
            <button
              @click="handleLogout"
              class="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 backdrop-blur-sm"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content - Add top padding to account for fixed header -->
    <main class="flex-1 pt-16 w-full">
      <div class="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-7xl mx-auto">
          <slot></slot>
        </div>
      </div>
    </main>

    <!-- Footer - Full width -->
    <footer class="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white/50">
      <div class="max-w-7xl mx-auto text-center text-sm text-gray-600">
        <p>© 2025 Yobimori Admin Tool. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
