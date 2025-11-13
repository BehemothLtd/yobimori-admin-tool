<script setup lang="ts">
import { ref, onMounted } from "vue";
import MainLayout from "@/components/MainLayout.vue";
import MenuCard from "@/components/base/MenuCard.vue";
import StatisticsCards from "@/components/StatisticsCards.vue";
import AccountBoxIcon from "@/components/icons/AccountBoxIcon.vue";
import BusinessIcon from "@/components/icons/BusinessIcon.vue";
import UploadIcon from "@/components/icons/UploadIcon.vue";
import SearchIcon from "@/components/icons/SearchIcon.vue";
import HistoryIcon from "@/components/icons/HistoryIcon.vue";
import ReportIcon from "@/components/icons/ReportIcon.vue";
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

interface MenuItem {
  href: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

const menuItems = ref<MenuItem[]>([
  {
    href: "/tenants",
    title: "テナント管理",
    description: "テナントの詳細情報や設定を管理できます",
    icon: "BusinessIcon",
    enabled: true,
  },
  {
    href: "/bulkOperations",
    title: "一括操作",
    description: "ユーザー・端末のデータを一括で登録・更新できます",
    icon: "UploadIcon",
    enabled: true,
  },
  {
    href: "/device-search",
    title: "デバイス検索（IMEI）",
    description: "IMEIからデバイスの所有者とテナント情報を検索できます",
    icon: "SearchIcon",
    enabled: true,
  },
  {
    href: "/device-logs",
    title: "デバイスログ確認",
    description: "デバイスから送信されたログを日時・レベル別に確認できます",
    icon: "HistoryIcon",
    enabled: true,
  },
  {
    href: "#",
    title: "事故情報管理",
    description:
      "事故の情報を閲覧したり、お客様の事故の状態を変更したりできます（準備中）",
    icon: "ReportIcon",
    enabled: false,
  },
]);

const iconComponents: Record<string, any> = {
  AccountBoxIcon,
  BusinessIcon,
  UploadIcon,
  SearchIcon,
  HistoryIcon,
  ReportIcon,
};
</script>

<template>
  <MainLayout>
    <!-- Page Title with gradient -->
    <div class="text-center mb-10 sm:mb-14">
      <h2
        class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent mb-4 sm:mb-5"
      >
        管理機能一覧
      </h2>

      <div
        class="mx-auto mt-4 h-1 w-24 bg-gradient-to-r from-primary to-primary-light rounded-full"
      ></div>
    </div>

    <!-- Statistics Cards Section -->
    <div class="mb-12 sm:mb-16">
      <StatisticsCards :stats="dashboardStats" :loading="loading" />
    </div>

    <!-- Menu Grid Section -->
    <div class="mb-8">
      <div class="mb-6">
        <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          管理機能
        </h3>
      </div>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
      >
        <MenuCard
          v-for="item in menuItems"
          :key="item.href"
          :title="item.title"
          :description="item.description"
          :href="item.href"
          :enabled="item.enabled"
        >
          <template #icon>
            <component :is="iconComponents[item.icon]" />
          </template>
        </MenuCard>
      </div>
    </div>
  </MainLayout>
</template>
