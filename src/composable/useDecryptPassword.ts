// AWS KMS decryption disabled - using mock data
// Uncomment below to re-enable AWS KMS decryption
// import { DecryptCommand } from "@aws-sdk/client-kms";
// import { getKmsClient } from "@/infra/crypto/client";
// import { Buffer } from "buffer";

/**
 * Composable for decrypting passwords
 * MOCK VERSION - API disabled
 * Uncomment the code below to re-enable AWS KMS decryption
 */
export default function useDecryptPassword() {
  const decryptPassword = async (
    encryptedPassword: string
  ): Promise<string> => {
    if (!encryptedPassword) {
      return "";
    }

    try {
      // === MOCK DATA IMPLEMENTATION ===
      // Simple mock decryption - just decode base64
      const decrypted = atob(encryptedPassword);
      await new Promise((resolve) => setTimeout(resolve, 100));
      return decrypted;
      // === END MOCK DATA ===

      // === REAL AWS KMS IMPLEMENTATION (COMMENTED) ===
      // Uncomment below to use real AWS KMS
      // const kms = await getKmsClient();
      // const cmd = new DecryptCommand({
      //   CiphertextBlob: Buffer.from(encryptedPassword, "base64"),
      // });
      // const res = await kms.send(cmd);
      //
      // if (!res.Plaintext) {
      //   throw new Error("復号化されたデータが空です");
      // }
      //
      // const decrypted = new TextDecoder().decode(res.Plaintext);
      // return decrypted;
      // === END REAL AWS KMS ===
    } catch (error) {
      console.error("[Mock Decrypt] Failed to decode password:", error);
      // Return a placeholder for invalid encrypted passwords
      return "mock-password-123";
    }
  };

  return {
    decryptPassword,
  };
}
