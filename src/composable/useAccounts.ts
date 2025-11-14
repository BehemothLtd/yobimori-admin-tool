// API calls disabled - using mock data
// Uncomment below to re-enable API calls
// import useGraphQL from "./useGraphQL";
// import {
//   GetFisherUserByIdDocument,
//   CreateFisherUserDocument,
//   UpdateFisherUserNicknameDocument,
//   UpdateFisherUserPasswordDocument,
//   type GetFisherUserByIdQuery,
//   type CreateFisherUserMutation,
//   type UpdateFisherUserNicknameMutation,
//   type UpdateFisherUserPasswordMutation,
// } from "@/gql/generated/graphql";
// API calls disabled - using mock data
// Uncomment below to re-enable API calls
// import useGraphQL from "./useGraphQL";
// import {
//   GetAccountByIdDocument,
//   CreateAccountDocument,
//   UpdateAccountNicknameDocument,
//   UpdateAccountPasswordDocument,
//   type GetAccountByIdQuery,
//   type CreateAccountMutation,
//   type UpdateAccountNicknameMutation,
//   type UpdateAccountPasswordMutation,
// } from "@/gql/generated/graphql";
import type { FisherUser as Account } from "@/types/account";
import { storeMockAccount, getMockAccount } from "@/lib/mockData";

// Safe base64 encoding for UTF-8 strings (supports Japanese characters)
function safeBase64Encode(str: string): string {
  try {
    // Convert to UTF-8 bytes then base64
    return btoa(unescape(encodeURIComponent(str)));
  } catch (e) {
    // Fallback: just return the string if encoding fails
    console.warn("Base64 encoding failed, using plain string:", e);
    return str;
  }
}

export default function useAccounts() {
  // const { query, mutate } = useGraphQL(); // Uncomment to re-enable API

  /**
   * Get a single fisher user by ID
   * MOCK DATA - API disabled
   * Uncomment the code below to re-enable API calls
   */
  const getFisherUserById = async (id: string): Promise<Account | null> => {
    // === MOCK DATA IMPLEMENTATION ===
    await new Promise((resolve) => setTimeout(resolve, 200));
    return getMockAccount(id) || null;
    // === END MOCK DATA ===

    // === REAL API IMPLEMENTATION (COMMENTED) ===
    // const result = await query<GetFisherUserByIdQuery>(
    //   GetFisherUserByIdDocument,
    //   {
    //     variables: { id },
    //   }
    // );
    // return (result?.getFisherUserById as Account) || null;
    // === END REAL API ===
  };

  /**
   * Create a new fisher user
   * MOCK DATA - API disabled
   * Uncomment the code below to re-enable API calls
   */
  const createFisherUser = async (params: {
    id: string;
    name: string;
  }): Promise<Account | null> => {
    // === MOCK DATA IMPLEMENTATION ===
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newAccount: Account = {
      id: params.id,
      name: params.name,
      nickname: params.name,
      encryptedPassword: safeBase64Encode(`password-${params.name}`),
      tenants: [],
      devices: {
        devices: [],
      },
      lineUsers: null,
    };

    storeMockAccount(newAccount);
    return newAccount;
    // === END MOCK DATA ===

    // === REAL API IMPLEMENTATION (COMMENTED) ===
    // const result = await mutate<CreateFisherUserMutation>(
    //   CreateFisherUserDocument,
    //   {
    //     variables: params,
    //   }
    // );
    // return (result?.createFisherUser as unknown as Account) || null;
    // === END REAL API ===
  };

  /**
   * Update fisher user nickname
   * MOCK DATA - API disabled
   * Uncomment the code below to re-enable API calls
   */
  const updateFisherUserNickname = async (params: {
    id: string;
    nickname: string;
  }): Promise<Account | null> => {
    // === MOCK DATA IMPLEMENTATION ===
    await new Promise((resolve) => setTimeout(resolve, 200));

    const account = getMockAccount(params.id);
    if (account) {
      account.nickname = params.nickname;
      storeMockAccount(account);
      return account;
    }

    return null;
    // === END MOCK DATA ===

    // === REAL API IMPLEMENTATION (COMMENTED) ===
    // const result = await mutate<UpdateFisherUserNicknameMutation>(
    //   UpdateFisherUserNicknameDocument,
    //   {
    //     variables: params,
    //   }
    // );
    // return (result?.updateFisherUserNickname as unknown as Account) || null;
    // === END REAL API ===
  };

  /**
   * Update fisher user password
   * MOCK DATA - API disabled
   * Uncomment the code below to re-enable API calls
   */
  const updateFisherUserPassword = async (params: {
    id: string;
    password: string;
  }): Promise<Account | null> => {
    // === MOCK DATA IMPLEMENTATION ===
    await new Promise((resolve) => setTimeout(resolve, 200));

    const account = getMockAccount(params.id);
    if (account) {
      account.encryptedPassword = safeBase64Encode(params.password);
      storeMockAccount(account);
      return account;
    }

    return null;
    // === END MOCK DATA ===

    // === REAL API IMPLEMENTATION (COMMENTED) ===
    // const result = await mutate<UpdateFisherUserPasswordMutation>(
    //   UpdateFisherUserPasswordDocument,
    //   {
    //     variables: params,
    //   }
    // );
    // return (
    //   (result?.updateFisherUserPasswordWithEncryption as unknown as Account) ||
    //   null
    // );
    // === END REAL API ===
  };

  return {
    getFisherUserById,
    createFisherUser,
    updateFisherUserNickname,
    updateFisherUserPassword,
  };
}
