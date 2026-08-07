import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash?: string;
}

export function verifyTelegramWebAppData(
  data: Record<string, string>,
  botToken: string,
  userData?: any,
  initDataString?: string
): TelegramUser | null {
  try {
    if (!initDataString) {
      console.log("❌ Missing initData string");
      return null;
    }

    if (!botToken) {
      console.log("❌ Missing bot token");
      return null;
    }

    if (!data.hash) {
      console.log("❌ No hash found");
      return null;
    }

    console.log("🔐 Using Telegram hash verification");

    return verifyHash(
      initDataString,
      data.hash,
      botToken,
      userData
    );

  } catch (error) {
    console.error(
      "❌ Telegram verification error:",
      error
    );

    return null;
  }
}


function verifyHash(
  initDataString: string,
  receivedHash: string,
  botToken: string,
  userData?: any
): TelegramUser | null {

  try {

    const params = new URLSearchParams(initDataString);


    /*
      Telegram hash verification:
      Remove only hash.
      Keep signature because Telegram includes
      the original fields in newer WebApp payloads.
    */

    params.delete("hash");


    const dataCheckString = Array.from(
      params.entries()
    )
      .sort(([a], [b]) => a.localeCompare(b))
      .map(
        ([key, value]) => `${key}=${value}`
      )
      .join("\n");


    console.log(
      "========== DATA CHECK STRING =========="
    );

    console.log(dataCheckString);

    console.log(
      "======================================"
    );


    const secretKey = crypto
      .createHmac(
        "sha256",
        "WebAppData"
      )
      .update(botToken)
      .digest();


    const calculatedHash = crypto
      .createHmac(
        "sha256",
        secretKey
      )
      .update(dataCheckString)
      .digest("hex");


    console.log(
      "🔐 Hash comparison:"
    );

    console.log(
      "Expected:",
      receivedHash
    );

    console.log(
      "Generated:",
      calculatedHash
    );


    if (
      calculatedHash !== receivedHash
    ) {

      console.log(
        "❌ Telegram hash mismatch"
      );

      return null;
    }


    console.log(
      "✅ Telegram hash verification successful"
    );


    const authDate = Number(
      params.get("auth_date") || 0
    );


    const now = Math.floor(
      Date.now() / 1000
    );


    console.log(
      "Telegram auth date:",
      authDate
    );

    console.log(
      "Server timestamp:",
      now
    );


    if (
      now - authDate > 86400
    ) {

      console.log(
        "⚠️ Telegram auth expired"
      );

      return null;
    }


    if (!userData) {

      console.log(
        "❌ Missing Telegram user data"
      );

      return null;
    }


    return {
      id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      photo_url: userData.photo_url,
      auth_date: authDate,
      hash: receivedHash,
    };


  } catch (error) {

    console.error(
      "❌ Hash verification error:",
      error
    );

    return null;
  }
}