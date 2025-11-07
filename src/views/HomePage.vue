<script setup lang="ts">
import { ref } from "vue";
import MainLayout from "@/components/MainLayout.vue";
import MenuCard from "@/components/base/MenuCard.vue";
import AccountBoxIcon from "@/components/icons/AccountBoxIcon.vue";
import BusinessIcon from "@/components/icons/BusinessIcon.vue";
import UploadIcon from "@/components/icons/UploadIcon.vue";
import SearchIcon from "@/components/icons/SearchIcon.vue";
import HistoryIcon from "@/components/icons/HistoryIcon.vue";
import ReportIcon from "@/components/icons/ReportIcon.vue";

interface MenuItem {
  href: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

const menuItems = ref<MenuItem[]>([
  {
    href: "/accounts",
    title: "アカウント・デバイス管理",
    description: "ユーザー・テナントの情報を確認したり変更できます",
    icon: "AccountBoxIcon",
    enabled: true,
  },
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
    <!-- Page Title -->
    <div class="text-center mb-8 sm:mb-12">
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
        管理機能一覧
      </h2>
      <p class="text-base sm:text-lg text-gray-600">機能を選択してください</p>
    </div>

    <!-- Menu Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
  </MainLayout>
</template>
