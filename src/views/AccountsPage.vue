<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "@/components/MainLayout.vue";
import {
  Breadcrumb,
  PageHeader,
  BaseButton,
  TextField,
  SelectField,
  SearchForm,
  DataTable,
  LoadingSpinner,
  type TableColumn,
} from "@/components/base";
import AccountBoxIcon from "@/components/icons/AccountBoxIcon.vue";

interface Tenant {
  id: string;
  name: string;
}

interface Device {
  id: string;
  imei: string;
  deviceType: string;
}

interface LineUser {
  userId: string;
  displayName: string;
  pictureUrl: string | null;
}

interface Account {
  id: string;
  name: string;
  nickname: string;
  encryptedPassword: string;
  tenants: Tenant[];
  devices: {
    devices: Device[];
  };
  lineUsers: LineUser[] | null;
}

interface TenantWithMembers {
  id: string;
  name: string;
  members: Account[];
}

const router = useRouter();

// Breadcrumb data
const breadcrumbItems = [
  { label: "ホーム", to: "/" },
  { label: "アカウント・デバイス管理" },
];

// Mock tenants data
const tenantsData = ref<Tenant[]>([
  {
    id: "d665f4b8-7334-48a6-a6d3-3e00258fd613",
    name: "test-tenant-20230102105523.41",
  },
  {
    id: "6c981d3b-6752-4cab-8d55-273fa3e268a6",
    name: "test-from-tenant-20230513104307.587863982",
  },
  {
    id: "bb5178dc-3d96-430f-9b62-2104a751009f",
    name: "tesuto-btenant-2025-0602",
  },
]);

// Mock data for accounts
const mockTenantsWithMembers: TenantWithMembers[] = [
  {
    id: "bb5178dc-3d96-430f-9b62-2104a751009f",
    name: "tesuto-btenant-2025-0602",
    members: [
      {
        id: "01183586-d301-496c-9df1-ddbea475bf7f",
        name: "test-kerberos4",
        nickname: "test k4",
        encryptedPassword:
          "AQICAHi/T53jbjXTqpDWJo05xDcuNboxL4aTW+P+4A0E2xSWxQGKsUWWxA3s8wrbZnhwN8uxAAAAZjBkBgkqhkiG9w0BBwagVzBVAgEAMFAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMHPKJ5xOPSUtWJbvRAgEQgCO0BYzlZWe4gQCCJEeX0MJoOA86ewjfGolLL79TdAJHaBMCMA==",
        tenants: [
          {
            id: "bb5178dc-3d96-430f-9b62-2104a751009f",
            name: "tesuto-btenant-2025-0602",
          },
        ],
        devices: {
          devices: [
            {
              id: "f1a07a5e-08ff-4563-a4c8-8f15e421f840",
              imei: "861146025101237",
              deviceType: "EV_07B",
            },
          ],
        },
        lineUsers: [
          {
            userId: "Ua1c3de3c59b6da37896209b33bb0291d",
            displayName: "Nguyễn Trọng Thăng",
            pictureUrl: null,
          },
          {
            userId: "U77e1cf06473fef487c3df5b88ce3d5e7",
            displayName: "Behemoth",
            pictureUrl:
              "https://sprofile.line-scdn.net/0hI0AGe8QTFh9sPgSqa0loYBxuFXVPT08NFQ0Oe183HCtYCVVNSAtcfww2G3tUCwUbRAhcfAlpSXpgLWF5cmjqK2sOSChVCFdJRl1e_g",
          },
        ],
      },
      {
        id: "024cd4f4-4e84-4589-b77b-8730d09f457d",
        name: "test-kerberos3",
        nickname: "k3",
        encryptedPassword:
          "AQICAHi/T53jbjXTqpDWJo05xDcuNboxL4aTW+P+4A0E2xSWxQFDgJyh4pQVTf0oTrYe6VgMAAAAZjBkBgkqhkiG9w0BBwagVzBVAgEAMFAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMqiKExjbCAF23vgJmAgEQgCPiC+wG6G47Yx36NnR4FN9csjEC7VYFktwflVxxU0q+S7/Zfg==",
        tenants: [
          {
            id: "bb5178dc-3d96-430f-9b62-2104a751009f",
            name: "tesuto-btenant-2025-0602",
          },
        ],
        devices: {
          devices: [
            {
              id: "3b033b75-36b4-44cb-98fd-0e3fe9fa3cd4",
              imei: "861146025101236",
              deviceType: "EV_07B",
            },
          ],
        },
        lineUsers: null,
      },
      {
        id: "abf057ca-c3d6-4dc8-8dcd-ccd677dc70fe",
        name: "test-kerberos6",
        nickname: "ユーザーkerberos6",
        encryptedPassword:
          "AQICAHi/T53jbjXTqpDWJo05xDcuNboxL4aTW+P+4A0E2xSWxQHIFyK59YjDR0QsMJQpXIdLAAAAZjBkBgkqhkiG9w0BBwagVzBVAgEAMFAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMzMMZKs/XeUfDiugDAgEQgCMJYN3sbTqJoxYJ7vkcI26c+A8ub32PU0KiiIinSiDTZRQ2sw==",
        tenants: [
          {
            id: "bb5178dc-3d96-430f-9b62-2104a751009f",
            name: "tesuto-btenant-2025-0602",
          },
        ],
        devices: {
          devices: [],
        },
        lineUsers: null,
      },
      {
        id: "b2189cc2-5602-492d-b7de-b02281c4ce4d",
        name: "test-kerberos1",
        nickname: "k111",
        encryptedPassword:
          "AQICAHi/T53jbjXTqpDWJo05xDcuNboxL4aTW+P+4A0E2xSWxQHKaELPdfTSrWO8kcv6AVaUAAAAZjBkBgkqhkiG9w0BBwagVzBVAgEAMFAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM7nEFXtJFqvgDBU5bAgEQgCPqMxRBe8tWq16fgPqV5srDdoPadblc+DwM+rtT9KmGM0+wjA==",
        tenants: [
          {
            id: "bb5178dc-3d96-430f-9b62-2104a751009f",
            name: "tesuto-btenant-2025-0602",
          },
        ],
        devices: {
          devices: [
            {
              id: "4a247226-72ed-454c-a93c-ced9d4a5b022",
              imei: "861146025101234",
              deviceType: "EV_07B",
            },
          ],
        },
        lineUsers: [
          {
            userId: "Ua1c3de3c59b6da37896209b33bb0291d",
            displayName: "Nguyễn Trọng Thăng",
            pictureUrl: null,
          },
          {
            userId: "U91da0e11b07b30bb8adb0d327fd48a40",
            displayName: "Thái",
            pictureUrl:
              "https://sprofile.line-scdn.net/0hfFIwYjFcOWlkDiqQDGFHFhReOgNHf2B7HG5_WwQLYglRaXY-QW8lB1IJZlgOOC02GGF-BlIOMAloHU4PeljFXWM-Z15dOHg_Tm1xiA",
          },
          {
            userId: "Uce657ec22a44f9496c409c8d80fc7534",
            displayName: "Ngoc",
            pictureUrl:
              "https://sprofile.line-scdn.net/0hFuzFeUbyGVpXPwqTR-xnJSdvGjB0TkBIKFwDOjdqT2M4Cwtee1oFPGQ6T24-W10Lc1xVPDY_QTpbLG48SWnlblAPR21uCVgMfVxRuw",
          },
        ],
      },
      {
        id: "db79d49f-2c01-4308-8ae5-b1b72b66fd84",
        name: "test-kerberos2",
        nickname: "ユーザーkerberos2",
        encryptedPassword:
          "AQICAHi/T53jbjXTqpDWJo05xDcuNboxL4aTW+P+4A0E2xSWxQHhXroKBxv3z75NHrK4buU+AAAAZjBkBgkqhkiG9w0BBwagVzBVAgEAMFAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMPOlW2LoG9og/viygAgEQgCNrvZDZih9W83Rhv4SATm582c2zybT8RmfDaVtazEeX0wakqw==",
        tenants: [
          {
            id: "bb5178dc-3d96-430f-9b62-2104a751009f",
            name: "tesuto-btenant-2025-0602",
          },
        ],
        devices: {
          devices: [
            {
              id: "bd8d6a49-6ba6-499d-997d-56a495b702ed",
              imei: "861146025101235",
              deviceType: "EV_07B",
            },
          ],
        },
        lineUsers: null,
      },
      {
        id: "ebe95741-b202-470e-b155-b543c278b6fc",
        name: "test-kerberos5",
        nickname: "k5",
        encryptedPassword:
          "AQICAHi/T53jbjXTqpDWJo05xDcuNboxL4aTW+P+4A0E2xSWxQF1iK4bL0F9RYDLkPd6iN4XAAAAZjBkBgkqhkiG9w0BBwagVzBVAgEAMFAGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMkKAenSpZf8S+xZuhAgEQgCONdRlx+JvGt1+Y7LEXt8mGW8sa3WS0wlfedbT9ttK9qBWp0w==",
        tenants: [
          {
            id: "bb5178dc-3d96-430f-9b62-2104a751009f",
            name: "tesuto-btenant-2025-0602",
          },
        ],
        devices: {
          devices: [
            {
              id: "23ec018f-2f88-461f-bd95-741af90211e0",
              imei: "861146025101238",
              deviceType: "EV_07B",
            },
          ],
        },
        lineUsers: null,
      },
    ],
  },
  {
    id: "d665f4b8-7334-48a6-a6d3-3e00258fd613",
    name: "test-tenant-20230102105523.41",
    members: [],
  },
  {
    id: "6c981d3b-6752-4cab-8d55-273fa3e268a6",
    name: "test-from-tenant-20230513104307.587863982",
    members: [],
  },
];

// State
const selectedTenantId = ref("");
const filterText = ref("");
const accounts = ref<Account[]>([]);
const isLoading = ref(false);

// Tenant options for select
const tenantOptions = computed(() =>
  tenantsData.value.map((t) => ({ value: t.id, label: t.name }))
);

// Filter accounts based on filterText
const filteredAccounts = computed(() => {
  if (!filterText.value) {
    return accounts.value;
  }

  const query = filterText.value.toLowerCase();
  return accounts.value.filter((account) =>
    account.nickname.toLowerCase().includes(query)
  );
});

// Table columns
const columns: TableColumn[] = [
  {
    key: "name",
    label: "ユーザーID",
    sortable: true,
  },
  {
    key: "nickname",
    label: "ユーザー名",
    sortable: true,
  },
  {
    key: "password",
    label: "パスワード",
    render: () => "********",
  },
  {
    key: "tenants",
    label: "所属テナント",
    render: (row: Account) => row.tenants.map((t) => t.name).join(", ") || "-",
  },
  {
    key: "primaryTenant",
    label: "事故通知先テナント",
    render: (row: Account) => row.tenants[0]?.name || "-",
  },
  {
    key: "devices",
    label: "所持デバイス",
    render: (row: Account) =>
      row.devices.devices.map((d) => d.imei).join(", ") || "-",
  },
  {
    key: "lineUsers",
    label: "連携LINEユーザー",
    render: (row: Account) =>
      row.lineUsers?.map((u) => u.displayName).join(", ") || "-",
  },
  {
    key: "action",
    label: "操作",
    type: "button",
    width: "100px",
    align: "center",
    render: () => "編集",
  },
];

// Handlers
const handleTenantChange = async () => {
  if (!selectedTenantId.value) {
    accounts.value = [];
    return;
  }

  isLoading.value = true;

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  const tenantData = mockTenantsWithMembers.find(
    (t) => t.id === selectedTenantId.value
  );

  if (tenantData) {
    accounts.value = tenantData.members;
  } else {
    accounts.value = [];
  }

  isLoading.value = false;
};

const handleReset = () => {
  filterText.value = "";
};

const handleCellButtonClick = (row: Account) => {
  // Navigate to edit page
  router.push(`/accounts/${row.id}/edit`);
};

// Result count message
const resultMessage = computed(() => {
  if (!selectedTenantId.value) {
    return "";
  }

  if (filterText.value) {
    return `「${filterText.value}」の検索結果: ${filteredAccounts.value.length}件`;
  }

  return `検索結果: ${filteredAccounts.value.length}件`;
});
</script>

<template>
  <MainLayout>
    <!-- Breadcrumb -->
    <div class="mb-6">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <!-- Page Header -->
    <PageHeader
      title="アカウント・デバイス管理"
      description="ユーザー・テナントの情報を確認したり変更できます"
      :icon="AccountBoxIcon"
    />

    <!-- Search Form -->
    <SearchForm :columns="2">
      <template #fields>
        <SelectField
          v-model="selectedTenantId"
          label="テナント"
          :options="tenantOptions"
          placeholder="テナントを選択してください"
          required
          @change="handleTenantChange"
        />
        <TextField
          v-model="filterText"
          label="ユーザー名"
          placeholder="ユーザー名で検索"
          :disabled="!selectedTenantId"
        />
      </template>
      <template #actions>
        <BaseButton
          variant="secondary"
          @click="handleReset"
          :disabled="!filterText"
        >
          リセット
        </BaseButton>
      </template>
    </SearchForm>

    <!-- Results Info -->
    <div v-if="resultMessage" class="mb-4 text-sm text-gray-600">
      {{ resultMessage }}
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="isLoading" />

    <!-- Data Table -->
    <DataTable
      v-else
      :columns="columns"
      :data="filteredAccounts"
      @cell-button-click="handleCellButtonClick"
      empty-text="アカウントが見つかりません"
    />
  </MainLayout>
</template>
