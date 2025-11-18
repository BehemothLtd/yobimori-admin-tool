<script setup lang="ts">
import { ref, onMounted } from "vue";
import MainLayout from "@/components/MainLayout.vue";
import StatisticsCards from "@/components/StatisticsCards.vue";
import TenantRelationshipGraph from "@/components/TenantRelationshipGraph.vue";
import useStatistics from "@/composable/useStatistics";

const { getDashboardStats } = useStatistics();

const loading = ref(false);
const dashboardStats = ref({
  totalTenants: null as number | null,
  totalFisherUsers: null as number | null,
  totalDevices: null as number | null,
  openAccidents: null as number | null,
});

onMounted(async () => {
  loading.value = true;
  try {
    const stats = await getDashboardStats();
    if (stats) {
      dashboardStats.value = stats;
    }
  } catch (error) {
    console.error("Failed to load dashboard statistics:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <MainLayout>
    <!-- Page Title with gradient -->
    <div class="text-center mb-3 sm:mb-10">
      <h2
        class="text-xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent mb-1.5 sm:mb-4"
      >
        ダッシュボード
      </h2>

      <div
        class="mx-auto mt-1.5 sm:mt-4 h-0.5 sm:h-1 w-12 sm:w-24 bg-gradient-to-r from-primary to-primary-light rounded-full"
      ></div>
    </div>

    <!-- Statistics Cards Section -->
    <div class="mb-6 sm:mb-12">
      <StatisticsCards :stats="dashboardStats" :loading="loading" />
    </div>

    <!-- Tenant Relationship Graph Section -->
    <div class="mb-12 sm:mb-16">
      <TenantRelationshipGraph />
    </div>
  </MainLayout>
</template>
