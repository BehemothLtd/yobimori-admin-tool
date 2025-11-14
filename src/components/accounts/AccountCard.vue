<template>
  <div
    class="account-card group relative overflow-hidden rounded-xl border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary h-full flex flex-col cursor-pointer"
    @click="$emit('click', account)"
  >
    <div class="flex-1 flex flex-col">
      <!-- User Info -->
      <div class="mb-4">
        <div class="flex items-center gap-2 mb-2">
          <AccountBoxIcon class="text-primary w-5 h-5" />
          <h3 class="text-lg font-bold text-gray-800 line-clamp-1">
            {{ account.nickname }}
          </h3>
        </div>
        <p class="text-start text-sm text-gray-600">
          <span class="font-semibold">ID:</span> {{ account.name }}
        </p>
      </div>

      <!-- Tenant Info - Single Line -->
      <div class="mb-3 text-start">
        <p class="text-xs text-gray-500 mb-1">所属テナント</p>
        <p class="text-sm text-gray-700 line-clamp-1">
          {{ account.tenants.map((t) => t.name).join(", ") || "-" }}
        </p>
      </div>

      <!-- Primary Tenant -->
      <div class="mb-3 text-start">
        <p class="text-xs text-gray-500 mb-1">事故通知先テナント</p>
        <p class="text-sm text-gray-700 line-clamp-1">
          {{ account.tenants[0]?.name || "-" }}
        </p>
      </div>

      <!-- Device Info -->
      <div class="mb-3 text-start">
        <p class="text-xs text-gray-500 mb-1">所持デバイス</p>
        <p class="text-sm text-gray-700 line-clamp-1">
          {{
            account.devices.devices
              .map((d) => `${d.imei}(${d.deviceType})`)
              .join(", ") || "-"
          }}
        </p>
      </div>
    </div>

    <!-- Bottom Gradient Bar -->
    <div
      class="absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 group-hover:w-full bg-gradient-to-r from-primary to-primary-light"
    ></div>
  </div>
</template>

<script setup lang="ts">
import AccountBoxIcon from "@/components/icons/AccountBoxIcon.vue";
import type { FisherUser as Account } from "@/types/account";

export interface AccountCardProps {
  account: Account;
}

defineProps<AccountCardProps>();
defineEmits<{
  (e: "click", account: Account): void;
}>();
</script>

<style scoped>
.account-card {
  min-height: 240px;
}
</style>
