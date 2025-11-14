/**
 * Shared mock data storage for the application
 * This file centralizes all mock data to ensure consistency across composables
 */

import type { FisherUser } from "@/types/account";
import type { Tenant, LinkedTenant } from "@/types/tenant";

// ==========================================
// MOCK ACCOUNTS STORAGE
// ==========================================
export const mockAccountsStorage = new Map<string, FisherUser>();

/**
 * Helper to store or update a mock account
 */
export function storeMockAccount(account: FisherUser): void {
  mockAccountsStorage.set(account.id, account);
}

/**
 * Helper to get a mock account by ID
 */
export function getMockAccount(id: string): FisherUser | undefined {
  return mockAccountsStorage.get(id);
}

/**
 * Helper to get all mock accounts
 */
export function getAllMockAccounts(): FisherUser[] {
  return Array.from(mockAccountsStorage.values());
}

// ==========================================
// MOCK TENANTS STORAGE
// ==========================================
export const mockTenantsStorage = new Map<string, Tenant>();
export const mockLinkedTenantsStorage = new Map<string, LinkedTenant>();

/**
 * Initialize mock tenants with 100 sample tenants
 */
export function initializeMockTenants(): void {
  if (mockTenantsStorage.size > 0) return; // Already initialized

  const prefixes = [
    "山田水産",
    "田中漁業",
    "佐藤海運",
    "鈴木マリン",
    "高橋フィッシング",
  ];

  for (let i = 1; i <= 100; i++) {
    const id = `tenant-${String(i).padStart(3, "0")}-${Math.random()
      .toString(36)
      .substring(2, 11)}`;
    const prefix = prefixes[i % prefixes.length];
    const suffix = i > 1 ? ` ${i}` : "";

    const tenant: Tenant = {
      id,
      name: `${prefix}${suffix}`,
      address: `〒${100 + i}-${String(i * 11).padStart(
        4,
        "0"
      )} 東京都港区${i}丁目${i}-${i}`,
      createdAt: Date.now() - (100 - i) * 86400000,
      updatedAt: Date.now() - (50 - (i % 50)) * 3600000,
    };

    mockTenantsStorage.set(id, tenant);
  }
}

/**
 * Get tenant by ID
 */
export function getMockTenant(id: string): Tenant | undefined {
  return mockTenantsStorage.get(id);
}

/**
 * Get all mock tenants
 */
export function getAllMockTenants(): Tenant[] {
  return Array.from(mockTenantsStorage.values());
}

/**
 * Create or update a tenant
 */
export function storeMockTenant(tenant: Tenant): void {
  mockTenantsStorage.set(tenant.id, tenant);
}

/**
 * Get linked tenants for a specific tenant
 */
export function getMockLinkedTenants(tenantId: string): LinkedTenant[] {
  return Array.from(mockLinkedTenantsStorage.values()).filter(
    (lt) => lt.tenantId === tenantId
  );
}

/**
 * Get a specific linked tenant by ID
 */
export function getMockLinkedTenant(id: string): LinkedTenant | undefined {
  return mockLinkedTenantsStorage.get(id);
}

/**
 * Create or update a linked tenant
 */
export function storeMockLinkedTenant(linkedTenant: LinkedTenant): void {
  mockLinkedTenantsStorage.set(linkedTenant.id, linkedTenant);
}

/**
 * Delete a linked tenant
 */
export function deleteMockLinkedTenant(id: string): boolean {
  return mockLinkedTenantsStorage.delete(id);
}

/**
 * Initialize sample linked tenants
 */
export function initializeMockLinkedTenants(): void {
  if (mockLinkedTenantsStorage.size > 0) return;

  const allTenants = getAllMockTenants();

  // Create some random links between tenants
  for (let i = 0; i < Math.min(allTenants.length, 50); i++) {
    const tenant = allTenants[i];
    if (!tenant) continue;

    const linkCount = Math.floor(Math.random() * 4) + 1;

    for (let j = 0; j < linkCount; j++) {
      const linkedTenantIndex = (i + j + 1) % allTenants.length;
      const linkedTenantData = allTenants[linkedTenantIndex];

      if (linkedTenantData && linkedTenantData.id !== tenant.id) {
        const linkId = `link-${tenant.id}-${linkedTenantData.id}`;

        // Avoid duplicates
        if (!mockLinkedTenantsStorage.has(linkId)) {
          const linkedTenant: LinkedTenant = {
            id: linkId,
            tenantId: tenant.id,
            linkedTenantId: linkedTenantData.id,
            realtime: j % 2 === 0,
            createdAt: Date.now() - j * 86400000,
            createdBy: "admin-user",
            tenant: {
              id: linkedTenantData.id,
              name: linkedTenantData.name,
              address: linkedTenantData.address,
              createdAt: linkedTenantData.createdAt || Date.now(),
              updatedAt: linkedTenantData.updatedAt || Date.now(),
              topicArn: `arn:aws:sns:ap-northeast-1:123456789:${linkedTenantData.id}`,
            },
          };

          mockLinkedTenantsStorage.set(linkId, linkedTenant);
        }
      }
    }
  }
}

// Auto-initialize on module load
initializeMockTenants();
initializeMockLinkedTenants();
