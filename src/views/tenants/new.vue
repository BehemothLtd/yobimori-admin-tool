<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import { Breadcrumb, PageHeader, BaseButton } from "@/components/base";
import BusinessIcon from "@/components/icons/BusinessIcon.vue";
import useSwal from "@/composable/useSwal";
import useTenants from "@/composable/useTenants";

const router = useRouter();
const { confirming, success, error } = useSwal();
const { createTenant } = useTenants();

const isSaving = ref(false);

// Form data
const tenantForm = ref({
  name: "",
  address: "",
});

// Breadcrumb data
const breadcrumbItems = [
  { label: "ホーム", to: "/" },
  { label: "テナント管理", to: "/tenants" },
  { label: "新規作成" },
];

const handleCreateTenant = async () => {
  const confirmed = await confirming({
    title: "テナントを作成しますか？",
    text: "新しいテナントが作成されます。",
    icon: "question",
  });

  if (!confirmed) return;

  isSaving.value = true;

  try {
    const result = await createTenant({
      name: tenantForm.value.name,
      address: tenantForm.value.address,
    });

    if (result) {
      await success({
        title: "作成成功",
        text: "テナントが正常に作成されました。",
      });

      // Navigate to the created tenant's detail page
      router.push(`/tenants/${result.id}`);
    }
  } catch (err) {
    await error({
      title: "作成失敗",
      text: "テナントの作成に失敗しました。",
    });
  } finally {
    isSaving.value = false;
  }
};

const handleBack = () => {
  router.push("/tenants");
};
</script>

<template>
  <MainLayout>
    <!-- Breadcrumb -->
    <div class="mb-6">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Page Header -->
    <PageHeader
      title="テナント新規作成"
      description="新しいテナントを作成します"
      :icon="BusinessIcon"
    >
    </PageHeader>

    <!-- Tenant Creation Form Card -->
    <div class="w-full bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h3
        class="text-start text-base sm:text-lg font-semibold text-gray-900 mb-4"
      >
        基本情報
      </h3>

      <div class="space-y-4">
        <!-- Tenant Name (Required) -->
        <div>
          <label
            class="text-start block text-sm font-medium text-gray-700 mb-1"
          >
            テナント名 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="tenantForm.name"
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="テナント名を入力してください"
            :disabled="isSaving"
          />
        </div>

        <!-- Tenant Address (Required) -->
        <div>
          <label
            class="text-start block text-sm font-medium text-gray-700 mb-1"
          >
            住所 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="tenantForm.address"
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="住所を入力してください"
            :disabled="isSaving"
          />
        </div>

        <!-- Create Button -->
        <div class="flex justify-end pt-2 gap-3">
          <BaseButton
            variant="secondary"
            @click="handleBack"
            :disabled="isSaving"
          >
            キャンセル
          </BaseButton>
          <BaseButton
            variant="primary"
            @click="handleCreateTenant"
            :disabled="isSaving || !tenantForm.name || !tenantForm.address"
          >
            <span v-if="isSaving">作成中...</span>
            <span v-else>作成</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
