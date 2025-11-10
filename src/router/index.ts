import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomePage.vue"),
  },
  {
    path: "/accounts",
    name: "Accounts",
    component: () => import("@/views/accounts/AccountsPage.vue"),
  },
  {
    path: "/tenants",
    name: "Tenants",
    component: () => import("@/views/tenants/TenantsPage.vue"),
  },
  {
    path: "/tenants/:id",
    name: "TenantDetail",
    component: () => import("@/views/tenants/TenantDetailPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
