<template>
  <a-row :gutter="[16, 16]">
    <!-- Fisher Users Card -->
    <a-col :xs="12" :sm="12" :lg="6">
      <StatCard
        title="フィッシャーユーザー数"
        :value="stats.fisherUserCount"
        :loading="loading"
        :icon="UserOutlined"
        card-class="border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:border-blue-500"
        icon-class="bg-blue-100 text-blue-600 group-hover:bg-blue-500"
        value-class="text-gray-900 group-hover:text-blue-600"
        gradient-class="bg-gradient-to-r from-blue-400 to-blue-600"
      />
    </a-col>

    <!-- Open Accidents Card -->
    <a-col :xs="12" :sm="12" :lg="6">
      <StatCard
        title="対応中の事故"
        :value="stats.openAccidentCount"
        :loading="loading"
        :icon="WarningOutlined"
        card-class="border-red-100 bg-gradient-to-br from-red-50 to-white hover:border-red-500"
        icon-class="bg-red-100 text-red-600 group-hover:bg-red-500"
        :value-class="
          stats.openAccidentCount && stats.openAccidentCount > 0
            ? 'text-red-600 group-hover:text-red-700'
            : 'text-gray-900 group-hover:text-red-600'
        "
        gradient-class="bg-gradient-to-r from-red-400 to-red-600"
      />
    </a-col>

    <!-- Total Accidents Card -->
    <a-col :xs="12" :sm="12" :lg="6">
      <StatCard
        title="総事故数"
        :value="stats.totalAccidentCount"
        :loading="loading"
        :icon="FileTextOutlined"
        card-class="border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-gray-400"
        icon-class="bg-gray-200 text-gray-600 group-hover:bg-gray-500"
        value-class="text-gray-900 group-hover:text-gray-700"
        gradient-class="bg-gradient-to-r from-gray-400 to-gray-600"
      />
    </a-col>

    <!-- Linked Tenants Card -->
    <a-col :xs="12" :sm="12" :lg="6">
      <StatCard
        title="連携テナント数"
        :value="stats.linkedTenantsCount"
        :loading="loading"
        :icon="TeamOutlined"
        card-class="border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:border-purple-500"
        icon-class="bg-purple-100 text-purple-600 group-hover:bg-purple-500"
        value-class="text-gray-900 group-hover:text-purple-600"
        gradient-class="bg-gradient-to-r from-purple-400 to-purple-600"
      />
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import {
  UserOutlined,
  WarningOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons-vue";
import StatCard from "./base/StatCard.vue";

export interface TenantStatisticsCardsProps {
  stats: {
    fisherUserCount: number | null;
    openAccidentCount: number | null;
    totalAccidentCount: number | null;
    linkedTenantsCount: number | null;
  };
  loading?: boolean;
}

defineProps<TenantStatisticsCardsProps>();
</script>
