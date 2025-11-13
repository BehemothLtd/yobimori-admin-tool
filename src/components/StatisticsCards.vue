<template>
  <a-row :gutter="[16, 16]">
    <!-- Total Tenants Card -->
    <a-col :xs="12" :sm="12" :lg="6">
      <StatCard
        title="総テナント数"
        :value="stats.totalTenants"
        :loading="loading"
        :icon="TeamOutlined"
        card-class="border-orange-100 bg-gradient-to-br from-orange-50 to-white hover:border-primary"
        icon-class="bg-primary/10 text-primary group-hover:bg-primary"
        value-class="text-gray-900 group-hover:text-primary"
        gradient-class="bg-gradient-to-r from-primary to-primary-light"
      />
    </a-col>

    <!-- Total Fisher Users Card -->
    <a-col :xs="12" :sm="12" :lg="6">
      <StatCard
        title="総フィッシャーユーザー数"
        :value="stats.totalFisherUsers"
        :loading="loading"
        :icon="UserOutlined"
        card-class="border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:border-blue-500"
        icon-class="bg-blue-100 text-blue-600 group-hover:bg-blue-500"
        value-class="text-gray-900 group-hover:text-blue-600"
        gradient-class="bg-gradient-to-r from-blue-400 to-blue-600"
      />
    </a-col>

    <!-- Total Devices Card -->
    <a-col :xs="12" :sm="12" :lg="6">
      <StatCard
        title="総デバイス数"
        :value="stats.totalDevices"
        :loading="loading"
        :icon="MobileOutlined"
        card-class="border-green-100 bg-gradient-to-br from-green-50 to-white hover:border-green-500"
        icon-class="bg-green-100 text-green-600 group-hover:bg-green-500"
        value-class="text-gray-900 group-hover:text-green-600"
        gradient-class="bg-gradient-to-r from-green-400 to-green-600"
      />
    </a-col>

    <!-- Open Accidents Card -->
    <a-col :xs="12" :sm="12" :lg="6">
      <StatCard
        title="対応中の事故"
        :value="stats.openAccidents"
        :loading="loading"
        :icon="WarningOutlined"
        card-class="border-red-100 bg-gradient-to-br from-red-50 to-white hover:border-red-500"
        icon-class="bg-red-100 text-red-600 group-hover:bg-red-500"
        :value-class="
          stats.openAccidents && stats.openAccidents > 0
            ? 'text-red-600 group-hover:text-red-700'
            : 'text-gray-900 group-hover:text-red-600'
        "
        gradient-class="bg-gradient-to-r from-red-400 to-red-600"
      />
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import {
  TeamOutlined,
  UserOutlined,
  MobileOutlined,
  WarningOutlined,
} from "@ant-design/icons-vue";
import StatCard from "./base/StatCard.vue";

export interface StatisticsCardsProps {
  stats: {
    totalTenants: number | null;
    totalFisherUsers: number | null;
    totalDevices: number | null;
    openAccidents: number | null;
  };
  loading?: boolean;
}

defineProps<StatisticsCardsProps>();
</script>
