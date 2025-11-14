import { ref, computed } from "vue";
// Authentication disabled - using mock data
// Uncomment below to re-enable authentication
// import { fetchAuthSession } from "aws-amplify/auth";

interface CurrentUser {
  id: string;
  email: string;
  name?: string;
}

// Mock user data
const MOCK_USER: CurrentUser = {
  id: "mock-admin-user-123",
  email: "admin@example.com",
  name: "管理者ユーザー",
};

// Global state to cache user info
const user = ref<CurrentUser | null>(MOCK_USER);
const isLoading = ref(false);
const error = ref<string | null>(null);

export default function useCurrentUser() {
  const getCurrentUser = async (): Promise<CurrentUser | null> => {
    // === MOCK DATA IMPLEMENTATION ===
    return MOCK_USER;
    // === END MOCK DATA ===

    // === REAL AUTH IMPLEMENTATION (COMMENTED) ===
    // Uncomment below to use real authentication
    // if (user.value) {
    //   return user.value;
    // }
    //
    // try {
    //   isLoading.value = true;
    //   error.value = null;
    //
    //   const { tokens } = await fetchAuthSession();
    //
    //   if (!tokens?.idToken) {
    //     console.warn("No ID token available");
    //     user.value = null;
    //     return null;
    //   }
    //
    //   const payload = tokens.idToken.payload;
    //
    //   if (!payload) {
    //     console.warn("ID token payload is null or undefined");
    //     user.value = null;
    //     return null;
    //   }
    //
    //   const currentUser: CurrentUser = {
    //     id: payload.sub as string,
    //     email: payload.email as string,
    //     name:
    //       (payload.name as string) ||
    //       (payload.given_name as string) ||
    //       (payload.email as string),
    //   };
    //
    //   user.value = currentUser;
    //   return currentUser;
    // } catch (err) {
    //   console.error("Error getting current user:", err);
    //   user.value = null;
    //   error.value = err instanceof Error ? err.message : "Unknown error";
    //   return null;
    // } finally {
    //   isLoading.value = false;
    // }
    // === END REAL AUTH ===
  };

  const clearUser = () => {
    user.value = null;
    error.value = null;
  };

  // Get userId directly (most common use case)
  const getUserId = async (): Promise<string> => {
    // === MOCK DATA IMPLEMENTATION ===
    return MOCK_USER.id;
    // === END MOCK DATA ===

    // === REAL AUTH IMPLEMENTATION (COMMENTED) ===
    // const currentUser = await getCurrentUser();
    // return currentUser?.id || "unknown";
    // === END REAL AUTH ===
  };

  return {
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    getCurrentUser,
    getUserId,
    clearUser,
  };
}
