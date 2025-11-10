import { ref } from "vue";
import useGraphQL from "./useGraphQL";
import {
  GetTenantsDocument,
  GetTenantByIdDocument,
  GetTenantWithMembersDocument,
  GetLinkedTenantsDocument,
  UpdateTenantDocument,
  CreateTenantLinkDocument,
  UpdateTenantLinkDocument,
  DeleteTenantLinkDocument,
  type GetTenantsQuery,
  type GetTenantByIdQuery,
  type GetTenantWithMembersQuery,
  type GetLinkedTenantsQuery,
  type UpdateTenantMutation,
  type CreateTenantLinkMutation,
  type UpdateTenantLinkMutation,
  type DeleteTenantLinkMutation,
} from "@/gql/generated/graphql";
import type { Tenant, LinkedTenant } from "@/types/tenant";
import type { FisherUser } from "@/types/account";

export default function useTenants() {
  const { query, mutate } = useGraphQL();
  const isLoading = ref(false);

  /**
   * Get all tenants with pagination
   */
  const getTenants = async (params?: {
    limit?: number;
    nextToken?: string | null;
    excludeTest?: boolean;
  }): Promise<{ tenants: Tenant[]; nextToken: string | null }> => {
    isLoading.value = true;

    try {
      const result = await query<GetTenantsQuery>(GetTenantsDocument, {
        variables: {
          limit: params?.limit || 10000,
          nextToken: params?.nextToken || null,
        },
      });

      if (result?.getTenants?.tenants) {
        let tenants = result.getTenants.tenants
          .filter((t) => t !== null)
          .map((t) => ({
            id: t!.id,
            name: t!.name,
            address: t!.address || "",
            createdAt: t!.createdAt,
            updatedAt: t!.updatedAt,
          }));

        // Filter out test tenants if needed
        if (params?.excludeTest) {
          tenants = tenants.filter((tenant) => {
            if (
              tenant.name.includes("test") ||
              tenant.name.includes("to-tenant-") ||
              tenant.name.includes("from-tenant-") ||
              tenant.name.includes("to-tenant2-") ||
              tenant.name.includes("to-tenant2nd")
            ) {
              return false;
            }
            return true;
          });
        }

        return {
          tenants,
          nextToken: result.getTenants.nextToken ?? null,
        };
      }

      return { tenants: [], nextToken: null };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get tenant by ID
   */
  const getTenantById = async (id: string): Promise<Tenant | null> => {
    isLoading.value = true;

    try {
      const result = await query<GetTenantByIdQuery>(GetTenantByIdDocument, {
        variables: { id },
      });

      if (result?.getTenantById) {
        const tenantData = result.getTenantById;
        return {
          id: tenantData.id,
          name: tenantData.name,
          address: tenantData.address || "",
          createdAt: tenantData.createdAt,
          updatedAt: tenantData.updatedAt,
        };
      }

      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get linked tenants for a tenant
   */
  const getLinkedTenants = async (
    tenantId: string
  ): Promise<LinkedTenant[]> => {
    isLoading.value = true;

    try {
      const result = await query<GetLinkedTenantsQuery>(
        GetLinkedTenantsDocument,
        {
          variables: { tenantId },
        }
      );

      if (result?.getLinkedTenants) {
        return result.getLinkedTenants
          .filter((lt) => lt !== null)
          .map((lt) => lt as LinkedTenant);
      }

      return [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Update tenant information
   */
  const updateTenant = async (params: {
    id: string;
    name: string;
    address: string;
  }): Promise<Tenant | null> => {
    const result = await mutate<UpdateTenantMutation>(UpdateTenantDocument, {
      variables: params,
    });

    if (result?.updateTenant) {
      return {
        id: result.updateTenant.id,
        name: result.updateTenant.name,
        address: result.updateTenant.address || "",
        updatedAt: result.updateTenant.updatedAt,
      };
    }

    return null;
  };

  /**
   * Create linked tenant
   */
  const createTenantLink = async (params: {
    tenantId: string;
    linkedTenantId: string;
    createdBy: string;
    realtime: boolean;
  }): Promise<LinkedTenant | null> => {
    const result = await mutate<CreateTenantLinkMutation>(
      CreateTenantLinkDocument,
      {
        variables: params,
      }
    );

    if (result?.createTenantLink) {
      return result.createTenantLink as LinkedTenant;
    }

    return null;
  };

  /**
   * Toggle realtime status of linked tenant
   */
  const updateTenantLink = async (params: {
    tenantId: string;
    linkedTenantId: string;
  }): Promise<{ realtime: boolean } | null> => {
    const result = await mutate<UpdateTenantLinkMutation>(
      UpdateTenantLinkDocument,
      {
        variables: params,
      }
    );

    if (result?.updateTenantLink) {
      return {
        realtime: result.updateTenantLink.realtime,
      };
    }

    return null;
  };

  /**
   * Delete linked tenant
   */
  const deleteTenantLink = async (params: {
    tenantId: string;
    linkedTenantId: string;
  }): Promise<boolean> => {
    const result = await mutate<DeleteTenantLinkMutation>(
      DeleteTenantLinkDocument,
      {
        variables: params,
      }
    );

    return !!result;
  };

  /**
   * Get tenant with members (FisherUsers)
   */
  const getTenantWithMembers = async (
    id: string
  ): Promise<{ tenant: Tenant | null; members: FisherUser[] }> => {
    isLoading.value = true;

    try {
      const result = await query<GetTenantWithMembersQuery>(
        GetTenantWithMembersDocument,
        {
          variables: { id },
        }
      );

      if (result?.getTenantById) {
        const tenantData = result.getTenantById;
        const tenant: Tenant = {
          id: tenantData.id,
          name: tenantData.name,
          address: tenantData.address || "",
          createdAt: tenantData.createdAt,
          updatedAt: tenantData.updatedAt,
        };

        const members: FisherUser[] =
          tenantData.members?.map((m) => ({
            id: m.id,
            name: m.name,
            nickname: m.nickname || "",
            encryptedPassword: m.encryptedPassword || "",
            tenants:
              m.tenants?.map((t) => ({
                id: t.id,
                name: t.name,
              })) || [],
            devices: {
              devices:
                m.devices?.devices?.map((d) => ({
                  id: d.id,
                  imei: d.imei,
                  deviceType: d.deviceType || "",
                })) || [],
            },
            lineUsers:
              m.lineUsers?.map((lu) => ({
                userId: lu.userId,
                displayName: lu.displayName,
                pictureUrl: lu.pictureUrl || null,
              })) || null,
          })) || [];

        return { tenant, members };
      }

      return { tenant: null, members: [] };
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
    createTenantLink,
    updateTenantLink,
    deleteTenantLink,
  };
}
