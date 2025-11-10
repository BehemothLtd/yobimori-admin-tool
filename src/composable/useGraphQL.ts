import { ref } from "vue";
import { apolloClient } from "@/lib/apollo";
import type { DocumentNode } from "graphql";
import useSwal from "./useSwal";

export interface QueryOptions {
  variables?: Record<string, any>;
  fetchPolicy?: "cache-first" | "network-only" | "cache-only" | "no-cache";
}

export interface MutationOptions {
  variables?: Record<string, any>;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export default function useGraphQL() {
  const { success, error: errorToast } = useSwal();
  const loading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * Execute a GraphQL query
   */
  async function query<T = any>(
    queryDoc: DocumentNode,
    options: QueryOptions = {}
  ): Promise<T | null> {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await apolloClient.query({
        query: queryDoc,
        variables: options.variables,
        fetchPolicy: options.fetchPolicy || "network-only",
      });

      return data as T;
    } catch (err) {
      error.value = err as Error;
      console.error("GraphQL Query Error:", err);

      await errorToast({
        title: "クエリエラー",
        text: "データの取得に失敗しました。",
      });

      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Execute a GraphQL mutation
   */
  async function mutate<T = any>(
    mutationDoc: DocumentNode,
    options: MutationOptions = {}
  ): Promise<T | null> {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await apolloClient.mutate({
        mutation: mutationDoc,
        variables: options.variables,
      });

      // Show success toast if enabled
      if (options.showSuccessToast) {
        await success({
          title: "成功",
          text: options.successMessage || "操作が正常に完了しました。",
        });
      }

      return data as T;
    } catch (err) {
      error.value = err as Error;
      console.error("GraphQL Mutation Error:", err);

      await errorToast({
        title: "ミューテーションエラー",
        text: "操作に失敗しました。",
      });

      return null;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Clear error state
   */
  function clearError() {
    error.value = null;
  }

  return {
    loading,
    error,
    query,
    mutate,
    clearError,
  };
}
