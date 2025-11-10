import { DecryptCommand } from "@aws-sdk/client-kms";
import { getKmsClient } from "@/infra/crypto/client";
import { Buffer } from "buffer";

/**
 * Composable for decrypting passwords using AWS KMS
 *
 * Uses AWS KMS DecryptCommand to decrypt passwords that were encrypted
 * using AWS KMS encryption. Requires proper Cognito authentication and
 * Identity Pool setup with KMS permissions.
 */
export default function useDecryptPassword() {
  const decryptPassword = async (
    encryptedPassword: string
  ): Promise<string> => {
    if (!encryptedPassword) {
      console.log("[Decrypt] Empty password");
      return "";
    }

    try {
      // Get KMS client with Cognito credentials
      const kms = await getKmsClient();

      // Create decrypt command with the encrypted password
      const cmd = new DecryptCommand({
        CiphertextBlob: Buffer.from(encryptedPassword, "base64"),
      });

      // Execute the decrypt command
      const res = await kms.send(cmd);

      // Decode the decrypted plaintext
      if (!res.Plaintext) {
        throw new Error("復号化されたデータが空です");
      }

      const decrypted = new TextDecoder().decode(res.Plaintext);

      return decrypted;
    } catch (error) {
      console.error("[Decrypt] パスワードの復号化に失敗しました:", error);
      console.error("[Decrypt] Error details:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error("パスワードの復号化に失敗しました");
    }
  };

  return {
    decryptPassword,
  };
}
