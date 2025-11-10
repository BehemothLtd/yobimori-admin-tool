import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/index.vue"),
  },
  {
    path: "/tenants",
    name: "Tenants",
    component: () => import("@/views/tenants/index.vue"),
  },
  {
    path: "/tenants/new",
    name: "NewTenant",
    component: () => import("@/views/tenants/new.vue"),
  },
  {
    path: "/tenants/:id",
    name: "TenantDetail",
    component: () => import("@/views/tenants/_id/index.vue"),
  },
  {
    path: "/tenants/:id/accounts",
    name: "TenantAccounts",
    component: () => import("@/views/accounts/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
