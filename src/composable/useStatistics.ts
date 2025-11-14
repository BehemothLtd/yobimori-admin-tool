import { ref } from "vue";
// API calls disabled - using mock data
// Uncomment below to re-enable API calls
// import useGraphQL from "./useGraphQL";
// import {
//   GetAccidentCountByStatusDocument,
//   GetTotalTenantCountDocument,
//   GetTotalFisherUserCountDocument,
//   GetTotalDeviceCountDocument,
//   GetTenantFisherUserCountDocument,
//   GetTenantAccidentCountDocument,
// } from "@/gql/generated/graphql";

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
  // const { query } = useGraphQL(); // Uncomment to re-enable API
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Get dashboard statistics for homepage
   * MOCK DATA - API disabled
   * Uncomment the code below to re-enable API calls
   */
  const getDashboardStats = async (): Promise<DashboardStats | null> => {
    loading.value = true;
    error.value = null;

    try {
      // === MOCK DATA IMPLEMENTATION ===
      // Remove/comment this block to re-enable API
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        totalTenants: 45,
        totalFisherUsers: 320,
        totalDevices: 280,
        openAccidents: 12,
      };
      // === END MOCK DATA ===

      // === REAL API IMPLEMENTATION (COMMENTED) ===
      // Uncomment below to use real API
      // const [
      //   openAccidentsResult,
      //   totalTenantsResult,
      //   totalFisherUsersResult,
      //   totalDevicesResult,
      // ] = await Promise.all([
      //   query(GetAccidentCountByStatusDocument, {
      //     variables: { status: "OPEN" },
      //   }),
      //   query(GetTotalTenantCountDocument),
      //   query(GetTotalFisherUserCountDocument),
      //   query(GetTotalDeviceCountDocument),
      // ]);
      //
      // return {
      //   openAccidents: openAccidentsResult.getAccidentCountByStatus.count,
      //   totalTenants: totalTenantsResult.getTotalTenantCount.count,
      //   totalFisherUsers: totalFisherUsersResult.getTotalFisherUserCount.count,
      //   totalDevices: totalDevicesResult.getTotalDeviceCount.count,
      // };
      // === END REAL API ===
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
   * MOCK DATA - API disabled
   * Uncomment the code below to re-enable API calls
   */
  const getTenantStats = async (
    tenantId: string
  ): Promise<TenantStats | null> => {
    loading.value = true;
    error.value = null;

    try {
      // === MOCK DATA IMPLEMENTATION ===
      // Remove/comment this block to re-enable API
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Extract number from tenantId format: "tenant-002-xxxxx"
      // Match the numeric part after first hyphen
      const match = tenantId.match(/tenant-(\d+)-/);
      const baseCount = match && match[1] ? parseInt(match[1], 10) : 5;

      const result = {
        fisherUserCount: baseCount * 8 + 15,
        openAccidentCount: Math.floor(baseCount / 2),
        totalAccidentCount: baseCount * 3 + 10,
      };
      return result;
      // === END MOCK DATA ===

      // === REAL API IMPLEMENTATION (COMMENTED) ===
      // Uncomment below to use real API
      // const [
      //   fisherUserCountResult,
      //   openAccidentCountResult,
      //   totalAccidentCountResult,
      // ] = await Promise.all([
      //   query(GetTenantFisherUserCountDocument, { variables: { tenantId } }),
      //   query(GetTenantAccidentCountDocument, {
      //     variables: { tenantId, status: "OPEN" },
      //   }),
      //   query(GetTenantAccidentCountDocument, {
      //     variables: { tenantId, status: null },
      //   }),
      // ]);
      //
      // return {
      //   fisherUserCount: fisherUserCountResult.getTenantFisherUserCount.count,
      //   openAccidentCount: openAccidentCountResult.getTenantAccidentCount.count,
      //   totalAccidentCount:
      //     totalAccidentCountResult.getTenantAccidentCount.count,
      // };
      // === END REAL API ===
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
