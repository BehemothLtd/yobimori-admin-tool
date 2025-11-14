import { ref } from "vue";
// API calls disabled - using mock data
// Uncomment below to re-enable API calls
// import useGraphQL from "./useGraphQL";
// import {
//   GetTenantsDocument,
//   GetTenantByIdDocument,
//   GetTenantWithMembersDocument,
//   GetLinkedTenantsDocument,
//   UpdateTenantDocument,
//   CreateTenantDocument,
//   CreateTenantLinkDocument,
//   UpdateTenantLinkDocument,
//   DeleteTenantLinkDocument,
//   type GetTenantsQuery,
//   type GetTenantByIdQuery,
//   type GetTenantWithMembersQuery,
//   type GetLinkedTenantsQuery,
//   type UpdateTenantMutation,
//   type CreateTenantMutation,
//   type CreateTenantLinkMutation,
//   type UpdateTenantLinkMutation,
//   type DeleteTenantLinkMutation,
// } from "@/gql/generated/graphql";
import type { Tenant, LinkedTenant } from "@/types/tenant";
import type { FisherUser } from "@/types/account";
import {
  storeMockAccount,
  getAllMockTenants,
  getMockTenant,
  storeMockTenant,
  getMockLinkedTenants,
  getMockLinkedTenant,
  storeMockLinkedTenant,
  deleteMockLinkedTenant,
} from "@/lib/mockData";

export default function useTenants() {
  // const { query, mutate } = useGraphQL(); // Uncomment to re-enable API
  const isLoading = ref(false);

  /**
   * Get all tenants with pagination
   * MOCK DATA - API disabled, implements client-side filtering
   * Uncomment the code below to re-enable API calls
   */
  const getTenants = async (params?: {
    limit?: number;
    nextToken?: string | null;
    nameCont?: string;
    excludeTest?: boolean;
  }): Promise<{ tenants: Tenant[]; nextToken: string | null }> => {
    isLoading.value = true;

    try {
      // === MOCK DATA IMPLEMENTATION ===
      // Remove/comment this block to re-enable API
      await new Promise((resolve) => setTimeout(resolve, 300));

      let filteredTenants = getAllMockTenants();

      // Apply search filter if nameCont is provided
      if (params?.nameCont) {
        filteredTenants = filteredTenants.filter((tenant) =>
          tenant.name.toLowerCase().includes(params.nameCont!.toLowerCase())
        );
      }

      // Filter out test tenants if needed
      if (params?.excludeTest) {
        filteredTenants = filteredTenants.filter(
          (tenant) => !tenant.name.toLowerCase().includes("test")
        );
      }

      const limit = params?.limit || 30;
      const startIndex = params?.nextToken ? parseInt(params.nextToken, 10) : 0;
      const endIndex = startIndex + limit;

      const tenants = filteredTenants.slice(startIndex, endIndex);
      const nextToken =
        endIndex < filteredTenants.length ? String(endIndex) : null;

      return { tenants, nextToken };
      // === END MOCK DATA ===

      // === REAL API IMPLEMENTATION (COMMENTED) ===
      // Uncomment below to use real API
      // const result = await query<GetTenantsQuery>(GetTenantsDocument, {
      //   variables: {
      //     limit: params?.limit || 30,
      //     nextToken: params?.nextToken || null,
      //     nameCont: params?.nameCont || null,
      //   },
      // });
      //
      // if (result?.getTenants?.tenants) {
      //   let tenants = result.getTenants.tenants
      //     .filter((t) => t !== null)
      //     .map((t) => ({
      //       id: t!.id,
      //       name: t!.name,
      //       address: t!.address || "",
      //       createdAt: t!.createdAt,
      //       updatedAt: t!.updatedAt,
      //     }));
      //
      //   // Filter out test tenants if needed
      //   if (params?.excludeTest) {
      //     tenants = tenants.filter((tenant) => {
      //       if (tenant.name.includes("test")) {
      //         return false;
      //       }
      //       return true;
      //     });
      //   }
      //
      //   return {
      //     tenants,
      //     nextToken: result.getTenants.nextToken ?? null,
      //   };
      // }
      //
      // return { tenants: [], nextToken: null };
      // === END REAL API ===
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get tenant by ID
   * MOCK DATA - API disabled
   * Uncomment the code below to re-enable API calls
   */
  const getTenantById = async (id: string): Promise<Tenant | null> => {
    isLoading.value = true;

    try {
      // === MOCK DATA IMPLEMENTATION ===
      await new Promise((resolve) => setTimeout(resolve, 200));
      const tenant = getMockTenant(id);
      return tenant || null;
      // === END MOCK DATA ===

      // === REAL API IMPLEMENTATION (COMMENTED) ===
      // const result = await query<GetTenantByIdQuery>(GetTenantByIdDocument, {
      //   variables: { id },
      // });
      //
      // if (result?.getTenantById) {
      //   const tenantData = result.getTenantById;
      //   return {
      //     id: tenantData.id,
      //     name: tenantData.name,
      //     address: tenantData.address || "",
      //     createdAt: tenantData.createdAt,
      //     updatedAt: tenantData.updatedAt,
      //   };
      // }
      //
      // return null;
      // === END REAL API ===
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get linked tenants for a tenant
   * MOCK DATA - API disabled
   */
  const getLinkedTenants = async (
    tenantId: string
  ): Promise<LinkedTenant[]> => {
    isLoading.value = true;

    try {
      // === MOCK DATA IMPLEMENTATION ===
      await new Promise((resolve) => setTimeout(resolve, 200));
      return getMockLinkedTenants(tenantId);
      // === END MOCK DATA ===

      // === REAL API IMPLEMENTATION (COMMENTED) ===
      // const result = await query<GetLinkedTenantsQuery>(
      //   GetLinkedTenantsDocument,
      //   { variables: { tenantId } }
      // );
      // if (result?.getLinkedTenants) {
      //   return result.getLinkedTenants
      //     .filter((lt) => lt !== null)
      //     .map((lt) => lt as LinkedTenant);
      // }
      // return [];
      // === END REAL API ===
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update tenant information
   * MOCK DATA - API disabled
   */
  const updateTenant = async (params: {
    id: string;
    name: string;
    address: string;
  }): Promise<Tenant | null> => {
    // === MOCK DATA IMPLEMENTATION ===
    await new Promise((resolve) => setTimeout(resolve, 300));
    const tenant = getMockTenant(params.id);
    if (tenant) {
      const updatedTenant: Tenant = {
        ...tenant,
        name: params.name,
        address: params.address,
        updatedAt: Date.now(),
      };
      storeMockTenant(updatedTenant);
      return updatedTenant;
    }
    return null;
    // === END MOCK DATA ===

    // === REAL API IMPLEMENTATION (COMMENTED) ===
    // const result = await mutate<UpdateTenantMutation>(UpdateTenantDocument, {
    //   variables: params,
    // });
    // if (result?.updateTenant) {
    //   return {
    //     id: result.updateTenant.id,
    //     name: result.updateTenant.name,
    //     address: result.updateTenant.address || "",
    //     updatedAt: result.updateTenant.updatedAt,
    //   };
    // }
    // return null;
    // === END REAL API ===
  };

  /**
   * Create new tenant
   * MOCK DATA - API disabled
   */
  const createTenant = async (params: {
    name: string;
    address?: string;
  }): Promise<Tenant | null> => {
    // === MOCK DATA IMPLEMENTATION ===
    await new Promise((resolve) => setTimeout(resolve, 400));
    const newTenant: Tenant = {
      id: `tenant-new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: params.name,
      address: params.address || "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    storeMockTenant(newTenant);
    return newTenant;
    // === END MOCK DATA ===

    // === REAL API IMPLEMENTATION (COMMENTED) ===
    // const result = await mutate<CreateTenantMutation>(CreateTenantDocument, {
    //   variables: params,
    // });
    // if (result?.createTenant) {
    //   return {
    //     id: result.createTenant.id,
    //     name: result.createTenant.name,
    //     address: result.createTenant.address || "",
    //     createdAt: result.createTenant.createdAt,
    //     updatedAt: result.createTenant.updatedAt,
    //   };
    // }
    // return null;
    // === END REAL API ===
  };

  /**
   * Create linked tenant
   * MOCK DATA - API disabled
   */
  const createTenantLink = async (params: {
    tenantId: string;
    linkedTenantId: string;
    createdBy: string;
    realtime: boolean;
  }): Promise<LinkedTenant | null> => {
    // === MOCK DATA IMPLEMENTATION ===
    await new Promise((resolve) => setTimeout(resolve, 300));
    const linkedTenant = getMockTenant(params.linkedTenantId);
    if (!linkedTenant) return null;

    const newLink: LinkedTenant = {
      id: `link-${params.tenantId}-${params.linkedTenantId}`,
      tenantId: params.tenantId,
      linkedTenantId: params.linkedTenantId,
      realtime: params.realtime,
      createdAt: Date.now(),
      createdBy: params.createdBy,
      tenant: {
        id: linkedTenant.id,
        name: linkedTenant.name,
        address: linkedTenant.address,
        createdAt: linkedTenant.createdAt || Date.now(),
        updatedAt: linkedTenant.updatedAt || Date.now(),
        topicArn: `arn:aws:sns:ap-northeast-1:123456789:${linkedTenant.id}`,
      },
    };

    storeMockLinkedTenant(newLink);
    return newLink;
    // === END MOCK DATA ===

    // === REAL API IMPLEMENTATION (COMMENTED) ===
    // const result = await mutate<CreateTenantLinkMutation>(
    //   CreateTenantLinkDocument,
    //   { variables: params }
    // );
    // if (result?.createTenantLink) {
    //   return result.createTenantLink as LinkedTenant;
    // }
    // return null;
    // === END REAL API ===
  };

  /**
   * Toggle realtime status of linked tenant
   * MOCK DATA - API disabled
   */
  const updateTenantLink = async (params: {
    tenantId: string;
    linkedTenantId: string;
  }): Promise<{ realtime: boolean } | null> => {
    // === MOCK DATA IMPLEMENTATION ===
    await new Promise((resolve) => setTimeout(resolve, 200));

    const linkId = `link-${params.tenantId}-${params.linkedTenantId}`;
    const link = getMockLinkedTenant(linkId);

    if (link) {
      const updatedLink: LinkedTenant = {
        ...link,
        realtime: !link.realtime, // Toggle
      };
      storeMockLinkedTenant(updatedLink);
      return { realtime: updatedLink.realtime };
    }

    return null;
    // === END MOCK DATA ===

    // === REAL API IMPLEMENTATION (COMMENTED) ===
    // const result = await mutate<UpdateTenantLinkMutation>(
    //   UpdateTenantLinkDocument,
    //   { variables: params }
    // );
    // if (result?.updateTenantLink) {
    //   return { realtime: result.updateTenantLink.realtime ?? false };
    // }
    // return null;
    // === END REAL API ===
  };

  /**
   * Delete linked tenant
   * MOCK DATA - API disabled
   */
  const deleteTenantLink = async (params: {
    tenantId: string;
    linkedTenantId: string;
  }): Promise<boolean> => {
    // === MOCK DATA IMPLEMENTATION ===
    await new Promise((resolve) => setTimeout(resolve, 200));
    const linkId = `link-${params.tenantId}-${params.linkedTenantId}`;
    return deleteMockLinkedTenant(linkId);
    // === END MOCK DATA ===

    // === REAL API IMPLEMENTATION (COMMENTED) ===
    // const result = await mutate<DeleteTenantLinkMutation>(
    //   DeleteTenantLinkDocument,
    //   { variables: params }
    // );
    // return !!result;
    // === END REAL API ===
  };

  /**
   * Get tenant with members (FisherUsers)
   * MOCK DATA - API disabled
   */
  const getTenantWithMembers = async (
    id: string
  ): Promise<{ tenant: Tenant | null; members: FisherUser[] }> => {
    isLoading.value = true;

    try {
      // === MOCK DATA IMPLEMENTATION ===
      await new Promise((resolve) => setTimeout(resolve, 300));
      const tenant = await getTenantById(id);

      if (!tenant) {
        return { tenant: null, members: [] };
      }

      // Generate mock fisher users and store them
      const memberCount = Math.floor(Math.random() * 15) + 5;
      const members: FisherUser[] = Array.from(
        { length: memberCount },
        (_, i) => {
          const userId = `user-${id}-${String(i + 1).padStart(3, "0")}`;
          const deviceCount = Math.floor(Math.random() * 3) + 1;

          const member: FisherUser = {
            id: userId,
            name: `漁師 ${String(i + 1).padStart(2, "0")}`,
            nickname: `ニックネーム${i + 1}`,
            encryptedPassword: btoa(`password-${i + 1}`),
            tenants: [{ id: tenant.id, name: tenant.name }],
            devices: {
              devices: Array.from({ length: deviceCount }, (_, j) => ({
                id: `device-${userId}-${j}`,
                imei: `35${String(
                  Math.floor(Math.random() * 10000000000000)
                ).padStart(13, "0")}`,
                deviceType: j === 0 ? "PRIMARY" : "SECONDARY",
              })),
            },
            lineUsers:
              Math.random() > 0.3
                ? [
                    {
                      userId: `line-${userId}`,
                      displayName: `LINE表示名${i + 1}`,
                      pictureUrl: null,
                    },
                  ]
                : null,
          };

          storeMockAccount(member);
          return member;
        }
      );

      return { tenant, members };
      // === END MOCK DATA ===

      // === REAL API IMPLEMENTATION (COMMENTED) ===
      // const result = await query<GetTenantWithMembersQuery>(
      //   GetTenantWithMembersDocument,
      //   { variables: { id } }
      // );
      //
      // if (result?.getTenantById) {
      //   const tenantData = result.getTenantById;
      //   const tenant: Tenant = {
      //     id: tenantData.id,
      //     name: tenantData.name,
      //     address: tenantData.address || "",
      //     createdAt: tenantData.createdAt,
      //     updatedAt: tenantData.updatedAt,
      //   };
      //
      //   const members: FisherUser[] =
      //     tenantData.members?.map((m) => ({
      //       id: m.id,
      //       name: m.name,
      //       nickname: m.nickname || "",
      //       encryptedPassword: m.encryptedPassword || "",
      //       tenants:
      //         m.tenants?.map((t) => ({
      //           id: t.id,
      //           name: t.name,
      //         })) || [],
      //       devices: {
      //         devices:
      //           m.devices?.devices?.map((d) => ({
      //             id: d.id,
      //             imei: d.imei,
      //             deviceType: d.deviceType || "",
      //           })) || [],
      //       },
      //       lineUsers:
      //         m.lineUsers?.map((lu) => ({
      //           userId: lu.userId,
      //           displayName: lu.displayName,
      //           pictureUrl: lu.pictureUrl || null,
      //         })) || null,
      //     })) || [];
      //
      //   return { tenant, members };
      // }
      //
      // return { tenant: null, members: [] };
      // === END REAL API ===
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    getTenants,
    getTenantById,
    getTenantWithMembers,
    getLinkedTenants,
    updateTenant,
    createTenant,
    createTenantLink,
    updateTenantLink,
    deleteTenantLink,
  };
}
