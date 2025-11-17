<script setup lang="ts">
import { ref, onMounted } from "vue";
import MainLayout from "@/components/MainLayout.vue";
import StatisticsCards from "@/components/StatisticsCards.vue";
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
    <div class="text-center mb-10 sm:mb-14">
      <h2
        class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent mb-4 sm:mb-5"
      >
        ダッシュボード
      </h2>

      <div
        class="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-primary to-primary-light rounded-full"
      ></div>
    </div>

    <!-- Statistics Cards Section -->
    <div class="mb-12 sm:mb-16">
      <StatisticsCards :stats="dashboardStats" :loading="loading" />
    </div>
  </MainLayout>
</template>
