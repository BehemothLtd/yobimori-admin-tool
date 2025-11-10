import { KMSClient } from "@aws-sdk/client-kms";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fetchAuthSession } from "aws-amplify/auth";

/**
 * Get KMS client with Cognito credentials for decrypting passwords
 *
 * Uses the same pattern as nf_admin_tool to authenticate with:
 * - Cognito User Pool (for authentication)
 * - Cognito Identity Pool (for AWS credentials)
 * - KMS (for decryption)
 */
export const getKmsClient = async (): Promise<KMSClient> => {
  try {
    console.log("[KMS] Getting auth session...");
    // Get the current auth session from Amplify
    const { tokens } = await fetchAuthSession();

    console.log("[KMS] Auth session:", {
      hasIdToken: !!tokens?.idToken,
      hasAccessToken: !!tokens?.accessToken,
    });

    if (!tokens?.idToken) {
      throw new Error("認証トークンが見つかりません。ログインしてください。");
    }

    const region = import.meta.env.VITE_REGION || "ap-northeast-1";
    const identityPoolId = import.meta.env.VITE_COGNITO_ADMIN_IDENTITY_POOL_ID;
    const identityProviderName = import.meta.env
      .VITE_COGNITO_ADMIN_IDENTITY_PROVIDER_NAME;

    console.log("[KMS] Config:", {
      region,
      identityPoolId,
      identityProviderName,
    });

    if (!identityPoolId || !identityProviderName) {
      throw new Error("AWS Cognito設定が不足しています。");
    }

    // Create Cognito Identity Client for credential provider
    const cognitoIdentityClient = new CognitoIdentityClient({ region });

    // Get temporary AWS credentials from Cognito Identity Pool
    const credentials = fromCognitoIdentityPool({
      client: cognitoIdentityClient,
      identityPoolId,
      logins: {
        [identityProviderName]: tokens.idToken.toString(),
      },
    });

    console.log("[KMS] Creating KMS client...");
    // Create and return KMS client with the temporary credentials
    return new KMSClient({
      region,
      credentials,
      maxAttempts: 3,
    });
  } catch (error) {
    console.error("[KMS] Failed to create KMS client:", error);
    throw error;
  }
};
