import { ref, computed } from "vue";
import { fetchAuthSession } from "aws-amplify/auth";

interface CurrentUser {
  id: string;
  email: string;
  name?: string;
}

// Global state to cache user info
const user = ref<CurrentUser | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

export default function useCurrentUser() {
  const getCurrentUser = async (): Promise<CurrentUser | null> => {
    // Return cached user if available
    if (user.value) {
      return user.value;
    }

    try {
      isLoading.value = true;
      error.value = null;

      const { tokens } = await fetchAuthSession();

      if (!tokens?.idToken) {
        console.warn("No ID token available");
        user.value = null;
        return null;
      }

      const payload = tokens.idToken.payload;

      if (!payload) {
        console.warn("ID token payload is null or undefined");
        user.value = null;
        return null;
      }

      const currentUser: CurrentUser = {
        id: payload.sub as string,
        email: payload.email as string,
        name:
          (payload.name as string) ||
          (payload.given_name as string) ||
          (payload.email as string),
      };

      user.value = currentUser;
      return currentUser;
    } catch (err) {
      console.error("Error getting current user:", err);
      user.value = null;
      error.value = err instanceof Error ? err.message : "Unknown error";
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const clearUser = () => {
    user.value = null;
    error.value = null;
  };

  // Get userId directly (most common use case)
  const getUserId = async (): Promise<string> => {
    const currentUser = await getCurrentUser();
    return currentUser?.id || "unknown";
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
