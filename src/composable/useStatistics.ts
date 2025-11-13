import { ref } from "vue";
import useGraphQL from "./useGraphQL";
import {
  GetAccidentCountByStatusDocument,
  GetTotalTenantCountDocument,
  GetTotalFisherUserCountDocument,
  GetTotalDeviceCountDocument,
  GetTenantFisherUserCountDocument,
  GetTenantAccidentCountDocument,
} from "@/gql/generated/graphql";

export interface DashboardStats {
  totalTenants: number;
  totalFisherUsers: number;
  totalDevices: number;
  openAccidents: number;
}

export interface TenantStats {
  fisherUserCount: number;
  openAccidentCount: number;
  totalAccidentCount: number;
}

export const useStatistics = () => {
  const { query } = useGraphQL();
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Get dashboard statistics for homepage
   * Fetches total counts for tenants, fisher users, devices, and open accidents
   */
  const getDashboardStats = async (): Promise<DashboardStats | null> => {
    loading.value = true;
    error.value = null;

    try {
      // Execute all queries in parallel for better performance
      const [
        openAccidentsResult,
        totalTenantsResult,
        totalFisherUsersResult,
        totalDevicesResult,
      ] = await Promise.all([
        query(GetAccidentCountByStatusDocument, {
          variables: { status: "OPEN" },
        }),
        query(GetTotalTenantCountDocument),
        query(GetTotalFisherUserCountDocument),
        query(GetTotalDeviceCountDocument),
      ]);

      return {
        openAccidents: openAccidentsResult.getAccidentCountByStatus.count,
        totalTenants: totalTenantsResult.getTotalTenantCount.count,
        totalFisherUsers: totalFisherUsersResult.getTotalFisherUserCount.count,
        totalDevices: totalDevicesResult.getTotalDeviceCount.count,
      };
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "統計データの取得に失敗しました";
      console.error("Failed to fetch dashboard stats:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get tenant-specific statistics
   * Fetches fisher user count and accident counts for a specific tenant
   */
  const getTenantStats = async (
    tenantId: string
  ): Promise<TenantStats | null> => {
    loading.value = true;
    error.value = null;

    try {
      // Execute all queries in parallel
      const [
        fisherUserCountResult,
        openAccidentCountResult,
        totalAccidentCountResult,
      ] = await Promise.all([
        query(GetTenantFisherUserCountDocument, { variables: { tenantId } }),
        query(GetTenantAccidentCountDocument, {
          variables: { tenantId, status: "OPEN" },
        }),
        query(GetTenantAccidentCountDocument, {
          variables: { tenantId, status: null },
        }),
      ]);

      return {
        fisherUserCount: fisherUserCountResult.getTenantFisherUserCount.count,
        openAccidentCount: openAccidentCountResult.getTenantAccidentCount.count,
        totalAccidentCount:
          totalAccidentCountResult.getTenantAccidentCount.count,
      };
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "テナント統計データの取得に失敗しました";
      console.error("Failed to fetch tenant stats:", err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    getDashboardStats,
    getTenantStats,
  };
};

export default useStatistics;
